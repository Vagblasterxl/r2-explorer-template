## 🚀 Enhanced R2 Explorer - Setup Guide

This is a **MEGA-POWERED** R2 Explorer with 8 integrated modules! Here's everything you built:

## 🎯 What You Got

### Core Modules (Backend)
1. **Email Handler** - Auto-saves email attachments to R2
2. **Webhook Receiver** - Catches webhooks from GitHub, Stripe, etc.
3. **Image Optimizer** - Serves optimized images (WebP/AVIF support)
4. **Admin Dashboard** - Beautiful analytics dashboard
5. **Discord Bot** - Full Discord integration with slash commands

### HUD Interfaces (Frontend)
6. **System Monitor HUD** - Badass green terminal-style system monitor
7. **Discord Control HUD** - Discord server management interface

## 📋 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Cloudflare

```bash
# Login to Cloudflare
npx wrangler login

# Create R2 bucket
npx wrangler r2 bucket create r2-explorer-bucket
```

### 3. Update Configuration

Edit `wrangler.json` and add Discord secrets (optional):

```json
{
  "vars": {
    "DISCORD_APPLICATION_ID": "your-app-id",
    "DISCORD_PUBLIC_KEY": "your-public-key"
  },
  "secrets": {
    "DISCORD_BOT_TOKEN": "your-bot-token"
  }
}
```

Add secrets:
```bash
npx wrangler secret put DISCORD_BOT_TOKEN
```

### 4. Choose Your Main File

You have TWO options:

**Option A: Basic R2 Explorer (Original)**
```bash
# Use src/index.ts (already configured)
npm run deploy
```

**Option B: Enhanced Multi-Module Version**
```bash
# Update wrangler.json main field to:
"main": "src/index-enhanced.ts"

npm run deploy
```

### 5. Test Locally

```bash
npm run dev
```

## 🎮 Using Your Modules

### Admin Dashboard
Visit: `https://your-worker.workers.dev/admin`

- View storage stats
- See recent uploads
- Monitor webhooks
- Real-time updates

### System Monitor HUD
Visit: `https://your-worker.workers.dev/hud/system`

- CPU/Memory/Network monitoring
- R2 storage stats
- Service status
- Activity logs
- **Perfect for touchscreens!**

### Discord HUD
Visit: `https://your-worker.workers.dev/hud/discord`

- View Discord servers
- Monitor messages
- Bot statistics
- Quick actions
- **Touchscreen optimized!**

### Webhook Receiver
Send webhooks to: `https://your-worker.workers.dev/webhook`

Supports auto-detection for:
- GitHub
- GitLab
- Stripe
- Slack
- Discord

View logs: `https://your-worker.workers.dev/webhook/logs`

### Discord Bot

1. **Register slash commands:**
```bash
curl -X POST https://your-worker.workers.dev/discord/register
```

2. **Set interaction endpoint in Discord Developer Portal:**
```
https://your-worker.workers.dev/discord/interactions
```

3. **Available commands:**
- `/stats` - Get R2 storage statistics
- `/list [folder]` - List files in R2
- `/ping` - Check bot status
- `/delete <filename>` - Delete file from R2

### Email Attachments

1. Configure Cloudflare Email Routing
2. Route emails to your worker
3. Attachments automatically save to `email-attachments/` folder

### Image Optimization

Upload images to R2, then serve via:
```
https://your-worker.workers.dev/images/your-image.jpg
```

Automatically serves WebP/AVIF based on browser support!

## 🔧 Environment Variables

### Required
- `bucket` - R2 bucket binding (configured in wrangler.json)

### Optional
- `DISCORD_APPLICATION_ID` - Discord app ID
- `DISCORD_PUBLIC_KEY` - Discord public key
- `DISCORD_BOT_TOKEN` - Discord bot token (secret)

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | R2 Explorer interface |
| `/admin` | GET | Admin dashboard |
| `/admin/api/stats` | GET | JSON stats |
| `/hud/system` | GET | System monitor HUD |
| `/hud/discord` | GET | Discord control HUD |
| `/webhook` | POST | Receive webhooks |
| `/webhook/logs` | GET | View webhook logs |
| `/discord/interactions` | POST | Discord bot endpoint |
| `/discord/register` | POST | Register slash commands |
| `/images/{key}` | GET | Optimized image serving |
| `/health` | GET | Health check |

