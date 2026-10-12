# THE PIPELINE — One Hub for Every Claude, Every Account

**TL;DR: This repo IS the hub. Cloudflare Email Routing dumps mail into the R2 bucket.
Every Gmail forwards into it. Every GitHub pushes into it. Every Claude reads from it.
You stop juggling four accounts because they all point at ONE place.**

---

## The Big Picture

```
 Gmail #1 (kenwsimmons@hotmail.com)*  ─┐
 Gmail #2 (vagblasterxl@gmail.com)    ─┤   auto-forward
 Gmail #3 (rogerdoger6942013@...)     ─┼──────────────►  ai@YOUR-DOMAIN.com
 Gmail #4 (assblasterxl@gmail.com)    ─┘                      │
                                                              ▼
                                               Cloudflare Email Routing
                                                              │
                                                              ▼
                                            THIS WORKER (r2-explorer-template)
                                                              │
                                                              ▼
                                              R2 bucket: r2-explorer-bucket
                                                              │
                                   ┌──────────────┬───────────┼──────────────┐
                                   ▼              ▼           ▼              ▼
                               Claude #1      Claude #2   Claude #3      Claude #4
                            (any session, any account — they all read the same bucket)
```
*hotmail forwards via Outlook rules instead of Gmail filters — same idea.

**Why this works:** R2-Explorer (this repo) natively receives email via Cloudflare
Email Routing and shows it like an inbox. The R2 bucket becomes the shared mailbox
every AI can see. No account walls. No session walls.

---

## PART 1 — Cloudflare side (do once, ~15 min)

You have two visible CF accounts right now: **Assblasterxl@gmail.com** and
**Kenwsimmons@hotmail.com**. Pick ONE to be the hub (recommend whichever owns a domain).

1. **Get a domain on that CF account** (any cheap one, e.g. via Cloudflare Registrar).
2. **Deploy this repo** to that account: `npx wrangler deploy`
3. **Enable Email Routing** on the domain (CF Dashboard → Email → Email Routing).
4. **Create addresses and route them to this Worker:**
   - `ai@yourdomain.com` → Worker `r2-explorer-template` (everything AI-related)
   - `code@yourdomain.com` → same Worker (GitHub/CI notifications)
   - `intake@yourdomain.com` → same Worker (raw forwards from the 4 Gmails)
5. **Add the email handler** to `wrangler.json`:
   ```json
   "send_email": [],
   ```
   and the route binding is automatic once Email Routing targets the Worker.
6. Emails now land in the R2 bucket under `.r2-explorer/emails/` and show up
   in the web UI's Email tab. Every Claude that can hit the deployed URL reads them.

## PART 2 — Gmail side (do once per account, ~3 min each)

On EACH of the 4 accounts (Gmail Settings → Forwarding and POP/IMAP):

1. Add forwarding address: `intake@yourdomain.com` → verify (click link that
   arrives — it lands in the R2 bucket, read it in R2-Explorer!).
2. Create ONE filter per account:
   - **Match**: `from:(github.com OR google.com OR anthropic.com OR cloudflare.com)`
     (tune to taste — this catches the AI/dev mail without forwarding personal stuff)
   - **Action**: Forward to `intake@yourdomain.com`, apply label `AI-PIPE`
3. Done. The "ricochet" now converges instead of bouncing around.

**Hotmail (kenwsimmons)**: Outlook.com → Settings → Mail → Rules → same pattern.

## PART 3 — GitHub side (the multi-github problem)

Rule: **one project = one canonical repo**, owned by whichever GitHub account, with
the other accounts added as collaborators (repo → Settings → Collaborators).

- Every repo gets a `CLAUDE.MD` (this repo already has one — copy the pattern).
- Branches named `claude/<task>-<id>` so you can tell AI work from your work.
- Any Claude session on any account: `git clone` → read CLAUDE.MD → work → push.
  GitHub is the code brain. The R2 bucket is the mail brain.

## PART 4 — The 5-AI pipeline (roles, not wiring)

No watchers, no daemons — YOU fire each one when you want it. Each role is just
a prompt you paste into any Claude Code / Cowork session:

| # | Role      | What you tell it |
|---|-----------|------------------|
| 1 | INTAKE    | "Open the R2-Explorer emails, summarize what came in since <date>." |
| 2 | ROUTER    | "From that summary, tell me which repo/project each item belongs to." |
| 3 | BUILDER   | "Clone <repo>, read CLAUDE.MD, do <task>, push branch, open draft PR." |
| 4 | PUBLISHER | "Write up what Builder did; put it in the repo and draft the email/post." |
| 5 | ARCHIVIST | "Update CLAUDE.MD / status files so the next session knows where we are." |

Run them in order when you have energy; skip any you don't need. The hub makes
each one cheap because context lives in the bucket + repo, not in your head.

## PART 5 — The handoff block (paste into ANY new Claude session)

```
HUB BOOTSTRAP:
- Code brain: github.com/Vagblasterxl/r2-explorer-template (branch claude/update-claude-md-TMCMZ)
- Read CLAUDE.MD first, then AI_PIPELINE.md.
- Mail brain: the deployed R2-Explorer URL (emails land in the bucket).
- Do the task, push a claude/<task> branch, open a draft PR, update status files.
```

## What about the Google AI Studio "family"?

Google's agent/family setup lives inside Google's walls — it can't be wired into
this directly, and it doesn't need to be. Point it at the same two anchors:
the GitHub repo URL and the deployed R2-Explorer URL. Any AI from any vendor
that can read a URL can join the pipeline. The hub doesn't care whose logo is
on the AI.

## Ground rules (your words, kept)

- Nothing runs on its own. Email forwarding is dumb plumbing, not an agent.
- You fire every AI manually. This is a tool, not a system that watches you.
- Legal matter stays completely out of this pipeline. Separate account, separate
  everything.

---

**Bottom line: deploy this Worker + one domain + email routing = every account's
mail in one bucket; one canonical repo per project = every account's code in one
place. Four accounts, one brain.**
