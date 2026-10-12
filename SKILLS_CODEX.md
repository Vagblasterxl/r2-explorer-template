# THE SKILLS CODEX — Universal Action Handbook

**TL;DR: This is the verb book. Every entry is a castable one-liner — paste it into any
Claude (Code, Cowork, phone, any account) and that agent knows exactly what to do.
Everything reads the hub first, everything leaves its output where the next agent can
find it. Cast syntax: `CAST <VERB> [target] [notes]`.**

---

## THE PRIME DIRECTIVE (every agent, every cast)

```
Before any cast: read CLAUDE.MD, then AI_PIPELINE.md in
github.com/Vagblasterxl/r2-explorer-template. Output goes to: the repo (code/docs),
the R2 bucket (files/mail), or kenwsimmons@hotmail.com (reports). Leave the estate
cleaner than you found it. One branch per task: claude/<verb>-<target>.
```

---

## WING 1 — INTAKE (email & signal)

| Verb | Cast line |
|------|-----------|
| **SWEEP** | "Read my Gmail for anything from github/cloudflare/anthropic/google since <date>; summarize in 10 bullets max, newest first." |
| **TRIAGE** | "From that sweep, tag each item: ACT-NOW / THIS-WEEK / FYI / DELETE. Nothing untagged." |
| **DIGEST** | "Compress everything that happened today across email + PRs into one email to kenwsimmons@hotmail.com. Top 3 lines = the whole story." |
| **HUNT** | "Search my email for <topic>; build a timeline of every message about it." |
| **UNSUB** | "List the 20 noisiest senders in my inbox this month; draft the unsubscribe hit-list." |
| **VERIFY-LINK** | "Find the verification/confirmation email for <service> and give me just the link." |

## WING 2 — GITHUB (every knob)

| Verb | Cast line |
|------|-----------|
| **LAND** | "Clone <repo>, read CLAUDE.MD, do <task>, push claude/<task> branch, open draft PR." |
| **BUTLER** | "Sweep every open PR on my repos: CI state, conflicts, stale reviews. Fix what's small, report what's not." |
| **GREEN** | "PR <#> is red. Root-cause the failure, fix or prove it's not the PR's, push or comment." |
| **SHIELD** | "Add CLAUDE.MD + a basic CI workflow to <repo> so future agents land safely." |
| **GRAVEYARD** | "List my repos untouched for 60+ days; propose archive list; archive on my 'go'." |
| **TWIN** | "Mirror <repo> to <other-account>/<repo> and set up the collaborator invite." |
| **CHRONICLE** | "Write RELEASE-NOTES.md from the last 30 days of commits across my active repos." |
| **BISECT** | "Something broke in <repo> between <date> and now. Find the commit that did it." |
| **SENTRY** | "Subscribe to PR <#> and babysit it to merge: fix CI, answer reviews, nudge me only when human approval is the blocker." |
| **CUSTODIAN** | "Audit <repo>: secrets in history, stale branches, missing .gitignore entries. Report, don't touch." |

## WING 3 — CLOUDFLARE (the worker estate)

| Verb | Cast line |
|------|-----------|
| **CENSUS** | "List every Worker, R2 bucket, D1 and KV on all my CF accounts; diff against ESTATE.md; update it." |
| **AUTOPSY** | "Worker <name> is failing. Pull what you can, reproduce locally, name the fix." |
| **SHRINKWRAP** | "Capture Worker <name>'s source + config into repos so it's never dashboard-only again." |
| **MAILHOOK** | "Stand up Cloudflare Email Routing on <domain> → the r2-explorer Worker, per AI_PIPELINE.md Part 1." |
| **UNPLUG** | "Walk me through disconnecting <worker> from <repo>'s Git integration — exact clicks." |

## WING 4 — MEMORY (the brain)

