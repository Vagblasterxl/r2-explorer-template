// ============================================================================
// PATCH B — Discord slash-command ingress onto the agent message bus
// ----------------------------------------------------------------------------
// INSERT this whole block into the live polar-mcp Worker immediately BEFORE
// the line that reads exactly:
//   app.get("/api/integrations/google/status", (c) => {
// (i.e. right after the closing `});` of the /api/integrations/slack/notify
// handler). Nothing else in the file needs to change.
//
// Routes added:
//   POST /api/integrations/discord/interactions   Discord Interactions Endpoint
//   GET  /api/integrations/discord/commands       /omega command manifest (JSON)
//
// Secrets read (set in Cloudflare -> polar-mcp -> Settings -> Variables):
//   DISCORD_PUBLIC_KEY    hex Ed25519 key from the app's General Information page
//   DISCORD_OPERATOR_IDS  comma-separated Discord user ids allowed to run /omega bind
//
// Authorization chain (deliberately in this order):
//   Discord user id -> discord_identities -> Polar customer
//                                         -> polar_entitlements.capabilities
// An unbound Discord account holds NO capabilities. send/inbox/ack need
// `comms.send`; bind needs `registry.admin` OR an id in DISCORD_OPERATOR_IDS
// (the operator list exists only to create the first binding).
//
// Ported from vagblasterxl/chanfana-openapi-template PR #2 (commit 93a5b01,
// 33 passing Discord tests) into plain JS / Hono. Reuses the live helpers
// `hexToBytes`, `addAuditEntry`, `shapeEntitlement`, `ensureCommsSchema`
// (all hoisted function declarations in this bundle).
// ============================================================================

// ---- Discord wire constants -------------------------------------------------
const DISCORD_INTERACTION_PING = 1;
const DISCORD_INTERACTION_APPLICATION_COMMAND = 2;
const DISCORD_RESPONSE_PONG = 1;
const DISCORD_RESPONSE_CHANNEL_MESSAGE = 4;
const DISCORD_FLAG_EPHEMERAL = 64;
const DISCORD_TIMESTAMP_TOLERANCE_SECONDS = 300;
const DISCORD_CONTENT_LIMIT = 1900;
const DISCORD_DEFAULT_INBOX_LIMIT = 5;
const DISCORD_MAX_INBOX_LIMIT = 25;
const DISCORD_AGENT_ID_PATTERN = /^[a-z0-9][a-z0-9._:-]{0,63}$/i;
const CAP_COMMS_SEND = "comms.send";
const CAP_REGISTRY_ADMIN = "registry.admin";

// ---- Ed25519 verification ---------------------------------------------------
// Discord signs `${x-signature-timestamp}${rawBody}`. There is no unverified
// path: a missing/malformed public key is a 503 (our outage), a bad signature
// is a 401 (Discord's endpoint registration probe REQUIRES the 401).
async function importDiscordPublicKey(raw) {
  try {
    return await crypto.subtle.importKey("raw", raw, { name: "Ed25519" }, false, ["verify"]);
  } catch {
    // Older workerd only knew Cloudflare's original spelling.
    return await crypto.subtle.importKey(
      "raw",
      raw,
      { name: "NODE-ED25519", namedCurve: "NODE-ED25519" },
      false,
      ["verify"]
    );
  }
}
function discordIsConfigFailure(reason) {
  return reason === "public_key_not_configured" || reason === "malformed_public_key";
}
async function verifyDiscordInteraction(rawBody, headers, publicKeyHex, now = /* @__PURE__ */ new Date()) {
  if (!publicKeyHex || publicKeyHex.trim() === "") {
    return { ok: false, reason: "public_key_not_configured" };
  }
  const publicKeyBytes = hexToBytes(publicKeyHex.trim());
  if (!publicKeyBytes || publicKeyBytes.byteLength !== 32) {
    return { ok: false, reason: "malformed_public_key" };
  }
  const signatureHex = headers.get("x-signature-ed25519");
  if (!signatureHex) return { ok: false, reason: "missing_signature" };
  const signature = hexToBytes(signatureHex.trim());
  if (!signature || signature.byteLength !== 64) {
    return { ok: false, reason: "malformed_signature" };
  }
  const timestampHeader = headers.get("x-signature-timestamp");
  if (!timestampHeader) return { ok: false, reason: "missing_timestamp" };
  const ts = timestampHeader.trim();
  if (!/^\d+$/.test(ts)) return { ok: false, reason: "malformed_timestamp" };
  const age = Math.abs(Math.floor(now.getTime() / 1e3) - Number(ts));
  if (age > DISCORD_TIMESTAMP_TOLERANCE_SECONDS) {
    return { ok: false, reason: "timestamp_out_of_tolerance" };
  }
  let key;
  try {
    key = await importDiscordPublicKey(publicKeyBytes);
  } catch {
    return { ok: false, reason: "malformed_public_key" };
  }
  let valid = false;
  try {
    valid = await crypto.subtle.verify(
      { name: key.algorithm.name },
      key,
      signature,
      new TextEncoder().encode(`${ts}${rawBody}`)
    );
  } catch {
    valid = false;
  }
  return valid ? { ok: true, timestamp: Number(ts) } : { ok: false, reason: "signature_mismatch" };
}

