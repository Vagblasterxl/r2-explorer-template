# FLEET ARCHIVE — Routines

Last verified: 2026-10-12 | Pass: 0 (seed) | Confidence: verified for this account
All entries [OBSERVED 2026-10-12] from the account that owns the hub session.

## Armed routines

| Routine | ID | Fires | What it does |
|---------|----|----|--------------|
| Daily Intake Sweep (SWEEP+TRIAGE+DIGEST) | `trig_01CsES4FQwiqPDDekxtvazZ3` | daily 7:52am PT, fresh session | Sweeps AI/dev email senders, triages, checks hub PRs, delivers digest (email if Gmail reachable, else commits DIGEST-<date>.md). First fire: 2026-10-13. |
| GitHub Butler | `trig_01GqqAvauEqY8MzFQeaLMbfs` | on demand (fire_trigger) | Sweeps open PRs across repos, small safe fixes only, never merges; report by email or BUTLER-REPORT file. |
| Hub Cast Cannon | `trig_01Nzt3yDUAZCkYkfzGUcHtsa` | on demand, takes a payload | Executes any Skills Codex verb passed as the firing text; defaults to CAST SNAPSHOT. Hard limits baked in (no merge/delete/legal/spend). |

## Known constraints [OBSERVED 2026-10-12]

- Routines created from inside a Code session on this org **cannot store connectors** —
  fired sessions run without Gmail/Drive/etc. tools. Remedy: recreate or edit the
  routine in the claude.ai Routines UI to attach connectors. Until then the prompts'
  file-commit fallbacks apply.
- One-shot self check-ins (send_later) disable themselves after firing; this session
  used one for PR #5 babysitting (`trig_01RvxFED3d5sw29sm5Goq8GK`, fired ~16:47Z).

## How to drive them from any session

- List: `list_triggers` · Fire now: `fire_trigger(trigger_id, text?)` ·
  Pause: `update_trigger(trigger_id, enabled:false)` · Delete only on Ken's say-so.
