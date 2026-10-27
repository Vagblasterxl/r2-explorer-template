# GO-LIVE: Discord bot + Cloudflare, first light

**Goal:** you type `/ping` in your Discord server and the bot answers `Pong! 🏓 Bot is online!`. That reply means it's live: Discord is talking to your Cloudflare Worker, and that Worker can reach your storage.

**Who runs this:** you, on **your own computer** (the one with `/home/box/.secrets/`). The keys are there and the cloud Claude can't reach them. Each step is copy, paste, Enter. Expect 30–45 minutes.

**Rule:** never paste a token or key into a chat. Only into your terminal or the websites named below.

---

## What you're turning on

| Piece | Where it lives | Status before this runbook |
|---|---|---|
| The Worker (file browser + Discord bot + email + webhooks + admin page) | GitHub `Vagblasterxl/r2-explorer-template`, branch `claude/document-skills-2hT6I`, file `src/index-enhanced.ts`, config `wrangler.enhanced.json` | Code finished, never deployed. Its build was checked on 2026-10-23 and passes. |
| Cloudflare account it goes on | **Hotmail account** (Kenwsimmons, id `ab02f4dfa746bf2e6b3d9ff634bb135a`). Keys are in `/home/box/.secrets/cloudflare-hotmail.env` | Keys exist; nothing deployed |
| Discord app | discord.com/developers | **Not created yet.** You create it in Step 4. |
| Polar | Assblasterxl account | Separate, and not part of this runbook. See the end. |

Slash commands the bot will have: `/ping`, `/stats` (file count and size), `/list [folder]`, `/upload` (only replies with instructions), `/delete filename` (really deletes — Step 10 locks it down).

---

## Step 1: Check your tools (2 min)

Open a terminal and run:

```bash
node -v
git --version
```

- If `node -v` prints `v18` or higher, you're good. If it prints nothing or an error, install Node.js LTS from nodejs.org, close the terminal, and open a new one.
- If `git --version` fails, install git (`sudo apt install git` on Linux).

## Step 2: Get the code (3 min)

```bash
cd ~
git clone https://github.com/Vagblasterxl/r2-explorer-template.git
cd r2-explorer-template
git checkout claude/document-skills-2hT6I
npm install
```

The last command should end without the word `ERR`. Warnings are fine.

## Step 3: Load your Hotmail Cloudflare keys (3 min)

```bash
set -a; source /home/box/.secrets/cloudflare-hotmail.env; set +a
env | grep -o '^CLOUDFLARE[A-Z_]*'
```

The second line prints only the **names** of your keys, never their values. You need to see both of these:

```
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

**If your file uses different names** (for example `CF_API_TOKEN`), copy them over. Use your names on the right-hand side:

```bash
export CLOUDFLARE_API_TOKEN="$CF_API_TOKEN"
export CLOUDFLARE_ACCOUNT_ID="$CF_ACCOUNT_ID"
```

Now prove the key works:

```bash
npx wrangler whoami
```

✅ **Pass:** it shows the Hotmail account. ❌ **Fail:** "Invalid token" or "Authentication error" means the token is wrong or expired. Go to dash.cloudflare.com → profile icon → **API Tokens** → **Create Token** → template **"Edit Cloudflare Workers"**, put the new token in the file, and run Step 3 again.

> These keys only last for this terminal window. If you close it, run Step 3 again.

## Step 4: Create the Discord app (10 min, in your web browser)

1. Go to **https://discord.com/developers/applications** → **New Application** → name it (for example "Box Bot") → **Create**.
2. On **General Information**, copy two values into a notepad. Both are public, not secret:
   - **APPLICATION ID**
   - **PUBLIC KEY**
3. Left menu → **Bot** → **Reset Token** → **Yes, do it!** → copy the token. This one **is** secret, and Discord shows it only once.

## Step 5: Put the two public values into the config (2 min)

Open `wrangler.enhanced.json` in any text editor and find these two lines:

```json
    "DISCORD_APPLICATION_ID": "",
    "DISCORD_PUBLIC_KEY": ""
```

Paste your values between the quotes:

```json
    "DISCORD_APPLICATION_ID": "123456789012345678",
    "DISCORD_PUBLIC_KEY": "abcdef0123…your full public key…"
```

Save the file.

> Why here and not as secrets: these two aren't secret, and storing them this way avoids a known conflict where a setting and a secret with the same name clash. Only the bot token is a secret.

## Step 6: Make sure the storage bucket exists (1 min)

```bash
npx wrangler r2 bucket list
```

If `r2-explorer-bucket` is **not** in the list:

```bash
npx wrangler r2 bucket create r2-explorer-bucket
```

## Step 7: Deploy (2 min)

```bash
npx wrangler deploy --config wrangler.enhanced.json
```

- If it asks you to register a `workers.dev` subdomain, say yes and pick any name.
- ✅ **Pass:** it prints a URL like `https://r2-explorer-enhanced.YOURNAME.workers.dev`. **Copy that URL.** It's called YOUR-URL below.

Now store the bot token as a secret. It prompts you, and you paste the token from Step 4.3:

```bash
npx wrangler secret put DISCORD_BOT_TOKEN --config wrangler.enhanced.json
```