// ---- Schema (tables already exist in polar-mcp-db; this is belt-and-braces) --
let __discordSchemaReady = false;
async function ensureDiscordSchema(env2) {
  if (__discordSchemaReady) return;
  await ensureCommsSchema(env2);
  await env2.DB.prepare(
    "CREATE TABLE IF NOT EXISTS discord_identities (discord_user_id TEXT PRIMARY KEY NOT NULL, agent_id TEXT NOT NULL, polar_customer_id TEXT, discord_username TEXT, guild_id TEXT, bound_by TEXT NOT NULL, bound_at DATETIME NOT NULL)"
  ).run();
  await env2.DB.prepare(
    "CREATE INDEX IF NOT EXISTS idx_discord_identities_agent ON discord_identities (agent_id)"
  ).run();
  await env2.DB.prepare(
    "CREATE TABLE IF NOT EXISTS discord_interactions (interaction_id TEXT PRIMARY KEY NOT NULL, command TEXT NOT NULL, discord_user_id TEXT, received_at DATETIME NOT NULL)"
  ).run();
  __discordSchemaReady = true;
}

// ---- Interaction parsing ----------------------------------------------------
function discordReply(content, flags = DISCORD_FLAG_EPHEMERAL) {
  return { type: DISCORD_RESPONSE_CHANNEL_MESSAGE, data: { content, flags } };
}
const DISCORD_PONG = { type: DISCORD_RESPONSE_PONG };
function discordInvokerOf(interaction) {
  const user = interaction?.member?.user ?? interaction?.user;
  if (!user || typeof user.id !== "string") return null;
  return { id: user.id, username: typeof user.username === "string" ? user.username : null };
}
// Flattens `/omega send recipient:x` (nested as data.options[0].options) into
// { name: "omega.send", options: Map }.
function discordParseCommand(interaction) {
  const data = interaction?.data;
  if (!data || typeof data.name !== "string") return null;
  const path = [data.name];
  let options = Array.isArray(data.options) ? data.options : [];
  while (options.length === 1 && (options[0].type === 1 || options[0].type === 2)) {
    path.push(options[0].name);
    options = Array.isArray(options[0].options) ? options[0].options : [];
  }
  const flat = /* @__PURE__ */ new Map();
  for (const o of options) {
    if (o && typeof o.name === "string" && o.value !== void 0) flat.set(o.name, o.value);
  }
  return { name: path.join("."), options: flat };
}
function discordOptionString(cmd, name) {
  const v = cmd.options.get(name);
  if (v === void 0) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}