## 🎨 Customization

### Enable File Uploads
Edit `src/index-enhanced.ts`:
```typescript
readonly: false,  // Change from true
```

### Add Authentication
Uncomment in `src/index-enhanced.ts`:
```typescript
cfAccessTeamName: "your-team-name",
```

### Custom Webhook Processing
Extend `WebhookReceiver` class in `src/modules/webhook-receiver.ts`:
```typescript
protected async processWebhook(webhookData: WebhookLog) {
  // Your custom logic here
  return { success: true };
}
```

## 🚀 Multi-Agent Workflow

Use this with your **8 AI agents**:

| Agent | Recommended Tasks |
|-------|-------------------|
| Claude 1 | Extend webhook module, add new integrations |
| Claude 2 | Build Google Drive → R2 sync |
| Claude 3 | Set up ARM server deployment scripts |
| Claude 4 | Enhance HUD interfaces, add new panels |
| Gemini Ultra | Write comprehensive tests |
| Gemini Pro | Security audit, penetration testing |
| Anti 1 | Build data pipelines, ETL jobs |
| Anti 2 | Create orchestration between all modules |

## 📁 Project Structure

```
r2-explorer-template/
├── src/
│   ├── index.ts                    # Original R2 Explorer
│   ├── index-enhanced.ts           # Enhanced multi-module version
│   ├── modules/
│   │   ├── email-handler.ts        # Email attachment processor
│   │   ├── webhook-receiver.ts     # Webhook logger
│   │   ├── image-optimizer.ts      # Image optimization
│   │   ├── admin-dashboard.ts      # Analytics dashboard
│   │   └── discord-bot.ts          # Discord integration
│   └── hud/
│       ├── system-monitor.html     # System HUD (green terminal style)
│       └── discord-hud.html        # Discord HUD (purple Discord style)
├── wrangler.json                   # Cloudflare configuration
├── package.json
├── CLAUDE.MD                       # AI assistant guide
└── SETUP.md                        # This file!
```

## 🎯 Next Steps

1. **Deploy to production:**
```bash
npm run deploy
```

2. **Set up Discord bot:**
   - Create app at https://discord.com/developers
   - Add bot to your server
   - Configure interaction endpoint

3. **Set up email routing:**
   - Go to Cloudflare Dashboard → Email Routing
   - Add catch-all or specific addresses
   - Route to your worker

4. **Monitor everything:**
   - Open System HUD on a tablet/touchscreen
   - Keep Discord HUD open for bot monitoring
   - Check admin dashboard for analytics

## 🐛 Troubleshooting

**HUD pages not loading?**
- Make sure you're using `index-enhanced.ts` as main
- Check browser console for errors

**Discord bot not responding?**
- Verify interaction endpoint in Discord portal
- Check public key matches
- Test with `/ping` command

**Webhooks not logging?**
- Check webhook URL is correct
- Verify POST requests are hitting `/webhook`
- View logs at `/webhook/logs`

**Email attachments not saving?**
- Confirm email routing is configured
- Check worker logs: `npx wrangler tail`

## 💡 Tips

- Use System HUD on a **Raspberry Pi with touchscreen**
- Set up Discord HUD on a **secondary monitor**
- Connect webhooks from GitHub for deployment notifications
- Use email routing for automatic file backups

## 🎉 You're All Set!

You now have a complete, modular platform with:
- ✅ File management (R2 Explorer)
- ✅ Email integration
- ✅ Webhook receiver
- ✅ Image optimization
- ✅ Analytics dashboard
- ✅ System monitoring HUD
- ✅ Discord bot + HUD

**Go build something awesome! 🚀**
