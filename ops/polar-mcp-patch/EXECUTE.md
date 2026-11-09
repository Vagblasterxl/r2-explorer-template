# EXECUTE — ship Patch A + Patch B to the live `polar-mcp` Worker

Target: Worker **`polar-mcp`**, Cloudflare account `ab02f4df…` (kenwsimmons),
D1 **`polar-mcp-db`** (`f7d1f983-314f-4e81-8658-edf692a6eaa7`),
URL `https://polar-mcp.kenwsimmons.workers.dev`.

Verified on 2026-11-09 against the live dump (6,047 code lines once the API
wrapper is stripped; the dashboard editor may show 6,048): **neither marker is
present**, so the full-file paste path is safe. `PATCHED.js` is 6,616 lines. The D1 tables Patch B needs (`discord_identities`,
`discord_interactions`, `comms_messages`) already exist and are empty of
Discord rows. No migration is needed.

Anything that writes to the Cloudflare account or Discord is a **human (or
browser-agent) step**. This session has read-only API access and produced the
files only.

---

## 0. Decide (already recommended)

- **Conflict a** — use *this* kit's fail-closed `401`/`503` responses, not the
  earlier throw-based fix. A throw is a 500 with no reason and no audit row;
  Polar retries on either, so nothing is gained by throwing.
- Patch A deliberately does **not** add a timestamp replay window. The live
  verifier accepts both Polar signing styles (with and without
  `webhook-id.webhook-timestamp.`), and tightening that is a separate change.

## 1. Secrets (Cloudflare → Workers & Pages → `polar-mcp` → Settings → Variables)

| Secret | Needed by | Where to get it |
|---|---|---|
| `POLAR_WEBHOOK_SECRET` | Patch A (already set — entitlements updated 2026-11-02) | Polar → Settings → Webhooks |
| `DISCORD_PUBLIC_KEY` | Patch B | Discord Developer Portal → *your app* → General Information → **Public Key** (64 hex chars) |
| `DISCORD_OPERATOR_IDS` | Patch B (`/omega bind` bootstrap) | Your own Discord user id(s), comma-separated. Discord → Settings → Advanced → Developer Mode on, then right-click your name → Copy User ID |

Add `DISCORD_*` **before** deploying Patch B. Until `DISCORD_PUBLIC_KEY` is set
every interaction gets a `503` — correct, but Discord will refuse to save the
endpoint URL.

## 2. Deploy the code

### Option A — full-file paste (preferred; valid while the editor shows ~6,048 lines and neither marker)

1. Cloudflare → `polar-mcp` → **Edit code**.
2. In the editor, `Ctrl+F` for `polar_webhook_rejected` → must be **0 hits**, and
   `api/integrations/discord/interactions` → **0 hits**. If either hits, STOP and
   use Option B.
3. Select all, delete, paste the whole of **`polar-mcp.index.PATCHED.js`**.
4. **Save and deploy.**

### Option B — surgical inserts (if the live file drifted)

1. Replace the entire `app.post("/api/polar/webhook", async (c) => { … });`
   handler — from that exact line down to (not including)
   `app.get("/api/polar/events", (c) => {` — with the contents of **`patchA.js`**.
2. Insert the contents of **`patchB.js`** immediately **before** the line
   `app.get("/api/integrations/google/status", (c) => {`.
3. Save and deploy.

### Rebuilding `PATCHED.js` from a newer live dump

```bash
./build-patched.sh <fresh-live-dump.js>
```

It strips the API wrapper, refuses if a marker is already present, locates the
three anchors, splices, and `node --check`s the result.

## 3. Verify Patch A (≈1 minute)

```bash
BASE=https://polar-mcp.kenwsimmons.workers.dev

# unsigned delivery must now be refused BEFORE touching D1
curl -s -o /dev/null -w '%{http_code}\n' -X POST "$BASE/api/polar/webhook" \
  -H 'content-type: application/json' -d '{"type":"probe.unsigned"}'
# expect 401  (503 would mean POLAR_WEBHOOK_SECRET is missing)

# the rejection is audited
curl -s "$BASE/api/audit?action=polar_webhook_rejected" | head -c 600; echo
```

Then in D1 (dashboard → D1 → `polar-mcp-db` → Console):