function discordOptionInteger(cmd, name) {
  const v = cmd.options.get(name);
  if (v === void 0) return null;
  const n = typeof v === "number" ? v : Number(String(v).trim());
  return Number.isInteger(n) ? n : null;
}
function discordTruncate(value, limit = DISCORD_CONTENT_LIMIT) {
  return value.length <= limit ? value : `${value.slice(0, limit - 1)}…`;
}
function discordSummarizePayload(payload) {
  if (!payload) return "_empty_";
  try {
    const p = JSON.parse(payload);
    if (p && typeof p === "object" && typeof p.text === "string") return discordTruncate(p.text, 160);
  } catch {
  }
  return discordTruncate(payload, 160);
}
function parseDiscordOperatorIds(value) {
  if (!value) return /* @__PURE__ */ new Set();
  return new Set(value.split(/[,;\s]+/).map((s) => s.trim()).filter((s) => s !== ""));
}

// ---- D1 access --------------------------------------------------------------
// Claim the interaction id. `false` => Discord already delivered it (the
// command ran, only the reply was lost) so it must not run twice.
async function discordClaimInteraction(env2, interactionId, command, discordUserId, receivedAt) {
  const r = await env2.DB.prepare(
    "INSERT OR IGNORE INTO discord_interactions (interaction_id, command, discord_user_id, received_at) VALUES (?, ?, ?, ?)"
  ).bind(interactionId, command, discordUserId, receivedAt).run();
  return (r.meta?.changes ?? 0) > 0;
}
async function discordLookupIdentity(env2, discordUserId) {
  return await env2.DB.prepare("SELECT * FROM discord_identities WHERE discord_user_id = ?").bind(discordUserId).first();
}
async function discordBindIdentity(env2, identity, boundAt) {
  await env2.DB.prepare(
    `INSERT INTO discord_identities (discord_user_id, agent_id, polar_customer_id, discord_username, guild_id, bound_by, bound_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(discord_user_id) DO UPDATE SET
       agent_id = excluded.agent_id,
       polar_customer_id = excluded.polar_customer_id,
       discord_username = excluded.discord_username,
       guild_id = excluded.guild_id,
       bound_by = excluded.bound_by,
       bound_at = excluded.bound_at`
  ).bind(
    identity.discord_user_id,
    identity.agent_id,
    identity.polar_customer_id,
    identity.discord_username,
    identity.guild_id,
    identity.bound_by,
    boundAt
  ).run();
}
// Capabilities = union over ACTIVE entitlement rows whose Polar customer id OR
// external customer id (e.g. "agent:claude:cannon") matches. Same source the
// rest of the mesh authorizes against (/api/polar/entitlements/check).
async function discordCustomerCapabilities(env2, customer) {
  const { results } = await env2.DB.prepare(
    "SELECT * FROM polar_entitlements WHERE (customer_id = ?1 OR external_customer_id = ?1) AND active = 1"
  ).bind(customer).all();
  const caps = /* @__PURE__ */ new Set();
  for (const r of (results || []).map(shapeEntitlement)) for (const x of r.capabilities) caps.add(x);
  return Array.from(caps).sort();
}
// Same row shape /api/comms/send writes. classification is left NULL on
// purpose: Discord gives us 3 s to answer and the doorman AI call can eat it.
async function discordSendBusMessage(env2, message, createdAt) {
  const r = await env2.DB.prepare(
    "INSERT INTO comms_messages (sender, recipient, message_type, payload, processed, ack_sent, created_at, classification) VALUES (?, ?, ?, ?, 0, 0, ?, NULL)"
  ).bind(
    message.sender,
    message.recipient,
    message.message_type,
    typeof message.payload === "string" ? message.payload : JSON.stringify(message.payload ?? ""),
    createdAt
  ).run();
  return Number(r.meta?.last_row_id ?? 0);
}
async function discordReadInbox(env2, recipient, limit) {
  const { results } = await env2.DB.prepare(
    "SELECT id, sender, recipient, message_type, payload, created_at, classification FROM comms_messages WHERE recipient = ? AND processed = 0 ORDER BY id ASC LIMIT ?"
  ).bind(recipient, limit).all();
  return results || [];
}
// Scoped to the recipient: a bus id is a guessable integer, so `comms.send`
// must not let one agent silence another's inbox.
async function discordAckBusMessage(env2, id, recipient) {
  const r = await env2.DB.prepare(
    "UPDATE comms_messages SET processed = 1, ack_sent = 1 WHERE id = ? AND recipient = ? AND processed = 0"
  ).bind(id, recipient).run();
  return (r.meta?.changes ?? 0) > 0;
}
async function discordBusHealth(env2) {
  const row = await env2.DB.prepare(
    "SELECT COUNT(*) AS total, COALESCE(SUM(processed), 0) AS processed FROM comms_messages"
  ).first();
  return { total: Number(row?.total ?? 0), processed: Number(row?.processed ?? 0) };
}

