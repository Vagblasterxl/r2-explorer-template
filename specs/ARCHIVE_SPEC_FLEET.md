# MISSION SPEC — The Fleet Archive (the pivot)

**What this is:** the same archive machine as the Cowork spec, re-aimed. Instead of
documenting a *product*, it documents **Ken's own fleet** — every Claude surface, agent,
routine, connector, repo, and worker he actually runs, as living files in the hub repo.
The Cowork spec answers "what can the tool do"; this one answers "what do WE have, where
is it, and how do I drive it." Paste the JSON into any Claude Code cloud session (or
fire the Hub Cast Cannon with it) and it executes — no Cowork required.

**Why the pivot earns its keep:** product docs go stale when Anthropic ships; fleet docs
go stale when KEN ships, which is daily. This is the archive that stops the
"I have four Claudes and I don't know what the hell is going on" problem permanently.

```json
{
  "task_id": "fleet_archive_v1",
  "objective": "Build and MAINTAIN an exhaustive archive of Ken's AI fleet — every surface, session, routine, connector, repo, worker, codex, and handoff pattern — as files under fleet/ in github.com/Vagblasterxl/r2-explorer-template. Ground truth for every future agent on every account.",

  "identity_context": {
    "operator": "Ken (kenwsimmons@hotmail.com)",
    "hub_repo": "github.com/Vagblasterxl/r2-explorer-template (branch claude/update-claude-md-TMCMZ until merged)",
    "prior_art": "ESTATE.md (inventory snapshot), AI_PIPELINE.md (hub architecture), SKILLS_CODEX.md + codex/ (verb library), the Drone Deck artifact. Build on these; never duplicate them — link and extend.",
    "walled_off": "Nothing about the legal matter enters this archive. Ever."
  },

  "operating_mode": {
    "autonomy": "full",
    "clarifying_questions_allowed": false,
    "write_files_incrementally": true,
    "default_behavior": "When in doubt, introspect the live environment and document what you actually observe, tagged [OBSERVED <date>]."
  },

  "research_scope": {
    "self_introspection_first": "Your live environment IS the primary source: list_sessions, list_triggers, list_environments, list_repos, connector/MCP tool inventory via ToolSearch sweeps (git, email, drive, calendar, memory, browser, cloudflare, tasks, docs, artifacts, webhook, schedule, message, search), gh api for repo truth, wrangler/MCP for worker truth.",
    "web_second": "docs.claude.com and support.claude.com only to explain mechanisms the environment exposes (routines, environments, connectors), not as a substitute for live observation.",
    "cross_account": "Document per-account differences explicitly: this archive serves all 4 accounts, so every entry says WHICH account it was observed from."
  },

  "deliverable_files": [
    "fleet/fleet_index.md — TOC, purpose, last-verified dates, gaps",
    "fleet/fleet_surfaces.md — every Claude surface Ken touches (Code cloud, Cowork, claude.ai, phone, Chrome, Google AI Studio family, Grok relays): what each can reach, what it can't, when to use which",
    "fleet/fleet_tools.md — the live tool surface of a Claude Code cloud session on this account: every tool, parameters, limits, observed behavior, example calls; deferred-tool sweep results table",
    "fleet/fleet_routines.md — every Routine (list_triggers): id, schedule, prompt summary, last-run status, which are armed vs dead",
    "fleet/fleet_connectors.md — every connector/MCP server seen per account: working, auth-required, failed; what each unlocks",
    "fleet/fleet_sessions.md — the living sessions map: active, blocked-on-Ken, archived-noise; cost notes; how to wake or archive one",
    "fleet/fleet_repos.md — repo-by-repo: purpose, state, canonical-or-clutter verdict, cross-links to workers it deploys",
    "fleet/fleet_workers.md — worker-by-worker across all CF accounts: what it does, source location, last deploy, keep/kill verdict (extends ESTATE.md)",
    "fleet/fleet_handoffs.md — the exact paste blocks for moving work between surfaces and accounts: bootstrap lines, cast syntax, what context each surface needs",
    "fleet/fleet_playbook.md — failure drills: session hit rate limit, branch force-pushed, connector died, routine misfired, container wiped — the observed fix for each",
    "fleet/fleet_changelog.md — dated per-pass entries"
  ],

  "execution_rules": [
    "Observe first, search second. Tag live observations [OBSERVED <date>] and doc claims [DOCS <url>].",
    "Update in place on re-runs; append to the changelog; never fork versioned filenames.",
    "Every file header: Last verified / Pass / Confidence.",
    "Use real names from Ken's estate everywhere — real repos, real workers, real session titles.",
    "Secrets, tokens, and legal content never enter the archive.",
    "Exhaustive but navigable: fleet_index.md must let a cold agent find anything in two hops.",
    "Finish by updating STATUS.md in the hub and opening/updating a draft PR."
  ],

  "completion_criteria": {
    "pass_done_when": "All 11 fleet/ files exist with content or explicit [UNKNOWN] tags, pushed to the hub branch, draft PR open, changelog entry written.",
    "final_report": ["one line per file", "gaps with reasons", "ranked next-pass targets", "anything observed that contradicts ESTATE.md or the codices"]
  },

  "forbidden_actions": [
    "Asking questions before pass completion", "Early stopping", "Fabricating tools, routines, or session facts",
    "Merging or closing PRs", "Deleting anything", "Touching legal matters", "Duplicating ESTATE.md/codex content instead of linking it"
  ],

  "begin_instruction": "Begin immediately. Create fleet/fleet_index.md as a stub, then run the live introspection sweeps (sessions, triggers, repos, environments, tool search), writing files as results land. Web research only where live observation can't answer. Push incrementally."
}
```

---

**How to fire it:** paste the JSON into any new Claude Code session on any account — or
fire the **Hub Cast Cannon** routine with this file's raw GitHub URL as the payload.
Each account that runs it adds its own [OBSERVED] entries, so the archive converges on
the full four-account picture without any account needing to see the others directly.