## Step 8: Check it's alive (1 min)

```bash
curl https://YOUR-URL/health
```

✅ **Pass:** the output contains `"status":"ok"` and `"discordBot":true`.
❌ If it shows `"discordBot":false`, the App ID didn't get saved. Redo Step 5 and Step 7 (just the deploy command).

You can also open `https://YOUR-URL/` in a browser. That's your file browser, and it's read-only.

## Step 9: Connect Discord to the Worker (5 min)

1. Back at discord.com/developers → your app → **General Information** → **Interactions Endpoint URL**, paste:
   ```
   https://YOUR-URL/discord/interactions
   ```
   → **Save Changes**.
   ✅ **Pass:** it saves without a red error. Discord just tested your Worker's signature check, and it passed.
2. Register the slash commands:
   ```bash
   curl -X POST https://YOUR-URL/discord/register
   ```
   ✅ **Pass:** it prints `Commands registered successfully!`
3. Invite the bot to your server: left menu → **OAuth2** → **URL Generator** → tick **`bot`** and **`applications.commands`** → copy the generated URL at the bottom → open it → pick your server → **Authorize**.

## Step 10: First light + lock `/delete` (3 min)

1. In your Discord server, type **`/ping`** → expect **"Pong! 🏓 Bot is online!"** 🎉 **It's live.**
2. Try **`/stats`** and **`/list`**.
3. **Lock down `/delete` now.** Anyone in the server can use it, and it really deletes files. Go to Discord → **Server Settings** → **Integrations** → your bot → `/delete` → turn off **@everyone** and allow only yourself or an admin role.

---

## If something fails

| What you see | What it means | Fix |
|---|---|---|
| `wrangler: command not found` | Dependencies didn't install | Step 2: run `npm install` again inside the folder |
| `Authentication error` / `Invalid token` | The key is wrong or not loaded | Step 3 again, in the same terminal window |
| Deploy says the bucket doesn't exist | No storage bucket on this account | Step 6 |
| Discord says **"interactions endpoint url could not be verified"** | The URL or the public key is wrong | Check the URL ends in `/discord/interactions`, check Step 5's PUBLIC KEY has no extra spaces, redeploy (Step 7), then Save again |
| `/discord/register` says `Bot token not configured` | The secret wasn't saved | Run the `wrangler secret put` command in Step 7 again |
| `Failed to register commands: 401` | The bot token is wrong | Reset the token (Step 4.3) and run `secret put` again |
| `/ping` doesn't appear in Discord | Commands take a moment, or the bot isn't in the server | Wait 1 minute, reload Discord, and redo Step 9.3 |
| Bot says "The application did not respond" | The Worker crashed on that command | Run `npx wrangler tail --config wrangler.enhanced.json`, run the command again in Discord, and copy the red error to Claude |

---

## Known open doors (fine for first light, close them soon)

- **`/admin` and `/webhook/logs` are public.** Anyone with the URL can see storage stats and webhook logs. Fix later with Cloudflare Access (dashboard → Zero Trust → Access → put a login in front of YOUR-URL).
- **`/discord/register` can be triggered by anyone.** It only re-registers the same commands, so it's harmless.
- **`/upload` doesn't upload.** It only replies with instructions. That's a future feature.
- The four red "Workers Builds" checks on the GitHub pull request are **unrelated**. They're three other Workers on the Vagblasterxl account wired to this repo. Ignore them for this runbook.

## Optional next: put it on your domain

If `xethical-ai.com` is on the Hotmail Cloudflare account: dashboard → **Workers & Pages** → `r2-explorer-enhanced` → **Settings** → **Domains & Routes** → **Add** → **Custom domain** → for example `files.xethical-ai.com`. Then update the Discord Interactions URL from Step 9.1 to `https://files.xethical-ai.com/discord/interactions`.

---

## Polar (phase 2, after `/ping` works)

None of the Polar code is in this repo. Polar lives on the **Assblasterxl** account (keys: `/home/box/.secrets/cloudflare-assblaster.env`). According to another Claude's notes (not verified here), the pieces are a `polar-mcp` Worker, a `polar-mcp` GitHub repo, and a session called "Polar webhook security".

To get it alive, paste this into the Claude chat that built Polar:

> Push all Polar work to GitHub and reply with: repo name, branch, the Worker name, which Cloudflare account, what keys/secrets it expects (names only), and the one URL Polar's dashboard should send webhooks to.

With those answers, Polar goes live using the same pattern as this runbook: load the Assblasterxl keys → deploy → set secrets → paste the webhook URL into Polar's dashboard → send a test event.

---

## Hand this to a Claude running on your computer (optional)

If you have Claude Code on the same computer, paste this and let it drive:

> Work in `~/r2-explorer-template` on branch `claude/document-skills-2hT6I`. Follow `GO-LIVE.md` exactly, Steps 1–10. Load keys only by running `set -a; source /home/box/.secrets/cloudflare-hotmail.env; set +a`. Never print, echo, or log any key value. Stop and ask me before Step 4 (I create the Discord app in my browser), and whenever a ✅ Pass check fails. Don't change any code except the two values in Step 5. Done means `/ping` answers in Discord. Report the live URL and which steps passed.