// ---- Command dispatch -------------------------------------------------------
async function discordResolveCaller(env2, ctx) {
  const identity = await discordLookupIdentity(env2, ctx.invoker.id);
  const isOperator = ctx.operatorIds.has(ctx.invoker.id);
  if (!identity?.polar_customer_id) return { identity, capabilities: [], isOperator };
  const capabilities = await discordCustomerCapabilities(env2, identity.polar_customer_id);
  return { identity, capabilities, isOperator };
}
function discordHolds(caller, cap) {
  return caller.capabilities.includes(cap);
}
function discordDenied(cap, caller) {
  if (!caller.identity) {
    return discordReply(
      "Not bound. This Discord account is not mapped to an agent, so it holds no capabilities. An operator binds it with `/omega bind`."
    );
  }
  if (!caller.identity.polar_customer_id) {
    return discordReply(
      `Bound to \`${caller.identity.agent_id}\` but with no Polar customer, so no capabilities resolve. Re-bind with the \`customer\` option set.`
    );
  }
  const held = caller.capabilities.length ? caller.capabilities.map((c) => `\`${c}\``).join(", ") : "nothing";
  return discordReply(
    `\`${cap}\` required. \`${caller.identity.agent_id}\` currently holds ${held}. Capabilities come from the Polar subscription — attach the benefit there.`
  );
}
async function discordHandleStatus(env2, ctx, caller) {
  const { total, processed } = await discordBusHealth(env2);
  const open = total - processed;
  return discordReply(
    `**Bus** ${total} message${total === 1 ? "" : "s"}, ${open} open, ${processed} acknowledged.
**You** ${caller.identity ? `\`${caller.identity.agent_id}\`` : "unbound"}${caller.isOperator ? " · operator" : ""}.`
  );
}
function discordHandleWhoami(caller) {
  if (!caller.identity) return discordReply("Unbound — no agent, no Polar customer, no capabilities.");
  const lines = [
    `**Agent** \`${caller.identity.agent_id}\``,
    `**Polar customer** ${caller.identity.polar_customer_id ? `\`${caller.identity.polar_customer_id}\`` : "_none — capabilities cannot resolve_"}`,
    `**Capabilities** ${caller.capabilities.length ? caller.capabilities.map((c) => `\`${c}\``).join(", ") : "_none_"}`,
    `**Bound** ${caller.identity.bound_at} by \`${caller.identity.bound_by}\``
  ];
  if (caller.isOperator) lines.push("**Operator** yes — may run `bind`");
  return discordReply(lines.join("\n"));
}
async function discordHandleBind(env2, cmd, ctx, caller) {
  if (!caller.isOperator && !discordHolds(caller, CAP_REGISTRY_ADMIN)) return discordDenied(CAP_REGISTRY_ADMIN, caller);
  const agentId = discordOptionString(cmd, "agent");
  if (!agentId || !DISCORD_AGENT_ID_PATTERN.test(agentId)) {
    return discordReply("`agent` is required and must look like an agent id (letters, digits, `.`, `_`, `:`, `-`).");
  }
  const targetId = discordOptionString(cmd, "user") ?? ctx.invoker.id;
  if (!/^\d{5,32}$/.test(targetId)) {
    return discordReply("`user` must be a Discord user id (the numeric id, not a @mention).");
  }
  const customerId = discordOptionString(cmd, "customer");
  const username = targetId === ctx.invoker.id ? ctx.invoker.username : discordOptionString(cmd, "username");
  await discordBindIdentity(env2, {
    discord_user_id: targetId,
    agent_id: agentId,
    polar_customer_id: customerId,
    discord_username: username,
    guild_id: ctx.guildId,
    bound_by: ctx.invoker.id
  }, ctx.now);
  addAuditEntry("discord_bind", "discord", targetId, { agentId, customerId, boundBy: ctx.invoker.id });
  const caveat = customerId ? "" : "\n⚠ No `customer` given, so this binding resolves to **no capabilities**. `send`, `inbox` and `ack` will all refuse until it is re-bound with one.";
  return discordReply(`Bound \`${targetId}\` → \`${agentId}\`${customerId ? ` (Polar customer \`${customerId}\`)` : ""}.${caveat}`);
}
async function discordHandleSend(env2, cmd, ctx, caller) {
  if (!discordHolds(caller, CAP_COMMS_SEND)) return discordDenied(CAP_COMMS_SEND, caller);
  const recipient = discordOptionString(cmd, "recipient");
  const text = discordOptionString(cmd, "message");
  if (!recipient || !DISCORD_AGENT_ID_PATTERN.test(recipient)) return discordReply("`recipient` is required and must be an agent id.");
  if (!text) return discordReply("`message` is required.");
  const sender = caller.identity?.agent_id ?? `discord:${ctx.invoker.id}`;
  const messageType = discordOptionString(cmd, "type") ?? "discord.relay";
  // Payload keeps the shape existing discord-relay consumers read
  // (text/from/channel_id/via) and adds provenance.
  const id = await discordSendBusMessage(env2, {
    sender,
    recipient,
    message_type: messageType,
    payload: {
      text,
      from: sender,
      channel_id: ctx.channelId,
      via: "discord-relay",
      discord_user_id: ctx.invoker.id,
      discord_username: ctx.invoker.username,
      guild_id: ctx.guildId,
      interaction_id: ctx.interactionId
    }
  }, ctx.now);
  addAuditEntry("comms.send", "mcp", recipient, { sender, message_type: messageType, via: "discord" });
  return discordReply(`Queued **#${id}** for \`${recipient}\` as \`${messageType}\`, from \`${sender}\`.`);
}
async function discordHandleInbox(env2, cmd, ctx, caller) {
  if (!discordHolds(caller, CAP_COMMS_SEND)) return discordDenied(CAP_COMMS_SEND, caller);
  const recipient = discordOptionString(cmd, "recipient") ?? caller.identity?.agent_id;
  if (!recipient || !DISCORD_AGENT_ID_PATTERN.test(recipient)) return discordReply("`recipient` is required and must be an agent id.");
  const requested = discordOptionInteger(cmd, "limit") ?? DISCORD_DEFAULT_INBOX_LIMIT;
  const limit = Math.min(Math.max(requested, 1), DISCORD_MAX_INBOX_LIMIT);
  const messages = await discordReadInbox(env2, recipient, limit);
  if (messages.length === 0) return discordReply(`\`${recipient}\` has no open messages.`);
  const lines = messages.map(
    (m) => `**#${m.id}** \`${m.message_type ?? "?"}\` from \`${m.sender ?? "?"}\`${m.classification ? ` · ${m.classification}` : ""} — ${discordSummarizePayload(m.payload)}`
  );
  return discordReply(discordTruncate(`\`${recipient}\` — ${messages.length} open (oldest ${limit} shown)\n${lines.join("\n")}`));
}
async function discordHandleAck(env2, cmd, ctx, caller) {
  if (!discordHolds(caller, CAP_COMMS_SEND)) return discordDenied(CAP_COMMS_SEND, caller);
  const id = discordOptionInteger(cmd, "id");
  if (id === null || id < 1) return discordReply("`id` is required and must be a bus message id.");
  const recipient = caller.identity?.agent_id;
  if (!recipient) return discordReply("Not bound to an agent, so there is no inbox to acknowledge.");
  const acked = await discordAckBusMessage(env2, id, recipient);
  // Does not distinguish "no such message" from "addressed to someone else".
  if (!acked) return discordReply(`No open message **#${id}** addressed to \`${recipient}\`.`);
  return discordReply(`Acknowledged **#${id}** for \`${recipient}\`.`);
}
async function discordDispatchCommand(env2, cmd, ctx) {
  const caller = await discordResolveCaller(env2, ctx);
  switch (cmd.name) {
    case "omega.status":
      return await discordHandleStatus(env2, ctx, caller);
    case "omega.whoami":
      return discordHandleWhoami(caller);
    case "omega.bind":
      return await discordHandleBind(env2, cmd, ctx, caller);
    case "omega.send":
      return await discordHandleSend(env2, cmd, ctx, caller);
    case "omega.inbox":
      return await discordHandleInbox(env2, cmd, ctx, caller);
    case "omega.ack":
      return await discordHandleAck(env2, cmd, ctx, caller);
    default:
      return discordReply(
        `Unknown command \`/${cmd.name.replace(/\./g, " ")}\`. Available: \`status\`, \`whoami\`, \`bind\`, \`send\`, \`inbox\`, \`ack\`.`
      );
  }
}

// ---- /omega command manifest (Discord application-command shape) -----------
// Served by GET /api/integrations/discord/commands so the registered surface
// cannot drift from the handled one. Register with:
//   curl -X PUT -H "Authorization: Bot $DISCORD_BOT_TOKEN" -H "Content-Type: application/json" \
//     --data @commands.json "https://discord.com/api/v10/applications/$DISCORD_APPLICATION_ID/commands"
const DISCORD_OPT_SUB_COMMAND = 1;
const DISCORD_OPT_STRING = 3;
const DISCORD_OPT_INTEGER = 4;
const DISCORD_OMEGA_COMMAND = {
  name: "omega",
  description: "Talk to the agent mesh",
  dm_permission: false,
  options: [
    { name: "status", description: "Bus totals and whether this account is bound", type: DISCORD_OPT_SUB_COMMAND },
    { name: "whoami", description: "The agent, Polar customer, and capabilities behind this account", type: DISCORD_OPT_SUB_COMMAND },
    {
      name: "send",
      description: "Queue a message for an agent",
      type: DISCORD_OPT_SUB_COMMAND,
      options: [
        { name: "recipient", description: "Agent id to deliver to", type: DISCORD_OPT_STRING, required: true },
        { name: "message", description: "Message body", type: DISCORD_OPT_STRING, required: true },
        { name: "type", description: "Message type (default discord.relay)", type: DISCORD_OPT_STRING, required: false }
      ]
    },
    {
      name: "inbox",
      description: "Open messages for an agent (defaults to your own)",
      type: DISCORD_OPT_SUB_COMMAND,
      options: [
        { name: "recipient", description: "Agent id (defaults to the agent you are bound to)", type: DISCORD_OPT_STRING, required: false },
        { name: "limit", description: "How many to show (1-25, default 5)", type: DISCORD_OPT_INTEGER, required: false }
      ]
    },
    {
      name: "ack",
      description: "Acknowledge a message addressed to your agent",
      type: DISCORD_OPT_SUB_COMMAND,
      options: [{ name: "id", description: "Bus message id", type: DISCORD_OPT_INTEGER, required: true }]
    },
    {
      name: "bind",
      description: "Map a Discord account to an agent and Polar customer (operator or registry.admin)",
      type: DISCORD_OPT_SUB_COMMAND,
      options: [
        { name: "agent", description: "Agent id to bind to", type: DISCORD_OPT_STRING, required: true },
        { name: "customer", description: "Polar customer id or external id — the source of the agent's capabilities", type: DISCORD_OPT_STRING, required: false },
        { name: "user", description: "Discord user id to bind (defaults to you)", type: DISCORD_OPT_STRING, required: false },
        { name: "username", description: "Label for the bound account, when binding someone else", type: DISCORD_OPT_STRING, required: false }
      ]
    }
  ]
};
const DISCORD_COMMAND_MANIFEST = [DISCORD_OMEGA_COMMAND];

// ---- Routes -----------------------------------------------------------------
app.get("/api/integrations/discord/commands", (c) => c.json(DISCORD_COMMAND_MANIFEST));
app.post("/api/integrations/discord/interactions", async (c) => {
  const env2 = c.env;
  // The signature covers the exact bytes Discord sent: read raw before parsing.
  const rawBody = await c.req.text();
  const verification = await verifyDiscordInteraction(rawBody, c.req.raw.headers, getEnv(c, "DISCORD_PUBLIC_KEY"));
  if (!verification.ok) {
    addAuditEntry("discord_interaction_rejected", "discord", "interactions", { reason: verification.reason });
    if (discordIsConfigFailure(verification.reason)) {
      console.error(`Discord interaction rejected: ${verification.reason}. Interactions cannot be authenticated and are being refused.`);
      return c.json(
        {
          error: "Interaction verification is not configured; request refused.",
          reason: verification.reason,
          setup: "Set via: wrangler secret put DISCORD_PUBLIC_KEY — Discord Developer Portal → your app → General Information → Public Key"
        },
        503
      );
    }
    // Discord's endpoint registration sends a mis-signed probe and only accepts
    // the URL if this is a 401.
    console.warn(`Discord interaction rejected: ${verification.reason}`);
    return c.json({ error: `Invalid signature: ${verification.reason}`, reason: verification.reason }, 401);
  }
  let interaction;
  try {
    interaction = JSON.parse(rawBody);
  } catch {
    interaction = null;
  }
  if (!interaction || typeof interaction !== "object" || typeof interaction.id !== "string" || typeof interaction.type !== "number") {
    return c.json({ error: "Malformed Discord interaction" }, 400);
  }
  // Discord PINGs a newly registered endpoint and keeps doing so for liveness.
  if (interaction.type === DISCORD_INTERACTION_PING) return c.json(DISCORD_PONG, 200);
  if (interaction.type !== DISCORD_INTERACTION_APPLICATION_COMMAND) {
    return c.json(discordReply("This endpoint handles slash commands only; it registers no components, modals, or autocomplete."), 200);
  }
  const cmd = discordParseCommand(interaction);
  const invoker = discordInvokerOf(interaction);
  if (!cmd || !invoker) return c.json(discordReply("Could not read the command or who sent it."), 200);
  await ensureDiscordSchema(env2);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  // Discord retries an interaction it got no reply to within 3 s. Claim the id
  // first so a lost reply cannot turn one `/omega send` into two bus rows.
  const first = await discordClaimInteraction(env2, interaction.id, cmd.name, invoker.id, now);
  if (!first) {
    return c.json(
      discordReply(`\`/${cmd.name.replace(/\./g, " ")}\` already ran — this is a retry of an interaction whose reply was lost, so it was not applied twice.`),
      200
    );
  }
  addAuditEntry("discord_command", "discord", cmd.name, { userId: invoker.id, guildId: interaction.guild_id ?? null });
  const response = await discordDispatchCommand(env2, cmd, {
    invoker,
    guildId: interaction.guild_id ?? null,
    channelId: interaction.channel_id ?? null,
    interactionId: interaction.id,
    operatorIds: parseDiscordOperatorIds(getEnv(c, "DISCORD_OPERATOR_IDS")),
    now
  });
  return c.json(response, 200);
});
// ============================================================================
// end PATCH B
// ============================================================================
