# Deploy prompt for the laptop agent (written 2026-11-18)

One paste for an agent that has a shell on Ken's laptop and Wrangler already
logged in to the Kenwsimmons Cloudflare account (the same setup that ran the
`wrangler versions upload` tests on 2026-11-11). Cloud sessions cannot deploy;
this is the step that puts everything built since September live.

It is Step 1 Option A of `CLOUDFLARE_SETUP.md` on the source branch, with three
things added: a record of what is live for rollback, a fallback for upload
error 10021, and proof checks afterwards.

## Pre-flight already done from the cloud (2026-11-18, branch tip `dbf6437`)

| Check | Result |
|---|---|
| `npm ci` | 236 packages, clean |
| `npx tsc --noEmit -p tsconfig.worker.json` | exit 0 |
| `npm run build` | exit 0 (`dist/polar_mcp/index.js` 239.69 kB, client assets built) |
| `npx wrangler deploy --dry-run` | exit 0, 234 KiB upload, bindings DB / KV / R2 / Vectorize / AI / 2 Durable Objects |
| Local run (`wrangler dev`, AI + Vectorize + loader + cron removed from a temp config) | `GET /api/mcp` 405 · `DELETE /api/mcp` 405 · id-less notification 202 with empty body · MCP `ping` returns `{"result":{}}` · `/mcp` initialize OK · 24 `polar_` tools · dashboard 200 · unsigned Polar webhook writes no dedupe row (replay not marked duplicate) · `/api/discord/interactions` 501 until wired |
| `polar-mcp-db` vs `polar-mcp-db-2` | Identical on every field the API exposes (version `production`, region ENAM, read replication disabled, no jurisdiction, 827,392 bytes) and on data: 74 webhook events, 12 entitlements, 7 bus messages, `state` rows 115,315 and 476,364 chars, 25 `sqlite_master` tables. No write to either since 2026-11-11. |

What was not testable from the cloud: the real upload. Error 10021 ("binding DB
of type d1 failed to generate") blocked every upload that bound `polar-mcp-db`
on 2026-11-11. Nothing visible distinguishes that database from its copy, so
either the fault is internal to Cloudflare or it has cleared. Step 5 below
covers both cases.

## The prompt

```text
You have a shell on Ken's laptop and Wrangler is already logged in to the Cloudflare account Kenwsimmons (ab02f4dfa746bf2e6b3d9ff634bb135a). Deploy the Worker `polar-mcp` from its source branch. Do the steps in order. Stop at the first STOP and give me the REPORT block.

Hard rules: only this Cloudflare account. Never run `wrangler versions deploy`. Never deploy version 94e9cc6f or b73e133f (old builds that lack live fixes). Never delete or empty a database. Never print a secret or token.

1. Get the code. Use a checkout whose origin is github.com/Vagblasterxl/vite-react-template (clone it into a new folder if there is none), then run:
   git fetch origin claude/polar-ncp-dynamic-variables-xIZK2
   git checkout claude/polar-ncp-dynamic-variables-xIZK2
   git reset --hard origin/claude/polar-ncp-dynamic-variables-xIZK2
   git rev-parse --short HEAD
   npm ci
   The commit must be dbf6437 or newer. Note it.

2. Record what is live now, for rollback:
   npx wrangler deployments list --name polar-mcp
   Note the version id that is serving 100% and its date. Then fetch these two URLs and note the results:
   https://polar-mcp.kenwsimmons.workers.dev/api/mcp   (GET; expect HTTP 405)
   https://polar-mcp.kenwsimmons.workers.dev/api/polar/entitlements   (expect "count":12; save the body)

3. Build and deploy. Always build first:
   npm run build
   npx wrangler deploy

4. If the deploy succeeded, go to step 6.

5. Only if the deploy was refused with error 10021 that mentions the binding DB or d1:
   a. Run this query against both databases and confirm the two outputs are identical:
      npx wrangler d1 execute polar-mcp-db --remote --command "SELECT (SELECT COUNT(*) FROM polar_webhook_events) AS ev, (SELECT COUNT(*) FROM polar_entitlements) AS ent, (SELECT COUNT(*) FROM comms_messages) AS comms, (SELECT length(value) FROM state WHERE key='audit') AS audit, (SELECT length(value) FROM state WHERE key='polar_events') AS events"
      Same command with polar-mcp-db-2 in place of polar-mcp-db.
      Expected on 2026-11-18: ev 74, ent 12, comms 7, audit 115315, events 476364.
      If they differ, STOP. Do not switch databases.
   b. In wrangler.json, in d1_databases, set "database_name": "polar-mcp-db-2" and "database_id": "7b5f5b7c-7daa-40ad-a8e1-ed790a343c53". Change nothing else in the file.
   c. npm run build, then npx wrangler deploy.
   d. If that deploy succeeded: git commit -am "config: bind DB to polar-mcp-db-2 (upload error 10021 on the original database)" and git push origin claude/polar-ncp-dynamic-variables-xIZK2. If the push is refused, say so in the REPORT; the change must reach the branch or a later deploy will point back at the old database.
   e. If that deploy also failed, STOP and put the full error text in the REPORT.
   Any other deploy error (not 10021): STOP and put the full error text in the REPORT.

6. Prove it. Run all of these against https://polar-mcp.kenwsimmons.workers.dev :
   GET /api/mcp                                   expect HTTP 405
   POST /api/mcp  body {"jsonrpc":"2.0","method":"notifications/initialized"}   expect HTTP 202, empty body
   POST /api/mcp  body {"jsonrpc":"2.0","id":1,"method":"ping"}                 expect {"jsonrpc":"2.0","id":1,"result":{}}
   GET /api/polar/entitlements                    expect the same count as in step 2
   GET /api/platform                              expect d1, ai, kv, r2, vectorize all true
   GET /api/discord                               expect "ok":true (wired false is fine for now)
   Open https://polar-mcp.kenwsimmons.workers.dev in a browser: the first tab should be Setup.
   If the entitlements count dropped, or /api/mcp is not 405, or /api/platform shows a binding false: run
   npx wrangler rollback <version id from step 2> --name polar-mcp
   and say so in the REPORT.

REPORT
commit deployed: ________
live before: version ________ dated ________ ; /api/mcp ___ ; entitlements count ___
deploy: succeeded first try / needed the database switch / failed (error text)
database now bound: polar-mcp-db / polar-mcp-db-2 ; pushed to branch: yes / no / not needed
new version id: ________
proof: /api/mcp ___ ; notification ___ ; ping ok y/n ; entitlements count ___ ; platform all true y/n ; Setup tab y/n
rolled back: no / yes (why)
```

## After a clean REPORT

Continue with `CLOUDFLARE_SETUP.md` on the source branch from Step 2: save the
one secret `DISCORD_BOT_TOKEN` on the Worker (type Secret, through the dashboard
form), press **Wire Discord** on the Setup tab, add the bot to the server, type
`/here`.
