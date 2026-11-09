# AGENT RUNBOOK — deploy the polar-mcp patch kit and wire Discord

**Audience: AI agents, not Ken.** Two agents work this in parallel:

- **DC** = Claude with Desktop Commander (shell + files on Ken's machine).
- **CiC** = Claude in Chrome (Ken's logged-in browser: Cloudflare dashboard, Discord Developer Portal, Discord web).

Ken only relays reports between agents and does the two things marked **KEN**. He does not need to understand any of it. Every phase ends with a **REPORT** block; the agent fills it in word for word and Ken pastes it to whoever asked (the coordinating Claude session, or the other agent).

Kit location (public, no login needed):
`https://github.com/Vagblasterxl/r2-explorer-template/tree/claude/sleepy-goodall-56ldt1/ops/polar-mcp-patch`
Raw file base: `https://raw.githubusercontent.com/Vagblasterxl/r2-explorer-template/claude/sleepy-goodall-56ldt1/ops/polar-mcp-patch/`

Targets:

| Thing | Value |
|---|---|
| Cloudflare account | **Kenwsimmons@hotmail.com's Account** (`ab02f4dfa746bf2e6b3d9ff634bb135a`). Not the Assblasterxl one, not `9e6e291d…`. |
| Worker | `polar-mcp` |
| Worker URL | `https://polar-mcp.kenwsimmons.workers.dev` |
| D1 | `polar-mcp-db` (`f7d1f983-314f-4e81-8658-edf692a6eaa7`) — read-only here; no migration needed |
| Expected live editor size before paste | ~6,047–6,048 lines |
| `polar-mcp.index.PATCHED.js` | 6,616 lines, sha256 `218960dbed41ee1a1072036fe02187b0dab490820bbf6e68e186dbbdc813996e` |
| `discord-commands.json` | sha256 `6b1a16cdbed4de64f8b1d5b91d293811a39a7ab8bdeb0724235be6a52055408b` |

## Rules for both agents

1. **Secrets never go into chat, reports, logs, or files other than the ones named here.** The Discord Public Key, Bot Token, and Cloudflare secret values move only browser-tab → browser-form (CiC) or file → environment variable (DC). If you catch yourself about to print one, stop and write `<redacted>`.
2. **Touch nothing but what a step names.** No other Workers, no other secrets, no bindings, no routes, no DNS, no D1 writes.
3. **Stop conditions are real.** If a step says STOP, stop, fill in the REPORT with what you saw, and end. Do not improvise a workaround.
4. **Never run `wrangler deploy`** against `polar-mcp`. A deploy from a machine without the original `wrangler` config would strip the Worker's D1/AI/KV/R2/Vectorize/Durable Object bindings. The dashboard editor paste keeps them.
5. Report exact values when asked (HTTP status codes, line counts, version ids). Do not paraphrase a number.

---

## Phase 1 — DC: fetch and verify the kit, record the live baseline

**Prereqs on Ken's machine:** `git`, `node` ≥ 18, `curl`. (`node --version` to check.)

```bash
mkdir -p ~/omega && cd ~/omega
git clone --depth 1 --branch claude/sleepy-goodall-56ldt1 \
  https://github.com/Vagblasterxl/r2-explorer-template.git patch-kit
cd patch-kit/ops/polar-mcp-patch
ls
```

Verify integrity:

```bash
wc -l polar-mcp.index.PATCHED.js                 # expect 6616
sha256sum polar-mcp.index.PATCHED.js             # expect 218960db…  (macOS: shasum -a 256)
grep -c polar_webhook_rejected polar-mcp.index.PATCHED.js            # expect 3
grep -c 'api/integrations/discord/interactions' polar-mcp.index.PATCHED.js  # expect 2
node test-patchB.mjs | tail -3                   # expect "ALL PASSED"
```

If any number differs, STOP and report it.

Record the live baseline (this is the bug being fixed; the first call returning 200 is expected *before* the patch):

```bash
BASE=https://polar-mcp.kenwsimmons.workers.dev
echo "baseline unsigned webhook: $(curl -s -o /dev/null -w '%{http_code}' -X POST $BASE/api/polar/webhook -H 'content-type: application/json' -d '{"type":"probe.unsigned.baseline"}')"
echo "baseline discord manifest: $(curl -s -o /dev/null -w '%{http_code}' $BASE/api/integrations/discord/commands)"
echo "baseline discord interactions: $(curl -s -o /dev/null -w '%{http_code}' -X POST $BASE/api/integrations/discord/interactions -H 'content-type: application/json' -d '{"id":"1","type":1}')"
```

Expected baseline: `200`, `404`, `404`.

Make the paste file easy for CiC to reach. The browser can open the raw URL directly, so nothing to copy; just confirm the URL loads:

```bash
curl -s -o /dev/null -w 'raw PATCHED.js reachable: %{http_code}\n' \
  https://raw.githubusercontent.com/Vagblasterxl/r2-explorer-template/claude/sleepy-goodall-56ldt1/ops/polar-mcp-patch/polar-mcp.index.PATCHED.js
```

**REPORT (Phase 1, DC):**
```
PHASE 1 / DC
kit path on machine: ~/omega/patch-kit/ops/polar-mcp-patch
PATCHED.js lines: ____   sha256 first 8: ________
markers: rejected=__ discord=__
test-patchB: PASSED / FAILED (paste last line)
baseline: webhook=___ manifest=___ interactions=___
raw PATCHED.js reachable: ___
```

Then wait. Phase 3 needs the deploy from Phase 2.

---

## Phase 2 — CiC: Discord values, Cloudflare secrets, paste, deploy

### 2a. Discord Developer Portal — collect values

1. Open `https://discord.com/developers/applications`. Open the OMEGA application (if several, pick the one Ken uses for the agent mesh; if unsure, list the application names in the REPORT and STOP).
2. **General Information** tab. Note the **Application ID** (not secret; include in REPORT). Locate the **Public Key** (64 hex characters). Keep this tab open; you will copy the key into Cloudflare in 2c. Do **not** write it anywhere else.
3. Do **not** change the *Interactions Endpoint URL* yet (that is Phase 4). Discord would test it against the unpatched Worker and refuse.

### 2b. Discord web — Ken's user id and the server id

1. Open `https://discord.com/app`. User Settings (gear, bottom left) → **Advanced** → turn **Developer Mode** on.
2. Right-click Ken's own name/avatar → **Copy User ID**. This is a 17–19 digit number. It is **not secret**; include it in the REPORT as `operator_id`. It becomes the Cloudflare secret `DISCORD_OPERATOR_IDS`.
3. Right-click the server (guild) where `/omega` should work → **Copy Server ID**. Include in REPORT as `guild_id`.

### 2c. Cloudflare — add the two secrets

1. Open `https://dash.cloudflare.com`. If the account picker appears, choose **Kenwsimmons@hotmail.com's Account**. Verify the URL contains `ab02f4dfa746bf2e6b3d9ff634bb135a`. If it does not, switch accounts; do not proceed on another account.
2. **Workers & Pages** → **polar-mcp** → **Settings** → **Variables and Secrets**.
3. **Add** → Type **Secret** → name `DISCORD_PUBLIC_KEY` → value: paste the Public Key from the Discord tab (2a). Save / Deploy.
4. **Add** → Type **Secret** → name `DISCORD_OPERATOR_IDS` → value: the operator id from 2b. Save / Deploy.
5. Confirm both names now appear in the list, and that `POLAR_WEBHOOK_SECRET` is already there. If `POLAR_WEBHOOK_SECRET` is **missing**, STOP and report (Patch A would return 503 for every Polar delivery).

### 2d. Cloudflare — paste the patched Worker

1. Still on **polar-mcp**, click **Edit code** (top right). Wait for the editor to load `index.js`.
2. Click into the editor, press `Ctrl+End` (Mac `Cmd+↓`) and read the **last line number** shown in the gutter. Record it. Expect ~6,047–6,048. If it is above ~6,500, the file is probably already patched: STOP and report.
3. `Ctrl+F` in the editor. Search `polar_webhook_rejected` → record hit count. Search `api/integrations/discord/interactions` → record hit count. **Both must be 0.** If either is non-zero, STOP and report. Do not paste.
4. Open a new tab with the raw file:
   `https://raw.githubusercontent.com/Vagblasterxl/r2-explorer-template/claude/sleepy-goodall-56ldt1/ops/polar-mcp-patch/polar-mcp.index.PATCHED.js`
   Click in the page, `Ctrl+A`, `Ctrl+C`.
5. Back in the editor tab: click into the editor, `Ctrl+A`, `Ctrl+V`. Wait for the editor to settle. `Ctrl+End` and confirm the last line number is **6616** (±1). If it is not, `Ctrl+Z` once to restore, and STOP: report the number you saw.
6. Confirm the first line now reads `import { EventEmitter } from "node:events";` and the file does **not** begin with `--` (a multipart boundary line means the wrong file was copied; STOP).
7. Click **Deploy** (may be labelled **Save and deploy**). Wait for the success toast.
8. Go to **polar-mcp** → **Deployments** (or **Versions**). Record the **newest version id** (first 8 chars are enough) and its timestamp. Also record the **previous** version id: that is the rollback target.

**REPORT (Phase 2, CiC):**
```
PHASE 2 / CiC
discord application name: ________   application_id: ________
operator_id: ________   guild_id: ________
secrets now present on polar-mcp: DISCORD_PUBLIC_KEY [y/n]  DISCORD_OPERATOR_IDS [y/n]  POLAR_WEBHOOK_SECRET [y/n]
editor before paste: last line ____  hits rejected=__ discord=__
editor after paste: last line ____  first line ok [y/n]
deployed: [y/n]  new version: ________  previous version (rollback): ________
anything unexpected: ________
```

---

## Phase 3 — DC: verify the deploy (run as soon as Phase 2 reports `deployed: y`)

```bash
BASE=https://polar-mcp.kenwsimmons.workers.dev
echo "A1 unsigned webhook:       $(curl -s -o /dev/null -w '%{http_code}' -X POST $BASE/api/polar/webhook -H 'content-type: application/json' -d '{"type":"probe.unsigned.post"}')"
echo "A2 rejected audit entries: $(curl -s "$BASE/api/audit?action=polar_webhook_rejected" | grep -o 'polar_webhook_rejected' | wc -l)"
echo "B1 discord manifest:       $(curl -s -o /dev/null -w '%{http_code}' $BASE/api/integrations/discord/commands)"
echo "B2 manifest is /omega:     $(curl -s $BASE/api/integrations/discord/commands | grep -c '"name":"omega"')"
echo "B3 unsigned interaction:   $(curl -s -o /dev/null -w '%{http_code}' -X POST $BASE/api/integrations/discord/interactions -H 'content-type: application/json' -d '{"id":"1","type":1}')"
echo "B3 reason:                 $(curl -s -X POST $BASE/api/integrations/discord/interactions -H 'content-type: application/json' -d '{"id":"1","type":1}')"
echo "live polar events still OK: $(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/polar/events?limit=1")"
```

Expected:

| Check | Expect | If not |
|---|---|---|
| A1 | `401` | `503` = `POLAR_WEBHOOK_SECRET` missing (report); `200` = paste did not deploy (report) |
| A2 | `≥ 1` | `0` means audit did not persist; report, not fatal |
| B1 | `200` | `404` = Patch B not live |
| B2 | `1` | |
| B3 | `401` with reason `missing_signature` | `503` with `public_key_not_configured` or `malformed_public_key` = the `DISCORD_PUBLIC_KEY` secret is wrong/missing: report, Phase 4 cannot proceed |
| live polar events | `200` | |

**REPORT (Phase 3, DC):**
```
PHASE 3 / DC
A1=___ A2=___ B1=___ B2=___ B3=___ (reason: ________) events=___
verdict: PATCH A LIVE [y/n]   PATCH B LIVE [y/n]
```

The coordinating Claude session verifies D1 from its side (no probe row in `polar_webhook_events`); DC does not need to.

---

## Phase 4 — CiC: wire Discord to the Worker (only after Phase 3 says both patches live)

1. Discord Developer Portal → OMEGA application → **General Information** → **Interactions Endpoint URL** →
   `https://polar-mcp.kenwsimmons.workers.dev/api/integrations/discord/interactions`
   → **Save Changes**. Discord immediately sends a PING and a deliberately bad-signature request; the Worker answers PONG and 401 and Discord accepts. If Discord shows a red validation error, record its exact text and STOP (almost always: wrong `DISCORD_PUBLIC_KEY`).
2. **Bot** tab. If no bot user exists, **Add Bot**. Click **Reset Token** → **Copy**. This token is a **secret**. Hand-off is the one **KEN** step below; do not put it in the REPORT.
3. **Installation** (or **OAuth2 → URL Generator**): scopes `applications.commands` and `bot`; bot permissions can be none. Open the generated install URL and install the app into the guild from 2b, if it is not already in it. Record `installed: y/n`.

**KEN (one manual step):** CiC has the bot token on the clipboard. Create a file on the machine DC uses, e.g. `~/omega/discord.env`, containing exactly these three lines (fill in values; the two ids are in the Phase 2 REPORT):

```
DISCORD_BOT_TOKEN=<paste token>
DISCORD_APPLICATION_ID=<application_id>
DISCORD_GUILD_ID=<guild_id>
```

Then tell DC "discord.env is in place".

**REPORT (Phase 4, CiC):**
```
PHASE 4 / CiC
interactions endpoint saved: [y/n]   discord error text (if any): ________
bot user exists: [y/n]   token copied for Ken: [y/n]
app installed in guild: [y/n]
```

---

## Phase 5 — DC: register the `/omega` commands

Read the env file without echoing it, register against the **guild** route (instant; global takes up to an hour), then verify.

```bash
cd ~/omega/patch-kit/ops/polar-mcp-patch
set -a; . ~/omega/discord.env; set +a
test -n "$DISCORD_BOT_TOKEN" -a -n "$DISCORD_APPLICATION_ID" -a -n "$DISCORD_GUILD_ID" || { echo "discord.env incomplete"; exit 1; }

echo "register: $(curl -s -o /tmp/omega-register.json -w '%{http_code}' -X PUT \
  -H "Authorization: Bot $DISCORD_BOT_TOKEN" -H 'Content-Type: application/json' \
  --data @discord-commands.json \
  "https://discord.com/api/v10/applications/$DISCORD_APPLICATION_ID/guilds/$DISCORD_GUILD_ID/commands")"
echo "commands returned: $(grep -o '"name":"omega"' /tmp/omega-register.json | wc -l)"
echo "subcommands: $(grep -o '"name":"\(status\|whoami\|send\|inbox\|ack\|bind\)"' /tmp/omega-register.json | wc -l)"
unset DISCORD_BOT_TOKEN
```

Expected: `register: 200`, `commands returned: 1`, `subcommands: 6`.
`401` = bad token (Ken re-copies). `403` = app not installed in that guild (Phase 4 step 3). `400` = paste `/tmp/omega-register.json` contents into the REPORT (it contains no secrets).

Afterwards delete the token file: `rm ~/omega/discord.env` (the token is not needed again; Discord lets Ken reset it any time).

**REPORT (Phase 5, DC):**
```
PHASE 5 / DC
register=___  commands=___  subcommands=___
discord.env deleted: [y/n]
```

---

## Phase 6 — KEN, in Discord (2 minutes)

In the guild, type `/omega` and pick:

1. `/omega whoami` → should say **Unbound** and **Operator yes**.
2. `/omega bind agent:agent:claude:cannon customer:agent:claude:cannon` → "Bound … → `agent:claude:cannon`".
3. `/omega whoami` → now lists `registry.admin`, `vault.read`, `mesh.dispatch`.
4. `/omega status` → bus totals.

If step 1 says *Operator no*, the `DISCORD_OPERATOR_IDS` secret does not match Ken's user id: CiC re-does 2b/2c step 4.

Binding the other three agents needs their Discord user ids (the accounts that will type for them). Same command, with `user:<their id>`:

```
/omega bind agent:agent:spark:a           customer:agent:spark:a           user:<id>
/omega bind agent:agent:spark:b           customer:agent:spark:b           user:<id>
/omega bind agent:agent:grok:fayetteville customer:agent:grok:fayetteville user:<id>
```

Known gap, not a bug: only `agent:spark:a` currently holds `comms.send`, so only that binding can `/omega send`, `inbox`, `ack`. Cannon can `bind`. To let Cannon or the Seats talk, attach a `feature_flag` benefit with `metadata.cap = comms.send` to their products in Polar; the next Polar webhook updates the rows automatically.

---

## Rollback (either agent, CiC does it)

Cloudflare → **polar-mcp** → **Deployments** → the *previous* version recorded in Phase 2 → **Rollback**. Then in Discord Developer Portal clear the Interactions Endpoint URL. Nothing to undo in D1: Patch B's tables already existed and Patch A touches no schema.
