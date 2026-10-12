# THE ESTATE — Everything You Actually Have (2026-10-12 sweep)

**TL;DR: 29 Cloudflare Workers across 2 reachable accounts, 33 GitHub repos (12 of
them look like auto-generated clutter), ~29 Claude sessions. Your "memory-bridge"
exists — it's a Cloudflare Worker on the Kenwsimmons account. Kill-list at the bottom.**

---

## CLOUDFLARE WORKERS

### Account: Kenwsimmons@hotmail.com (15 workers)
**The Symphony stack (looks like your real system):**
- `symphony-dispatch` (active July 2026), `symphony-heartbeat` (active July 2026),
  `symphony-coordinator`, `claude-symphony`, `reflection-worker`
- **`memory-bridge`** ← THE memory bridge you asked about. Created Feb 2026,
  last touched Apr 2026. It's real, it's deployed, it's on THIS account.
- `knowledge-sphere`, `knowledge-feed`, `r2-vault`, `extractor-bus`, `infra-hud`
- `polar-mcp` (active Sep 2026 — matches your polar-mcp repo + running session)
- `captain-proton`
- Junk candidates: `black-lake-0eed`, `rapid-breeze-7877` (auto-named, Oct 2025)

### Account: Assblasterxl@gmail.com (14 workers)
**Another Symphony layer:**
- `symphony-conductor`, `symphony-registry`, `symphony-broadcast`,
  `symphony-queue-processor`, `symphony-api-gateway` (all Apr 2026)
- `aegis-orchestrator`, `assblasterxl-index-ai` (July 2026)
- Durable Object experiments (May 2026, likely tutorials): `sqlite-do`,
  `ws-hibernation-do`, `alarm-do`, `do-basic-counter`
- Templates/experiments: `llm-chat-app-template`, `workflows-starter-template`,
  `speechtotext`

### Account: Vagblasterxl@gmail.com — NOT REACHABLE from this session
This is where the 4 failing "Workers Builds" live (`r2-explorer-template`,
`flat-brook-c598`, `llama1`, `rag-momory-worker` — all wired to this GitHub repo).
Reconnect this account to the Cloudflare connector, or fix it in the dashboard:
disconnect the 3 unrelated workers from this repo's Git integration.

**Observation: your Symphony system is split across two accounts** (dispatch/heartbeat
on Kenwsimmons, conductor/registry/gateway on Assblasterxl). That split is probably
half of your "nobody can talk to the brain" problem.

---

## GITHUB (Vagblasterxl) — 33 repos

**Active this week:** r2-explorer-template (this one), polar-mcp, d1-rest,
vite-react-template, chanfana-openapi-template, agent-chain-sor, iteration-stepper,
grok-skills-shelf

**Real projects:** automation-command-center, prj-symph, will-os, agent-swarm-brain-map,
spark-fleet-skills-2026, prytor-ca81-skills, grok-lab, phil-rwa-board, vagblasterxl (profile)

**Clutter — 12 auto-codename repos, ALL dead since Aug 14, 2026** (one afternoon):
moss-comet-lilac-polar, polar-yarrow-prism-sunny, gem-heart-spark-hill,
iris-ember-juniper-zinc, quartz-ruby-lion-birch, timber-stone-star-breeze,
atlas-grove-kind-finch, slate-lotus-beam-pixel, amber-pepper-cinder-sky,
apex-hazel-rocket-plum, amber-forge-hill-otter, palm-cactus-comet-amber
→ Almost certainly one burst of auto-created sandboxes. **Archive all 12.**

**Explicitly junk:** `junk` (it's literally named junk), last-call-fruit-mixer,
containers-template, llm-chat-app-template (duplicate of the CF worker)

Note: there's also a second GitHub identity, **assblasterxl-rgb** (symphony-os,
AI-SYSTEM-INDEX), used by your Remote Control sessions.

---

## CLAUDE SESSIONS (this account)

**Alive right now:**
- "Polar webhook security" — RUNNING, on chanfana-openapi-template ($121 spent, since Sep 11)
- "Agent chain overview" — review-ready, PR #1 on agent-chain-sor, watching it
- "News folder AI directory" — completed a FULL Cloudflare inventory already
  ("19/20 workers captured, handoff pack pushed" to 8 repos on branch
  claude/affectionate-allen-Q4QUL — including this repo; that's who force-pushed
  this branch earlier today)
- This session — PR #5, the pipeline docs

**Waiting on you (blocked):** "ChatGPT 1108 file analysis" (wants a `go`),
"Fable setup for longer usage" (two-seat relay, wants files pasted)

**Dead weight:** ~7 archived "Grok upgrade relay" duplicates, ~6 "blastforce1-*"
sessions — all archived already, ignore them.

---

## THE KILL LIST (safe deletes, your call)

| What | Where | Why |
|------|-------|-----|
| 12 codename repos | GitHub | One-afternoon sandbox burst, dead 2 months |
| `junk` repo | GitHub | It's named junk |
| `black-lake-0eed`, `rapid-breeze-7877` | CF Kenwsimmons | Auto-named, a year old |
| `do-basic-counter`, `alarm-do`, `ws-hibernation-do`, `sqlite-do` | CF Assblasterxl | Tutorial Durable Objects |
| 3 unrelated workers' Git hookup to this repo | CF Vagblasterxl dashboard | Causes the red X's on every PR here |

## THE KEEP LIST (the actual brain)

- **Symphony stack** (both CF accounts) + `memory-bridge` + `r2-vault` + `knowledge-sphere`
- **polar-mcp** (worker + repo + running session = your most active project)
- **This repo** as the coordination hub (CLAUDE.MD + AI_PIPELINE.md)
- **automation-command-center, prj-symph, agent-chain-sor** repos

---

**Bottom line: the brain was never missing — memory-bridge is a live Worker on the
Kenwsimmons Cloudflare account, and Symphony is split across two accounts. Reconnect
the Vagblasterxl Cloudflare account, archive the 12 codename repos, and the estate
drops from ~60 things to ~20 things that matter.**
