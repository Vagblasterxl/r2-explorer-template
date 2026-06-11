# CharlieNet Cannon Lineup — Solo Operator Edition

**Operator profile**: Solo, sole Workspace admin, Cloudflare-purchased domain on Google Workspace. No enterprise. Security-aggressive. Bare-metal where logical. No token/latency/speed constraints — thoroughness over everything.

**Date synthesized**: 2026-06-11
**Source cannon**: `CHARLIENET-CANNON-SUPERMAX.md` (Claude Code + Cowork — already built)

This document defines the FULL fleet of cannons. Each is the same engine as Supermax (atomic salvo claim, self-perpetuating chain, pool hydrator, adaptive intervals), just pointed at a different saturation target with its own pool of tasks.

---

## The Reality Check (what the research confirmed)

Before the lineup, here's what's actually true as of mid-2026, so the cannons aim at real targets, not fantasy:

### Mem.ai
- API exists but is **early**. Supports creating "mem" entities (text containers). "Inflows" (push data in) are live; "outflows" (read the knowledge graph out) and OAuth + a "Flow Store" are **announced/rolling**, not all shipped.
- Knowledge graph is auto-built via ML — no manual folders. Good as a capture sink, weak as a queryable backend right now.
- **Cannon implication**: treat Mem as a capture/inflow target, not a system of record. Don't build anything mission-critical that depends on reading the graph back out programmatically yet.

### NotebookLM
- **Official Enterprise API** exists (Google Cloud, notebook + source management). Enterprise-oriented.
- **Unofficial `notebooklm-py`** (PyPI, MIT) exposes far more — Audio/Video Overviews, slide decks, infographics, quizzes, flashcards, mind maps, batch export. Uses undocumented endpoints; **can break anytime**. Good for personal/prototype, not production.
- April 8 2026: NotebookLM **fully integrated into Gemini app** w/ bidirectional sync. May 2026: NotebookLM available **inside Google Workspace Studio flows**.
- **Cannon implication**: a NotebookLM cannon is viable for a solo operator via `notebooklm-py` + Workspace Studio flows. Mark the unofficial path as fragile.

### Slack (Business+)
- Business+ adds SAML SSO, full message-history export, granular admin controls, 99.99% SLA. **No** native DLP, no multi-SAML, no EMM (those are Enterprise+).
- Classic apps being phased out in 2026 — build on the **new platform**. Internal bot = one bot token, no OAuth, no multi-tenancy (perfect for solo).
- **Cannon implication**: a Slack cannon should build an **internal bot** on the new platform, wire incoming webhooks + event subscriptions, and lean on Business+ admin controls. Don't design around DLP you don't have.

### Google Workspace (sole admin)
- **Biggest risk**: single super-admin = lockout risk. Google says **2–4 super admins**, never 1. Need a **break-glass second super-admin account**.
- Enforce MFA everywhere, **hardware keys / authenticator, not SMS**. Enroll admin in **Advanced Protection Program (APP)**.
- **Separate** the admin account from the daily-driver account.
- 2026 threats: AI-powered identity attacks, OAuth exploitation, agentic AI recon, data leak from autonomous copilots.
- **Cannon implication**: the Workspace cannon's #1 task is fixing the single-admin lockout risk, then MFA/APP/account-separation hardening.

### Cloudflare ↔ Google Workspace DNS
- Domain verification TXT record **must be DNS-only (grey cloud)** — orange proxy blocks Google verification.
- MX → Google, then SPF (auto-created on verify), DKIM, DMARC.
- **DMARC in 2026 is mandatory**, not best-practice. Path: `p=none` + RUA reporting → fix SPF flattening → `p=quarantine` → `p=reject`. Google/Yahoo/MS reject non-compliant mail at SMTP level.
- **Cannon implication**: the infra/security cannon drives DMARC to `p=reject` properly, plus SPF flattening and DKIM for every sender.

### Cloudflare platform (Agents Week, April 13–17 2026 + May)
- **Code Mode**: cuts MCP token usage ~81% by collapsing tool schemas. **Shadow MCP detection** in Gateway.
- **MCP reference architecture**: Access (auth) + MCP server portals (governance) + AI Gateway (cost) + Gateway (shadow detection).
- **Cloudflare Sandboxes GA**, **Dynamic Workers**, **Cloudflare Mesh**, **AI Gateway** (70+ models, 14+ providers, unified billing), **Browser Run**, **Agents SDK 'Think'**.
- **Cloudflare Email Service** public beta — send/receive/process email natively from agents.
- D1: AES-256 at rest, TLS in transit, parameterized queries, API keys as secrets.
- Workers security: secrets via `wrangler secret put`, `crypto.subtle.timingSafeEqual()` for token comparison, HMAC on service bindings for defense-in-depth.
- **Cannon implication**: there's a real, current Cloudflare-platform cannon here — MCP governance, Code Mode adoption, AI Gateway, Email Service, Sandboxes.

