# Agent Lee brief — unblock `polar-mcp` (written 2026-11-15)

> **Update 2026-11-18: optional now.** The laptop deploy in
> [`DEPLOY-PROMPT.md`](./DEPLOY-PROMPT.md) handles error 10021 by itself (it
> falls back to the verified copy of the database), so this prompt is only
> worth running if you want Cloudflare's own explanation of 10021 or want
> automatic deploys from GitHub. Two things changed since it was written:
> the source branch at `dbf6437` now carries the three live fixes, so only
> the parked versions are unsafe to deploy; and item 6 is partly answered,
> since the two databases are identical on every field the API exposes
> (version, region, read replication, jurisdiction, size) and on data. The
> source branch's own `CLOUDFLARE_SETUP.md` also has Ask AI prompts for
> connecting GitHub builds and adding the Discord secret.

**Agent Lee** is Cloudflare's own assistant inside the dashboard. It reads the
account directly and can change things through Cloudflare's API, but it shows an
**Approve** button before every change and cannot skip it. It does not build
code from a GitHub repository; it works on what is already in the account.

That makes it the right hand for the one thing no Claude session could do from
outside: find out why Cloudflare refuses every new upload of `polar-mcp`
(error 10021), which is why nothing has shipped since 2026-11-11.

## Where to paste

Cloudflare dashboard → account **Kenwsimmons@hotmail.com's Account** → **Ask AI**
(top right corner). Paste everything in the box below as one message.
Part 1 needs no approvals. Parts 2 and 3 ask before changing anything.

## The prompt

```text
You are working on my Worker `polar-mcp` in this account (Kenwsimmons, account id ab02f4dfa746bf2e6b3d9ff634bb135a). I am not a developer. Do the checking yourself, explain in plain words, and ask me to approve before every change. Do NOT deploy, roll back or delete anything unless a step below says so and I approve it.

PART 1 - look only, change nothing. Answer each numbered item.

1. Which version of `polar-mcp` is serving traffic right now? Give its version id, when it was uploaded, and how (dashboard, Wrangler, API). List the 6 most recent versions and mark which one is deployed. I expect the live one to date from 2026-09-26, plus two versions uploaded on 2026-11-11 that were never deployed (ids starting 94e9cc6f and b73e133f).

2. For the version that is serving traffic: list every binding (D1 database id, KV, R2, Vectorize, Workers AI, Durable Objects, worker loader), its cron triggers, its compatibility date and flags, and the NAMES of its secrets. Never show secret values.

3. Does the code of the version that is serving traffic contain the text app.get("/api/mcp" ? Answer yes or no. If you cannot read that version's code, request https://polar-mcp.kenwsimmons.workers.dev/api/mcp with GET and tell me the HTTP status (405 means yes, 404 means no).

4. Is this Worker connected to a Git repository under Settings > Builds? Is the Cloudflare GitHub app installed for this Cloudflare account, and for which GitHub account?

5. Every Worker in this account shows "modified 2026-11-14 around 10:12 UTC". Check the audit log: what was changed, and who or what did it?

PART 2 - the blocker.

Since 2026-11-11, uploading any new version of `polar-mcp` that binds the D1 database `polar-mcp-db` (id f7d1f983-314f-4e81-8658-edf692a6eaa7) as `DB` is refused with error 10021: "binding DB of type d1 failed to generate". The same upload bound to the copy `polar-mcp-db-2` (id 7b5f5b7c-7daa-40ad-a8e1-ed790a343c53) is accepted. The live Worker still reads the original database without trouble.

6. Find out why the original database cannot be bound to a new version. Compare it with `polar-mcp-db-2`: status, storage backend or version, jurisdiction, read replication, and anything else that differs.

7. If you can repair it so new versions can bind it, tell me exactly what you would change, then ask for approval.

8. If it cannot be repaired from here, say so plainly and tell me whether it needs a Cloudflare support ticket. Then compare the two databases table by table (row counts) and tell me whether the copy is still identical to the original.

PART 3 - automatic deploys from GitHub. Do not turn anything on in this part.

9. I want this Worker to build and deploy by itself from the GitHub repository Vagblasterxl/vite-react-template: production branch `main`, build command `npm run build`, deploy command `npx wrangler deploy`, with preview builds for other branches. Tell me whether you can set that up, what I have to click myself first (for example installing or re-installing the GitHub app), and what would happen on the very first build. Do not connect it yet.

Finish with a short summary I can copy: one line per numbered item.
```

## What to do with the answer

Copy Agent Lee's final summary back to the Claude session. Nothing in Part 1
changes the account, so it is safe to run at any time.

## Why these questions (for agents)

| # | Why it is asked |
|---|---|
| 1, 3 | The Cloudflare API "download script" call now returns the newest *upload* (a never-deployed laptop build from 11-11, 6,034 lines), not the version serving traffic (the 09-26 deployment, 6,047 lines). Sessions since 11-11 have been comparing against the wrong copy. This settles which one is live. |
| 2 | Any deploy must keep these bindings. The source config is `wrangler.json` on branch `claude/polar-ncp-dynamic-variables-xIZK2` of `Vagblasterxl/vite-react-template`. |
| 4, 9 | Workers Builds is how a Claude session's `git push` becomes a deploy with no human in the loop. Connecting needs the Cloudflare GitHub app on the `Vagblasterxl` GitHub account, which may still be tied to the dead `9e6e291d…` Cloudflare account (the source of the red "Workers Builds" checks on every PR). |
| 5 | All 17 Workers show the same modified time. Unexplained account-wide change. |
| 6-8 | Error 10021 is the reason no version has shipped. The staged workaround is a database swap to `polar-mcp-db-2`; on 2026-11-15 the two databases still matched on every count checked (74 webhook events, 12 entitlements, 7 bus messages, equal `state` row sizes). |

## Do not deploy these as they are

Both are missing three fixes that are live today. See
[`LIVE-HOTFIXES-TO-PORT.md`](./LIVE-HOTFIXES-TO-PORT.md).

- Parked version `94e9cc6f…` (the staged "flip it" database swap).
- Branch `claude/polar-ncp-dynamic-variables-xIZK2` at `d424409` (draft PR #4 in `Vagblasterxl/vite-react-template`).