```sql
SELECT COUNT(*) FROM polar_webhook_events WHERE event_type = 'probe.unsigned';
-- expect 0: the probe never reached the dedupe INSERT
```

Finally, in Polar → Settings → Webhooks → your endpoint → **Send test event**
and confirm `GET /api/polar/events?limit=1` shows it with `"verified":"valid"`.

## 4. Verify Patch B (before touching Discord)

```bash
curl -s "$BASE/api/integrations/discord/commands" | head -c 300; echo
# expect the [ { "name": "omega", ... } ] manifest

curl -s -o /dev/null -w '%{http_code}\n' -X POST "$BASE/api/integrations/discord/interactions" \
  -H 'content-type: application/json' -d '{"id":"1","type":1}'
# expect 401 (missing signature). 503 => DISCORD_PUBLIC_KEY not set yet.
```

## 5. Wire Discord (Developer Portal, one login)

1. *Your app* → **General Information** → **Interactions Endpoint URL** =
   `https://polar-mcp.kenwsimmons.workers.dev/api/integrations/discord/interactions`
   → Save. Discord sends a PING and a deliberately mis-signed probe; the Worker
   answers PONG and `401`, and Discord accepts the URL. If it refuses, the public
   key secret is wrong (step 1).
2. Register the `/omega` command tree (bulk overwrite — safe to repeat):

   ```bash
   curl -s -X PUT \
     -H "Authorization: Bot $DISCORD_BOT_TOKEN" \
     -H "Content-Type: application/json" \
     --data @discord-commands.json \
     "https://discord.com/api/v10/applications/$DISCORD_APPLICATION_ID/commands"
   ```

   (`discord-commands.json` here is byte-identical to what the Worker serves at
   `/api/integrations/discord/commands`.) Global commands can take up to an hour
   to appear; for instant testing use the guild route
   `/applications/$APP_ID/guilds/$GUILD_ID/commands` instead.
3. Install the app in the guild with the `applications.commands` scope.

## 6. Bind the four agents (in Discord, as an operator)

Capabilities resolve from `polar_entitlements` by **Polar customer id or external
id**, so the `agent:…` external ids work as `customer`:

```
/omega bind agent:agent:claude:cannon     customer:agent:claude:cannon     user:<cannon's discord id>
/omega bind agent:agent:spark:a           customer:agent:spark:a           user:<spark a's discord id>
/omega bind agent:agent:spark:b           customer:agent:spark:b           user:<spark b's discord id>
/omega bind agent:agent:grok:fayetteville customer:agent:grok:fayetteville user:<grok's discord id>
/omega whoami
```

Then `/omega status`, and from a `comms.send` holder:
`/omega send recipient:agent:claude:cannon message:hello from discord`
→ confirm the row with `GET /api/comms/inbox?recipient=agent:claude:cannon`.

### ⚠ Capability gap to decide in Polar
As of 2026-11-02 only **`agent:spark:a`** (OMEGA Role - Receiver) holds
`comms.send`. Cannon (Warden: `registry.admin`, `vault.read`, `mesh.dispatch`)
can **bind** but cannot `send`/`inbox`/`ack`; the two Seats hold only
`mesh.dispatch`. If Cannon or the Seats should talk through Discord, attach a
`feature_flag` benefit with `metadata.cap = comms.send` to those products in
Polar. The next `customer.state_changed` webhook updates the rows; nothing in
the Worker needs to change.

## 7. Rollback

Cloudflare → `polar-mcp` → **Deployments** → previous version → **Rollback**.
Patch B's tables are additive; Patch A changes no schema. Nothing to undo in D1.

## What's in this folder

| File | Purpose |
|---|---|
| `polar-mcp.index.PATCHED.js` | Full live Worker (dump of 2026-11-09) with both patches applied — Option A paste |
| `patchA.js` | Fail-closed webhook handler — Option B replacement block |
| `patchB.js` | Discord ingress — Option B insert block |
| `discord-commands.json` | `/omega` manifest for `PUT /applications/{id}/commands` |
| `build-patched.sh` | Rebuilds `PATCHED.js` from a fresh live dump, with anchor + syntax checks |
| `test-patchB.mjs` | Offline smoke test of Patch B (real Ed25519 keypair, in-memory D1) — `node test-patchB.mjs` |
