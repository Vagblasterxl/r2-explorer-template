# MISSION SPEC — Cowork Knowledge Archive v3 (finished)

**What this is:** the completed, hardened version of the v2 spec. Paste the JSON block
into a Cowork session and walk away. v3 fixes what v2 left open: versioning, a refresh
cadence, a drift check, hub cross-linking, and an explicit "who am I" block so any
account's Cowork individualizes the archive to Ken's estate automatically.

**Changes from v2:** added `identity_context` (the individualization), `versioning`
rules so re-runs update instead of duplicate, deliverable 14 (`cowork_changelog.md`),
a 15-minute drift check that compares the archive against reality before researching,
sharper completion criteria, and the hub handoff so other surfaces can find the archive.

```json
{
  "task_id": "cowork_knowledge_archive_v3",
  "objective": "Build and MAINTAIN a permanent, exhaustive, self-contained knowledge archive of Cowork as persistent files in this project. Ground truth for all future sessions. No clarifying questions. No early stopping. No summarization in place of research.",

  "identity_context": {
    "operator": "Ken (kenwsimmons@hotmail.com)",
    "hub_repo": "github.com/Vagblasterxl/r2-explorer-template — read CLAUDE.MD and SKILLS_CODEX.md there for the estate's conventions",
    "estate_notes": "Ken runs 4 Claude accounts, ~33 GitHub repos (Vagblasterxl + assblasterxl-rgb), ~29 Cloudflare Workers across Kenwsimmons/Assblasterxl/Vagblasterxl CF accounts (Symphony stack, memory-bridge, r2-vault). Archive examples should use HIS real repos and workers, not invented ones.",
    "walled_off": "Nothing about the legal matter enters this archive. Ever."
  },

  "versioning": {
    "on_rerun": "Update existing files in place; never create cowork_overview_v2.md style duplicates.",
    "every_file_header": "Last verified: <date> | Pass: <n> | Confidence: verified/partial/stale",
    "changelog": "Every pass appends a dated entry to cowork_changelog.md: what changed, what was confirmed stale, what is newly unknown.",
    "drift_check_first": "Before researching, spend <15 min comparing the existing archive's tool inventory against your live tool surface. Anything that moved gets researched first."
  },

  "operating_mode": {
    "autonomy": "full",
    "clarifying_questions_allowed": false,
    "default_behavior": "When in doubt, research further and document both possibilities rather than asking.",
    "write_files_incrementally": true,
    "do_not_wait_for_user_between_files": true
  },

  "research_scope": {
    "primary_sources": ["https://docs.claude.com", "https://support.claude.com", "https://www.anthropic.com/news", "Cowork product pages, changelogs, release notes, beta docs"],
    "secondary_sources": ["Anthropic engineering blog", "official X announcements", "credible community write-ups, Reddit, HN, YouTube demos"],
    "self_introspection": "Your own live tool surface is a first-class research target: every tool name, parameter, limit, observed behavior, example call. Run 20+ tool_search keyword sweeps (calendar, mail, drive, slack, browser, code, weather, places, music, files, search, image, video, recipe, message, terminal, automation, memory, tasks, artifacts) and inventory everything. Catalog /mnt/skills/public, /mnt/skills/user, /mnt/skills/example: trigger descriptions verbatim plus full folder listings."
  },

  "deliverable_files": [
    "cowork_index.md — master TOC, archive purpose, known gaps",
    "cowork_overview.md — what Cowork is, platforms, install, plans, vs Claude Code/claude.ai/Chrome",
    "cowork_capabilities.md — every tool, every parameter, observed vs documented",
    "cowork_filesystem.md — readable/writable locations, sandbox, permission prompts, cloud drives",
    "cowork_workflows.md — orchestration patterns, long runs, failure recovery, scheduled missions and mission buttons",
    "cowork_integrations.md — MCP servers, connectors, third_party_mcp_app, cross-surface handoffs",
    "cowork_limits.md — rate/context/session/concurrency limits, cost, failure modes incl. mission-button rearm bug",
    "cowork_security.md — permission model, what leaves the machine, retention, enterprise controls",
    "cowork_undocumented.md — community findings, gotchas, unofficial workarounds, clearly marked unofficial",
    "cowork_pricing.md — plan gating, usage costs, overage behavior",
    "cowork_roadmap.md — announced features, betas, deprecations",
    "cowork_deferred_tools.md — tool_search sweeps table, deferred tool catalog, SKILL.md inventories, inline rendering tools",
    "cowork_sources.md — every URL with description and access date",
    "cowork_changelog.md — dated per-pass change entries (NEW in v3)"
  ],

  "execution_rules": [
    "Search aggressively; training data is stale for Cowork.",
    "Write files incrementally, never all at the end.",
    "Conflicting sources: document both, label which is official.",
    "Unverifiable fact: keep it, tag [UNVERIFIED] with the reason.",
    "Unknown: write [UNKNOWN — requires further research]. Never fabricate names, parameters, or limits.",
    "Exhaustiveness over brevity. Cite non-obvious claims inline.",
    "Use Ken's real estate (identity_context) for every example.",
    "At the end, leave one line in the hub repo's STATUS.md (or report it) so other surfaces know the archive's location and pass number."
  ],

  "completion_criteria": {
    "pass_done_when": "All 14 files exist with required content or explicit [UNKNOWN]/[UNVERIFIED] tags, headers carry today's date, and the changelog has this pass's entry.",
    "final_report": ["one line per file written", "gaps with reasons", "ranked next-pass targets", "contradictions found, both versions"]
  },

  "forbidden_actions": [
    "Asking questions before pass completion", "Early stopping", "Summarizing instead of documenting",
    "Inventing facts", "Combining deliverables into one file", "Skipping self-introspection, tool sweeps, or SKILL.md inventory",
    "Touching anything legal-related", "Creating duplicate versioned files instead of updating in place"
  ],

  "begin_instruction": "Begin immediately. Run the drift check if the archive exists; otherwise create cowork_index.md as a stub, then proceed file by file in order without pausing."
}
```
