// ============================================================================
// PATCH A — fail-closed Polar webhook (verify BEFORE the dedupe INSERT)
// ----------------------------------------------------------------------------
// Replaces the whole `app.post("/api/polar/webhook", ...)` handler in the live
// polar-mcp Worker. Anchors:
//   START  line that reads exactly:  app.post("/api/polar/webhook", async (c) => {
//   END    the line *before*:        app.get("/api/polar/events", (c) => {
//
// What changes vs. live:
//   1. If the signature is not "valid", we return BEFORE touching D1 or the
//      in-memory event list. Previously the dedupe INSERT ran first, so an
//      unsigned POST burned the webhook-id and got a 200 — a later legitimate
//      retry with that id was then dropped as a duplicate.
//   2. no_secret  -> 503  (our misconfiguration, never permission to trust)
//      invalid    -> 401  (Polar retries on non-2xx, so nothing is lost)
//   3. Every rejection writes a `polar_webhook_rejected` audit entry with the
//      reason, so `GET /api/audit?action=polar_webhook_rejected` shows them.
//
// Everything after the gate is the live code unchanged, except that the
// now-redundant `&& verified === "valid"` is dropped from the entitlement gate.
// ============================================================================
app.post("/api/polar/webhook", async (c) => {
  const body = await c.req.text();
  const signature = c.req.header("webhook-signature") || c.req.header("X-Polar-Signature");
  const webhookId = c.req.header("webhook-id");
  const webhookTimestamp = c.req.header("webhook-timestamp");
  const polarSecret = c.env.POLAR_WEBHOOK_SECRET;
  const verified = await verifyPolarSignature(body, signature, polarSecret, webhookId, webhookTimestamp);
  // --- PATCH A gate: nothing below this line runs for an unverified delivery.
  if (verified !== "valid") {
    const reason = verified === "no_secret"
      ? "secret_not_configured"
      : (!signature ? "missing_signature" : "signature_mismatch");
    addAuditEntry("polar_webhook_rejected", "polar", webhookId || "unknown", {
      reason,
      verified,
      hasWebhookId: !!webhookId,
      hasTimestamp: !!webhookTimestamp,
      bodyBytes: body.length
    });
    if (verified === "no_secret") {
      console.error("Polar webhook rejected: POLAR_WEBHOOK_SECRET is not set; deliveries are being refused.");
      return c.json(
        { received: false, error: "Webhook verification is not configured; delivery refused.", reason },
        503
      );
    }
    console.warn(`Polar webhook rejected: ${reason}`);
    return c.json({ received: false, error: `Invalid signature: ${reason}`, reason }, 401);
  }
  // --- end PATCH A gate. Below is the live handler, verified deliveries only.
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }
  const eventType = parsed.type || parsed.event || "unknown";
  const eventId = webhookId || `polar_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const env2 = c.env;
  let persisted = false;
  let duplicate = false;
  let entitlement = null;
  try {
    const ins = await env2.DB.prepare(
      "INSERT OR IGNORE INTO polar_webhook_events (webhook_id, event_type, received_at) VALUES (?1, ?2, ?3)"
    ).bind(eventId, eventType, (/* @__PURE__ */ new Date()).toISOString()).run();
    persisted = true;
    duplicate = (ins.meta?.changes ?? 0) === 0;
    if (!duplicate) {
      if (eventType === "customer.state_changed") {
        const touched = await syncPolarCustomerState(env2, parsed, eventType, eventId);
        entitlement = touched.length ? touched.join(",") : null;
      } else {
        entitlement = await upsertPolarEntitlement(env2, parsed, eventType, eventId);
      }
    }
  } catch (err) {
    addAuditEntry("polar_webhook_persist_failed", "polar", eventId, {
      error: err instanceof Error ? err.message : String(err)
    });
  }
  const polarEvent = {
    id: eventId,
    type: eventType,
    verified,
    payload: parsed,
    receivedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  polarEvents.unshift(polarEvent);
  if (polarEvents.length > 200) polarEvents.length = 200;
  addAuditEntry("polar_webhook", "polar", eventId, {
    eventType,
    verified,
    persisted,
    duplicate,
    entitlement,
    keys: Object.keys(parsed)
  });
  broadcastEvent("polar.event", polarEvent);
  dispatchWebhooks("polar.event_received", {
    eventId,
    eventType,
    verified,
    payload: parsed
  });
  return c.json({ received: true, id: eventId, verified, persisted, duplicate, entitlement });
});
