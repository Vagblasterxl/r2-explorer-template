# AGENT RUNBOOK — deploy the polar-mcp patch kit and wire Discord

**Written for AI agents, not for Ken.** Two agents work it in parallel:

- **DC** = Claude with Desktop Commander (shell and files on Ken's machine).
- **CiC** = Claude in Chrome (Ken's logged-in browser: Cloudflare dashboard, Discord Developer Portal, Discord web).

Ken relays REPORT blocks between agents and does the one step marked **KEN**. He does not need to understand any of it. Every phase ends with a **REPORT** block; fill it in word for word and give it to Ken.

Kit (public, no login needed):
`https://github.com/Vagblasterxl/r2-explorer-template/tree/claude/sleepy-goodall-56ldt1/ops/polar-mcp-patch`
Raw base: `https://raw.githubusercontent.com/Vagblasterxl/r2-explorer-template/claude/sleepy-goodall-56ldt1/ops/polar-mcp-patch/`

| Target | Value |
|---|---|
| Cloudflare account | **Kenwsimmons@hotmail.com's Account**, id `ab02f4dfa746bf2e6b3d9ff634bb135a`. Not Assblasterxl, not `9e6e291d…`. |
| Worker | `polar-mcp` at `https://polar-mcp.kenwsimmons.workers.dev` |
| D1 | `polar-mcp-db` — nothing to migrate; Patch B's tables already exist |
| Live editor size before paste | ~6,047–6,048 lines |
| `polar-mcp.index.PATCHED.js` | 6,616 lines · sha256 `218960dbed41ee1a1072036fe02187b0dab490820bbf6e68e186dbbdc813996e` |
| `discord-commands.json` | sha256 `6b1a16cdbed4de64f8b1d5b91d293811a39a7ab8bdeb0724235be6a52055408b` |

## Rules for both agents

1. **Secrets never appear in chat, reports, logs or any file not named here.** The Discord Public Key, the Bot Token and every Cloudflare secret move only browser tab → browser form (CiC) or file → environment variable (DC). About to print one? Write `<redacted>` instead.
2. **Touch only what a step names.** No other Workers, secrets, bindings, routes, DNS, or D1 writes.
3. **STOP means stop.** Fill in the REPORT with what you saw and end the phase. No improvised workarounds.
4. **Never run `wrangler deploy` against `polar-mcp`.** Without the original wrangler config it would strip the Worker's D1/AI/KV/R2/Vectorize/Durable Object bindings. The dashboard editor keeps them.
5. **Report exact values** (HTTP codes, line counts, version ids). Never paraphrase a number.

---

## Phase 1 — DC: fetch the kit, verify it, record the live baseline

Needs `git`, `node` ≥ 18, `curl` (`node --version`).

```bash
mkdir -p ~/omega && cd ~/omega
git clone --depth 1 --branch claude/sleepy-goodall-56ldt1 \
  https://github.com/Vagblasterxl/r2-explorer-template.git patch-kit
cd patch-kit/ops/polar-mcp-patch

wc -l polar-mcp.index.PATCHED.js                                        # 6616
sha256sum polar-mcp.index.PATCHED.js 2>/dev/null || shasum -a 256 polar-mcp.index.PATCHED.js   # 218960db…
grep -c polar_webhook_rejected polar-mcp.index.PATCHED.js               # 3
grep -c 'api/integrations/discord/interactions' polar-mcp.index.PATCHED.js   # 2
node test-patchB.mjs | tail -1                                          # ALL PASSED
```

Any number off → STOP and report.

Baseline (the first call returning `200` is the bug; it is expected *before* the patch):

```bash
BASE=https://polar-mcp.kenwsimmons.workers.dev
echo "baseline webhook:      $(curl -s -o /dev/null -w '%{http_code}' -X POST $BASE/api/polar/webhook -H 'content-type: application/json' -d '{"type":"probe.unsigned.baseline"}')"
echo "baseline manifest:     $(curl -s -o /dev/null -w '%{http_code}' $BASE/api/integrations/discord/commands)"
echo "baseline interactions: $(curl -s -o /dev/null -w '%{http_code}' -X POST $BASE/api/integrations/discord/interactions -H 'content-type: application/json' -d '{"id":"1","type":1}')"
echo "raw PATCHED reachable: $(curl -s -o /dev/null -w '%{http_code}' https://raw.githubusercontent.com/Vagblasterxl/r2-explorer-template/claude/sleepy-goodall-56ldt1/ops/polar-mcp-patch/polar-mcp.index.PATCHED.js)"
```

Expected: `200`, `404`, `404`, `200`.

**REPORT (Phase 1 / DC)**
```
PHASE 1 / DC
PATCHED.js lines: ____  sha256 starts: ________
markers: rejected=__ discord=__   test-patchB: ________
baseline: webhook=___ manifest=___ interactions=___ raw=___
```
Then wait for a Phase 2 report.

---

## Phase 2 — CiC: Discord values, Cloudflare secrets, paste, deploy

### 2a. Discord Developer Portal — read values (change nothing)
1. `https://discord.com/developers/applications` → open the OMEGA application. If several and unsure which, list their names in the REPORT and STOP.
2. **General Information**: note the **Application ID** (not secret; goes in the REPORT). Find the **Public Key** (64 hex chars). Leave this tab open for 2c. Do not write the key anywhere.
3. Do **not** set the *Interactions Endpoint URL* yet. That is Phase 4; Discord would test it against the unpatched Worker and refuse.

### 2b. Discord web — Ken's user id and the server id
1. `https://discord.com/app` → User Settings (gear) → **Advanced** → **Developer Mode** on.
2. Right-click Ken's own name → **Copy User ID** (17–19 digits, not secret) → REPORT as `operator_id`.
3. Right-click the server where `/omega` should work → **Copy Server ID** → REPORT as `guild_id`.

### 2c. Cloudflare — add the two secrets
1. `https://dash.cloudflare.com` → choose **Kenwsimmons@hotmail.com's Account**. The URL must contain `ab02f4dfa746bf2e6b3d9ff634bb135a`; if not, switch accounts. Never proceed on another account.
2. **Workers & Pages** → **polar-mcp** → **Settings** → **Variables and Secrets**.
3. **Add** → type **Secret** → name `DISCORD_PUBLIC_KEY` → value = Public Key from the Discord tab → Save/Deploy.
4. **Add** → type **Secret** → name `DISCORD_OPERATOR_IDS` → value = `operator_id` → Save/Deploy.
5. Confirm both names are listed **and** `POLAR_WEBHOOK_SECRET` is already there. If `POLAR_WEBHOOK_SECRET` is missing → STOP (Patch A would 503 every Polar delivery).

### 2d. Cloudflare — paste the patched Worker
1. **polar-mcp** → **Edit code**. Wait for `index.js` to load.
2. Click in the editor, `Ctrl+End` (Mac `Cmd+↓`), record the **last line number**. Expect ~6,047–6,048. Above ~6,500 → already patched → STOP.
3. `Ctrl+F`: `polar_webhook_rejected` → hits? `api/integrations/discord/interactions` → hits? **Both must be 0.** Otherwise STOP; do not paste.
4. New tab: `https://raw.githubusercontent.com/Vagblasterxl/r2-explorer-template/claude/sleepy-goodall-56ldt1/ops/polar-mcp-patch/polar-mcp.index.PATCHED.js` → click in page → `Ctrl+A`, `Ctrl+C`.
5. Editor tab: click in editor → `Ctrl+A`, `Ctrl+V`. Let it settle. `Ctrl+End`: last line must be **6616** (±1). If not, `Ctrl+Z` once and STOP with the number you saw.
6. First line must read `import { EventEmitter } from "node:events";`. If the file starts with `--`, the wrong text was copied → `Ctrl+Z`, STOP.
7. **Deploy** (or **Save and deploy**). Wait for the success toast.
8. **polar-mcp** → **Deployments** / **Versions**: record the newest version id (first 8 chars) and the one before it (rollback target).

**REPORT (Phase 2 / CiC)**
```
PHASE 2 / CiC
application name: ________  application_id: ________
operator_id: ________  guild_id: ________
secrets listed: DISCORD_PUBLIC_KEY [y/n] DISCORD_OPERATOR_IDS [y/n] POLAR_WEBHOOK_SECRET [y/n]
editor before: last line ____  hits rejected=__ discord=__
editor after:  last line ____  first line ok [y/n]
deployed: [y/n]  new version: ________  previous version: ________
unexpected: ________
```

---

## Phase 3 — DC: verify the deploy (as soon as Phase 2 says `deployed: y`)

```bash
BASE=https://polar-mcp.kenwsimmons.workers.dev
echo "A1 unsigned webhook:   $(curl -s -o /dev/null -w '%{http_code}' -X POST $BASE/api/polar/webhook -H 'content-type: application/json' -d '{"type":"probe.unsigned.post"}')"
echo "A2 rejected audited:   $(curl -s "$BASE/api/audit?action=polar_webhook_rejected" | grep -o polar_webhook_rejected | wc -l)"
echo "B1 manifest:           $(curl -s -o /dev/null -w '%{http_code}' $BASE/api/integrations/discord/commands)"
echo "B2 manifest is omega:  $(curl -s $BASE/api/integrations/discord/commands | grep -c '"name":"omega"')"
echo "B3 unsigned interact:  $(curl -s -o /dev/null -w '%{http_code}' -X POST $BASE/api/integrations/discord/interactions -H 'content-type: application/json' -d '{"id":"1","type":1}')"
echo "B3 body:               $(curl -s -X POST $BASE/api/integrations/discord/interactions -H 'content-type: application/json' -d '{"id":"1","type":1}')"
echo "polar events still ok: $(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/polar/events?limit=1")"
```

| Check | Expect | Otherwise |
|---|---|---|
| A1 | `401` | `503` = `POLAR_WEBHOOK_SECRET` missing · `200` = patch not live |
| A2 | `≥ 1` | `0` = audit not persisted; report, not fatal |
| B1 / B2 | `200` / `1` | `404` = Patch B not live |
| B3 | `401`, body reason `missing_signature` | `503` with `public_key_not_configured` / `malformed_public_key` = secret wrong; Phase 4 cannot proceed |
| events | `200` | |

**REPORT (Phase 3 / DC)**
```
PHASE 3 / DC
A1=___ A2=___ B1=___ B2=___ B3=___ (reason: ________) events=___
PATCH A LIVE [y/n]   PATCH B LIVE [y/n]
```
The coordinating Claude session checks D1 from its side (no probe row in `polar_webhook_events`). DC does not need to.

---

## Phase 4 — CiC: wire Discord to the Worker (only after Phase 3 says both LIVE)

1. Developer Portal → OMEGA app → **General Information** → **Interactions Endpoint URL** = `https://polar-mcp.kenwsimmons.workers.dev/api/integrations/discord/interactions` → **Save Changes**. Discord sends a PING and a bad-signature probe; the Worker answers PONG and 401; Discord accepts. A red validation error → record its exact text and STOP (almost always a wrong `DISCORD_PUBLIC_KEY`).
2. **Bot** tab. No bot user → **Add Bot**. **Reset Token** → **Copy**. The token is secret; it leaves the browser only through the KEN step. Not in the REPORT.
3. **Installation** (or **OAuth2 → URL Generator**): scopes `applications.commands` + `bot`, no bot permissions needed. Open the install URL and add the app to the guild from 2b if it is not there. Record `installed`.

**KEN (the one manual step):** the bot token is on the clipboard. Make a file on the DC machine, `~/omega/discord.env`, with exactly three lines (ids are in the Phase 2 REPORT):

```
DISCORD_BOT_TOKEN=<paste the token>
DISCORD_APPLICATION_ID=<application_id>
DISCORD_GUILD_ID=<guild_id>
```

Tell DC: "discord.env is in place".

**REPORT (Phase 4 / CiC)**
```
PHASE 4 / CiC
interactions endpoint saved: [y/n]  discord error (if any): ________
bot user exists: [y/n]  token on clipboard for Ken: [y/n]  installed: [y/n]
```

---

## Phase 5 — DC: register the `/omega` commands

Guild route (instant; global takes up to an hour). Never echo the token.

```bash
cd ~/omega/patch-kit/ops/polar-mcp-patch
set -a; . ~/omega/discord.env; set +a
test -n "$DISCORD_BOT_TOKEN" -a -n "$DISCORD_APPLICATION_ID" -a -n "$DISCORD_GUILD_ID" || { echo "discord.env incomplete"; exit 1; }

echo "register: $(curl -s -o /tmp/omega-register.json -w '%{http_code}' -X PUT \
  -H "Authorization: Bot $DISCORD_BOT_TOKEN" -H 'Content-Type: application/json' \
  --data @discord-commands.json \
  "https://discord.com/api/v10/applications/$DISCORD_APPLICATION_ID/guilds/$DISCORD_GUILD_ID/commands")"
echo "commands:    $(grep -o '"name":"omega"' /tmp/omega-register.json | wc -l)"
echo "subcommands: $(grep -o '"name":"\(status\|whoami\|send\|inbox\|ack\|bind\)"' /tmp/omega-register.json | wc -l)"
unset DISCORD_BOT_TOKEN
rm -f ~/omega/discord.env
```

Expect `register: 200`, `commands: 1`, `subcommands: 6`.
`401` = bad token (Ken re-copies). `403` = app not installed in that guild (Phase 4 step 3). `400` = put `/tmp/omega-register.json` in the REPORT (no secrets in it).

**REPORT (Phase 5 / DC)**
```
PHASE 5 / DC
register=___ commands=___ subcommands=___  discord.env deleted: [y/n]
```

---

## Phase 6 — KEN, in Discord (2 minutes)

1. `/omega whoami` → **Unbound**, **Operator yes**.
2. `/omega bind agent:agent:claude:cannon customer:agent:claude:cannon` → "Bound … → `agent:claude:cannon`".
3. `/omega whoami` → lists `registry.admin`, `vault.read`, `mesh.dispatch`.
4. `/omega status` → bus totals.

*Operator no* at step 1 → `DISCORD_OPERATOR_IDS` does not match Ken's id → CiC redoes 2b/2c-4.

The other three agents bind the same way, with the Discord account that will type for each:

```
/omega bind agent:agent:spark:a           customer:agent:spark:a           user:<id>
/omega bind agent:agent:spark:b           customer:agent:spark:b           user:<id>
/omega bind agent:agent:grok:fayetteville customer:agent:grok:fayetteville user:<id>
```

Known gap, not a bug: only `agent:spark:a` holds `comms.send` today, so only that binding can `send`/`inbox`/`ack`. Cannon can `bind`. To let Cannon or the Seats talk, attach a `feature_flag` benefit with `metadata.cap = comms.send` to their products in Polar; the next webhook updates the rows by itself.

---

## Rollback (CiC)

Cloudflare → **polar-mcp** → **Deployments** → the *previous* version from the Phase 2 REPORT → **Rollback**. Then clear the Interactions Endpoint URL in the Developer Portal. Nothing to undo in D1.

## Appendix — if the browser paste will not take (DC-only deploy, needs one API token from Ken)

Use only if 2d fails twice. It uploads the same file through the Workers API while **keeping every existing binding**.

**KEN:** Cloudflare → profile → **API Tokens** → Create Token → template *Edit Cloudflare Workers* → scope to the Kenwsimmons account → create → copy. Put it in `~/omega/cf.env` as `CF_API_TOKEN=<token>`. Tell DC.

```bash
cd ~/omega/patch-kit/ops/polar-mcp-patch
set -a; . ~/omega/cf.env; set +a
ACCT=ab02f4dfa746bf2e6b3d9ff634bb135a
# read current compatibility settings so the upload changes nothing but code
curl -s -H "Authorization: Bearer $CF_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/$ACCT/workers/scripts/polar-mcp/settings" \
  > /tmp/polar-settings.json
COMPAT_DATE=$(grep -o '"compatibility_date":"[^"]*"' /tmp/polar-settings.json | cut -d'"' -f4)
COMPAT_FLAGS=$(grep -o '"compatibility_flags":\[[^]]*\]' /tmp/polar-settings.json | sed 's/"compatibility_flags"://')
echo "compat: $COMPAT_DATE $COMPAT_FLAGS"
cat > /tmp/polar-meta.json <<EOF
{"main_module":"index.js","compatibility_date":"$COMPAT_DATE","compatibility_flags":${COMPAT_FLAGS:-[]},
 "keep_bindings":["d1","ai","kv_namespace","r2_bucket","vectorize","durable_object_namespace","secret_text","plain_text","service","queue","analytics_engine","hyperdrive","workflow","assets","browser","version_metadata","dispatch_namespace","mtls_certificate","pipelines"],
 "keep_assets":true}
EOF
echo "upload: $(curl -s -o /tmp/polar-upload.json -w '%{http_code}' -X PUT \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -F "metadata=@/tmp/polar-meta.json;type=application/json" \
  -F "index.js=@polar-mcp.index.PATCHED.js;type=application/javascript+module" \
  "https://api.cloudflare.com/client/v4/accounts/$ACCT/workers/scripts/polar-mcp")"
grep -o '"success":[a-z]*' /tmp/polar-upload.json; grep -o '"message":"[^"]*"' /tmp/polar-upload.json | head -3
unset CF_API_TOKEN; rm -f ~/omega/cf.env
```

`upload: 200` + `"success":true` → continue with Phase 3. Anything else → put the `message` lines in the REPORT and STOP; do not retry with different metadata.