---

## THE LINEUP — 7 Cannons

Supermax (#1) is built. Here are the other six, in recommended build order.

### CANNON 1 — SUPERMAX ✅ BUILT
**Focus**: Claude Code + Cowork saturation.
**Status**: Complete. `CHARLIENET-CANNON-SUPERMAX.md`.

---

### CANNON 2 — FORTRESS (Security & Identity Hardening) — BUILD FIRST
**Why first**: Everything else sits on top of your identity and domain. If the single-super-admin lockout risk or DMARC isn't fixed, nothing else matters.

**instance_target**: `fortress`

**Pool themes**:
- **Break-glass admin**: create + securely store a second super-admin account (kills the single-admin lockout risk). Hardware key, offline recovery codes, documented runbook.
- **MFA everywhere**: enforce, kill SMS, move to authenticator/hardware keys. Enroll primary admin in Advanced Protection Program.
- **Account separation**: split admin account from daily-driver account.
- **DMARC march**: `p=none` + RUA → SPF flattening → DKIM all senders → `p=quarantine` → `p=reject`. One task per stage, gated.
- **Cloudflare DNS hardening**: DNSSEC, correct grey/orange cloud per record, registrar lock, audit all records.
- **OAuth app audit**: review every third-party app with Workspace access; revoke stale/over-scoped grants (2026 OAuth-exploitation threat).
- **Secrets management**: inventory every API key/token; move to `wrangler secret put` / Google Secret Manager; rotate; document rotation cadence.
- **Recovery runbook**: full account-recovery + break-glass procedure written and stored offline.
- **Hydrator**: keeps generating hardening + audit tasks (re-audit OAuth monthly, re-check DMARC reports, etc.)

---

### CANNON 3 — CONDUIT (Cloudflare Platform Buildout)
**Why**: This is where your actual infrastructure lives. Grounded in Agents Week 2026 reality.

**instance_target**: `conduit`

**Pool themes**:
- **MCP governance stack**: Access (auth) + MCP server portal + AI Gateway (cost caps) + Gateway (Shadow MCP detection). Reference-architecture build.
- **Code Mode adoption**: convert MCP tool-heavy flows to Code Mode (~81% token cut).
- **AI Gateway**: single endpoint across providers, unified billing, cost controls, caching, logging.
- **Cloudflare Email Service** (beta): native send/receive/process — replaces/augments the existing email-handler module.
- **Sandboxes GA**: isolated execution for agent-run code.
- **R2 hardening**: bearer-token auth, pre-signed URLs, Cloudflare Access on buckets, `timingSafeEqual` comparisons.
- **D1 hardening**: parameterized queries everywhere, API keys as secrets, proxy-Worker API pattern.
- **Workers best-practices pass**: secrets, HMAC on service bindings, the Feb 2026 best-practices guide checklist.
- **Harden the existing 8 modules** (Discord bot, webhook receiver, admin dashboard, etc.) against the new standards.

---

### CANNON 4 — LEDGER (Knowledge / Memory Layer)
**Why**: Mem + NotebookLM are your memory/research substrate. Build after you have secure infra to host the glue.

**instance_target**: `ledger`

**Pool themes**:
- **NotebookLM via `notebooklm-py`**: programmatic notebook creation, source ingestion, artifact generation (audio/video/slides/mindmaps). Flag the fragility (undocumented endpoints).
- **NotebookLM Enterprise API**: the stable, official path for notebook + source management.
- **Workspace Studio flows**: NotebookLM-as-knowledge-source flows, "Ask Gemini" + "Repeat for each" loops over Sheets.
- **Mem.ai inflows**: capture pipeline (Slack/email/notes → Mem). Treat as write-only sink for now.
- **Mem outflow watch**: stub the outflow/OAuth integration for when it ships; don't depend on it yet.
- **Knowledge sync**: R2 ↔ NotebookLM ↔ Mem glue, with R2 as the durable system of record.
- **Hydrator**: generates ingestion + artifact-generation + sync tasks.

---

### CANNON 5 — RELAY (Slack Internal Bot + Comms Bridge)
**Why**: Slack is the human-facing control surface. Build after infra + memory so the bot has something to talk to.

**instance_target**: `relay`

**Pool themes**:
- **Internal bot on the new platform** (not classic): one bot token, event subscriptions, slash commands, incoming webhooks.
- **Cloudflare Worker host** for the bot (Slack signing-secret verification w/ `timingSafeEqual`, like the existing Discord bot pattern).
- **Google Workspace ↔ Slack**: Drive/Calendar/Gmail official apps + custom flows (meeting → channel reminder, high-priority Gmail label → ticket channel).
- **Cannon control via Slack**: `/pool status`, `/cannon pause`, `/burn report` slash commands hitting D1.
- **Cross-cannon bridge**: Slack as the unified event stream for ALL cannons (every salvo posts to a channel).
- **Business+ admin controls**: SSO, export, governance config.
- **Hydrator**: generates bot-feature + integration + automation tasks.

---

### CANNON 6 — BASTION (Bare-Metal / Self-Hosted Sovereignty)
**Why**: "Aggressive bare metal to a good logical degree." The logical degree = self-host what benefits from sovereignty, keep edge stuff on Cloudflare.

**instance_target**: `bastion`

**Pool themes**:
- **Reverse proxy + local DNS resolver** (the 2026 standard for secure local routing — no raw port-forwarding).
- **Docker-on-bare-metal hardening**: the UFW-bypass flaw (Docker punches through iptables) — explicit localhost binds, locked-down network.
- **Nextcloud** as the sovereign Drive/Workspace complement on NVMe.
- **Hybrid architecture**: high-IO / sensitive workloads on bare metal, edge + global on Cloudflare. Document the split logic.
- **Backup/DR**: 3-2-1 backups, encrypted, tested restores.
- **Tunnel, don't expose**: Cloudflare Tunnel from bare metal → no open inbound ports.
- **Monitoring**: host metrics, intrusion detection, log aggregation.
- **Hydrator**: generates hardening + self-host-migration + DR-test tasks.

---

### CANNON 7 — OVERMIND (Meta / Orchestration) — BUILD LAST
**Why**: Once multiple cannons run, you need one that watches and tunes the others. Optional — only if you want cannons coordinating cannons.

**instance_target**: `overmind`

**Pool themes**:
- **Cross-cannon dashboard**: unified view of all pools (waiting/running/completed/failed across fortress/conduit/ledger/relay/bastion).
- **Pool balancing**: detect a starving cannon, recommend task rebalancing.
- **Quality scoring**: score completed tasks across all cannons, surface systemic issues.
- **Trigger tasks** (the "fire other things" idea you floated): a cannon task whose job is to *enqueue work into another cannon's pool* or kick a scheduled fire — orchestration, not research.
- **Cost/throughput analytics**: aggregate burn rate, salvo distributions, hot/cold streaks.
- **Circuit-breaker oversight**: global pause if multiple cannons fail simultaneously.

---

## On Your "Trigger Tasks" Idea

You asked whether tasks could *fire other things* instead of being research/implementation work. **Yes — and it's a good idea.** Two clean ways to do it:

1. **Cross-pool enqueue task**: a task whose entire job is to `INSERT` tasks into a *different* cannon's pool. Fortress finishes DMARC → enqueues a "verify mail deliverability" task into Relay's pool.
2. **Fire-trigger task**: a task that calls `create_scheduled_task` to kick a specific cannon's next fire immediately (jump the queue) instead of waiting for the interval.

These live naturally in **OVERMIND (#7)** but can be dropped into any cannon's pool as needed. They turn the fleet from 7 isolated loops into a coordinated system. Recommend building them once OVERMIND exists so there's a clear owner.

---

## Recommended Build Order

1. **FORTRESS** — lock the foundation (identity, domain, DMARC). Nothing is safe until this is done.
2. **CONDUIT** — the Cloudflare platform your stuff runs on.
3. **LEDGER** — memory/knowledge substrate.
4. **RELAY** — human control surface (Slack).
5. **BASTION** — bare-metal sovereignty for what warrants it.
6. **OVERMIND** — orchestration over the fleet + trigger tasks.

Supermax keeps burning Claude Code + Cowork in parallel the whole time.

---

## Next Step

Tell me which cannon to fully build out next (schema + pool load + cannon prompt + controls, same depth as Supermax). Recommend **FORTRESS** first. I can build them one at a time or batch several — your call. No rush, full depth on each.