| Verb | Cast line |
|------|-----------|
| **ENGRAVE** | "Save this decision/fact to the repo's CLAUDE.MD (or Mem0 if connected) so every future agent knows it." |
| **RECALL** | "Before anything else: what do the hub docs + memory stores say about <topic>?" |
| **BRIDGE** | "Leave one line in the shared-memory lane saying what this session worked on." |
| **SNAPSHOT** | "Write STATUS.md: what's done, what's mid-flight, what's blocked, in that order." |
| **ARCHAEOLOGY** | "Dig through my old sessions/repos for everything about <topic>; one page, dated." |
| **DEDUPE** | "Find the places where the same idea lives twice (repos, docs, workers); propose the canonical home." |

## WING 5 — PUBLISH (make it real)

| Verb | Cast line |
|------|-----------|
| **HERALD** | "Turn <thing> into: 1 email, 1 Slack block, 1 README section. Same facts, three shapes." |
| **DECKHAND** | "Build a 5-slide deck from <doc>. Title, problem, picture, proof, next step." |
| **PAGE** | "Publish <content> as a private artifact page I can share with one link." |
| **LEDGER** | "Append today's events to the running log, dated, one line each." |
| **BRIEF** | "Morning brief: calendar + inbox top 5 + PR states + one suggested first move." |

## WING 6 — STORY (the branching narrative engine)

The same cast system runs fiction. Characters = agents. Scenes = tasks. Branches = PRs.

| Verb | Cast line |
|------|-----------|
| **CAST-CALL** | "Define 4 characters (name, want, wound, voice) and lock them in CANON.md." |
| **SCENE** | "Write scene <n>: <who> wants <what>, <obstacle> stops them. End on a turn." |
| **BRANCH** | "Fork the story at <moment>: write the other choice. Each branch = its own file." |
| **STORYBOARD** | "Convert scene <n> into Veo/Grok video prompts, shot by shot." |
| **WEAVE** | "Read all branch files; map which converge, which dead-end; draw the tree." |
| **CANON-CHECK** | "Does scene <n> break anything in CANON.md? List violations or bless it." |
| **FIGHT** | "Choreograph the fight in scene <n>: space, stakes, 3 reversals, cost." |

## WING 7 — OPS (automation & self-running)

| Verb | Cast line |
|------|-----------|
| **ROUTINE** | "Create a routine: every <when>, do <cast>, email me only if something changed." |
| **WAKE-ME** | "Remind this session in <n> minutes to check <thing>." |
| **FUSE** | "If <condition> is true when you check, do <small action>; otherwise stay silent." |
| **RELAY** | "Hand this task to a fresh session with a complete standalone brief; report its session ID." |
| **SWARM** | "Split <big task> into <n> independent pieces; run them as parallel agents; merge results." |
| **COST-WATCH** | "Report what my sessions spent this week; flag the one burning the most." |

## WING 8 — WEBHOOKS & REACTIONS (the nervous system)

| Verb | Cast line |
|------|-----------|
| **EAR** | "Give this session an inbound webhook URL (watch_url); tell me what can post to it." |
| **PR-EAR** | "Subscribe to PR activity on <repo>#<n> — react to every CI result and comment." |
| **MAIL-REFLEX** | "When the intake routine finds an email matching <pattern>, do <cast> in response." |
| **CF-EAR** | "Design a Cloudflare Worker webhook receiver: POST in → R2 log + email alert out. (The permanent personal webhook — survives all sessions.)" |

---

## INTEROPERABILITY RULES (how the dots connect)

1. **Every verb's output is another verb's input.** SWEEP feeds TRIAGE feeds DIGEST.
   CENSUS feeds GRAVEYARD. SCENE feeds BRANCH feeds WEAVE.
2. **Files are the API.** Agents don't talk to each other; they read and write the same
   repo. A verb that doesn't leave a file didn't happen.
3. **One verb per branch, one branch per PR.** The PR title is the cast line.
4. **The Codex is itself castable:** "Read SKILLS_CODEX.md and propose 3 new verbs this
   estate needs" is a legal cast.

---

**Bottom line: ~45 verbs, 8 wings, one syntax. Any Claude on any account can run any of
them cold, because the Prime Directive points them at the hub first. Cast away.**
