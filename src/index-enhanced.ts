/**
 * Enhanced R2 Explorer with Multi-Module Support
 * Includes: Email handler, Webhooks, Image optimization, Admin dashboard, Discord bot
 */

import { R2Explorer } from 'r2-explorer';
import { EmailHandler } from './modules/email-handler';
import { WebhookReceiver } from './modules/webhook-receiver';
import { ImageOptimizer } from './modules/image-optimizer';
import { AdminDashboard } from './modules/admin-dashboard';
import { DiscordBot } from './modules/discord-bot';

interface Env {
  bucket: R2Bucket;
  ASSETS: any;

  // Optional Discord configuration
  DISCORD_APPLICATION_ID?: string;
  DISCORD_PUBLIC_KEY?: string;
  DISCORD_BOT_TOKEN?: string;
}

// Main worker export
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Serve HUD interfaces
    if (path === '/hud/system') {
      return await fetch(new URL('/src/hud/system-monitor.html', import.meta.url).href);
    }

    if (path === '/hud/discord') {
      return await fetch(new URL('/src/hud/discord-hud.html', import.meta.url).href);
    }

    // Admin Dashboard routes
    if (path.startsWith('/admin')) {
      const dashboard = new AdminDashboard(env.bucket);

      if (path === '/admin/api/stats') {
        return await dashboard.getDashboardData();
      }

      if (path === '/admin') {
        return await dashboard.renderDashboard();
      }
    }

    // Webhook receiver route
    if (path.startsWith('/webhook')) {
      const webhookReceiver = new WebhookReceiver({
        bucket: env.bucket,
        enableLogging: true,
      });

      if (request.method === 'GET' && path === '/webhook/logs') {
        const date = url.searchParams.get('date') || undefined;
        const logs = await webhookReceiver.getLogs(date);
        return new Response(JSON.stringify(logs), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return await webhookReceiver.handleWebhook(request);
    }

    // Discord bot routes
    if (path.startsWith('/discord')) {
      if (!env.DISCORD_APPLICATION_ID || !env.DISCORD_PUBLIC_KEY) {
        return new Response('Discord not configured', { status: 400 });
      }

      const discordBot = new DiscordBot({
        bucket: env.bucket,
        applicationId: env.DISCORD_APPLICATION_ID,
        publicKey: env.DISCORD_PUBLIC_KEY,
        botToken: env.DISCORD_BOT_TOKEN,
      });

      // Register commands endpoint
      if (path === '/discord/register' && request.method === 'POST') {
        return await discordBot.registerCommands();
      }

      // Handle Discord interactions
      if (path === '/discord/interactions') {
        return await discordBot.handleInteraction(request);
      }
    }

    // Image optimization route (serves optimized images)
    if (path.startsWith('/images/') && request.method === 'GET') {
      const optimizer = new ImageOptimizer({ bucket: env.bucket });
      const imageKey = path.replace('/images/', '');
      return await optimizer.serveOptimized(request, imageKey);
    }

    // Health check
    if (path === '/health') {
      return new Response(
        JSON.stringify({
          status: 'ok',
          timestamp: new Date().toISOString(),
          modules: {
            r2Explorer: true,
            emailHandler: true,
            webhookReceiver: true,
            imageOptimizer: true,
            adminDashboard: true,
            discordBot: !!env.DISCORD_APPLICATION_ID,
          },
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Default: Use R2 Explorer for file management
    const r2Explorer = R2Explorer({
      // Set to false to allow file uploads
      readonly: true,

      // Uncomment to enable Cloudflare Access authentication
      // cfAccessTeamName: "my-team-name",
    });

    return await r2Explorer.fetch(request, env, ctx);
  },

  /**
   * Email handler for Cloudflare Email Routing
   * Configure in your Cloudflare dashboard to route emails to this worker
   */
  async email(message: any, env: Env, ctx: ExecutionContext): Promise<void> {
    const emailHandler = new EmailHandler(env.bucket);

    try {
      const response = await emailHandler.handleEmail(message);
      console.log('Email processed:', await response.text());
    } catch (error) {
      console.error('Email processing error:', error);
    }
  },
};
