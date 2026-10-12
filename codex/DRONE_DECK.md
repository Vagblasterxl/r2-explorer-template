# THE DRONE DECK — One-Hit Buttons

**TL;DR: 20 complete, paste-ready prompts. Log into any Claude, paste one, walk away.
Each button is self-contained — it carries its own briefing, so even a cold agent on a
different account executes it right. The live clickable version is published as an
artifact (link in the repo README/PR).**

Every button silently includes this header — repeated in each prompt so copy-paste works:
> *"Read CLAUDE.MD and SKILLS_CODEX.md in github.com/Vagblasterxl/r2-explorer-template
> first (branch claude/update-claude-md-TMCMZ if unmerged). Output to the repo, R2, or
> kenwsimmons@hotmail.com. Never merge PRs, never delete, never touch legal matters."*

---

## ROW 1 — DAILY DRIVERS

**[1] MORNING** — "Hub bootstrap (header above). Then: summarize my unread AI/dev email,
list my open PRs with their states, and end with the ONE thing you'd do first today."

**[2] INBOX ZERO-ISH** — "Hub bootstrap. Sweep my inbox's last 48h: tag every thread
ACT-NOW / THIS-WEEK / FYI / DELETE-candidate. Touch nothing, just the list."

**[3] PR SWEEP** — "Hub bootstrap. Check every open PR on my repos: CI, conflicts,
stale reviews. Fix only small safe things on their branches. Report the rest."

**[4] SNAPSHOT** — "Hub bootstrap. Write/update STATUS.md in the hub: done, mid-flight,
blocked. Push it. Three sections, newest first."

**[5] WHAT CHANGED** — "Hub bootstrap. Diff the estate against ESTATE.md: new repos,
new workers, new sessions since it was written. Update the doc, push."

## ROW 2 — BUILDERS

**[6] LAND A TASK** — "Hub bootstrap. Task: <DESCRIBE IT>. Clone the right repo, branch
claude/<task>, build it, verify it runs, push, open a draft PR."

**[7] SHIELD A REPO** — "Hub bootstrap. Repo: <NAME>. Add CLAUDE.MD (copy the hub's
pattern), a .gitignore if missing, and a basic CI check. Draft PR."

**[8] AUTOPSY** — "Hub bootstrap. <THING> is broken. Reproduce it, root-cause it, name
the smallest fix, and apply it on a branch if it's under 20 lines."

**[9] CLONE-A-WORKER** — "Hub bootstrap. Capture Cloudflare Worker <NAME>'s source and
config into a new repo so it's never dashboard-only. Include a deploy README."

**[10] PROTOTYPE** — "Hub bootstrap. Build a single-file working prototype of <IDEA>.
Ugly is fine, running is mandatory. Push to a sandbox branch with a 5-line README."

## ROW 3 — MUSIC BAY (full pipelines, one hit)

**[11] SONG, START TO FINISH** — "Hub bootstrap + read codex/MUSIC_CODEX.md. Run the
full Music Pipeline on this seed: <FEELING/STORY>. Deliver: lyrics (FORM of your
choice, justified), 3 generator prompts (safe/weird/unhinged), arrangement grid,
and append to MUSIC-LEDGER.md."

**[12] ALBUM DAY** — "Hub bootstrap + MUSIC_CODEX.md. Here are my track titles/notes:
<LIST>. Run ALBUM-ARC, COVER-BRIEF, LINER, DROP-KIT. One file per output, pushed."

**[13] HOOK EMERGENCY** — "Hub bootstrap + MUSIC_CODEX.md. Song: <TITLE/PREMISE>.
Run HOOK-FORGE then REWRITE-HARDER on the best 3. I need one that sticks in 10 minutes."

## ROW 4 — VIDEO BAY

**[14] SCENE TO SHOTS** — "Hub bootstrap + read codex/VIDEO_CODEX.md. Scene: <PASTE OR
DESCRIBE>. Run SHOTLIST → PROMPT-PACK → CONTINUITY. Paste-ready Veo/Grok prompts out."

**[15] MUSIC VIDEO** — "Hub bootstrap + both MUSIC and VIDEO codices. Track: <NAME,
vibe, arrangement if known>. Run SYNC-MAP → DROP-SHOT → PROMPT-PACK → EDIT-A timeline."

**[16] MAKE IT TRAVEL** — "Hub bootstrap + VIDEO_CODEX.md. Video/script: <PASTE/LINK>.
Run TITLE-AB, THUMB-LAB, COLD-OPEN, CAPTION-PASS, CROSS-CUT. One kit, one file."

## ROW 5 — STORY & CLEANUP

**[17] STORY ENGINE** — "Hub bootstrap + SKILLS_CODEX.md Story wing. Premise: <ONE
LINE>. Run CAST-CALL (lock CANON.md), then SCENE 1-3, then BRANCH scene 3 both ways.
Each scene its own file, pushed."

**[18] GRAVEYARD** — "Hub bootstrap. List everything of mine untouched 60+ days (repos,
workers, sessions you can see). Propose the archive list. Execute NOTHING."

**[19] DEDUPE** — "Hub bootstrap. Find where the same idea lives twice across my repos
and docs. Propose one canonical home per idea. Report only."

**[20] SURPRISE ME** — "Hub bootstrap. Read the codices, look at the estate, and do the
single most useful 30-minute task you can find that touches nothing destructive. Then
tell me what you did and why it was the pick."

---

**Bottom line: 20 buttons, 5 rows, zero thinking required at the point of use. Fill the
<BLANK> if a button has one, paste, go. The Hub Cast Cannon routine can also fire any of
these: fire it with the button text as the payload.**
