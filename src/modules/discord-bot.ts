/**
 * Discord Bot Integration Module
 * Handles Discord interactions and connects to R2 storage
 */

export interface DiscordConfig {
  bucket: R2Bucket;
  applicationId: string;
  publicKey: string;
  botToken?: string;
}

export interface DiscordInteraction {
  type: number;
  data?: any;
  guild_id?: string;
  channel_id?: string;
  member?: any;
  user?: any;
  token: string;
  id: string;
}

export class DiscordBot {
  private bucket: R2Bucket;
  private applicationId: string;
  private publicKey: string;
  private botToken?: string;

  constructor(config: DiscordConfig) {
    this.bucket = config.bucket;
    this.applicationId = config.applicationId;
    this.publicKey = config.publicKey;
    this.botToken = config.botToken;
  }

  /**
   * Verify Discord signature
   */
  async verifySignature(request: Request): Promise<boolean> {
    const signature = request.headers.get('X-Signature-Ed25519');
    const timestamp = request.headers.get('X-Signature-Timestamp');

    if (!signature || !timestamp) {
      return false;
    }

    const body = await request.clone().text();

    // In production, use crypto.subtle to verify Ed25519 signature
    // For now, this is a placeholder
    return true;
  }

  /**
   * Handle Discord interaction
   */
  async handleInteraction(request: Request): Promise<Response> {
    // Verify signature
    const isValid = await this.verifySignature(request);
    if (!isValid) {
      return new Response('Invalid signature', { status: 401 });
    }

    const interaction: DiscordInteraction = await request.json();

    // Handle PING
    if (interaction.type === 1) {
      return new Response(JSON.stringify({ type: 1 }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Handle application commands
    if (interaction.type === 2) {
      return await this.handleCommand(interaction);
    }

    return new Response('Unknown interaction type', { status: 400 });
  }

  /**
   * Handle slash commands
   */
  private async handleCommand(interaction: DiscordInteraction): Promise<Response> {
    const commandName = interaction.data?.name;

    switch (commandName) {
      case 'stats':
        return await this.handleStatsCommand(interaction);

      case 'upload':
        return await this.handleUploadCommand(interaction);

      case 'list':
        return await this.handleListCommand(interaction);

      case 'delete':
        return await this.handleDeleteCommand(interaction);

      case 'ping':
        return this.createResponse('Pong! 🏓 Bot is online!');

      default:
        return this.createResponse(`Unknown command: ${commandName}`);
    }
  }

  /**
   * Handle /stats command
   */
  private async handleStatsCommand(interaction: DiscordInteraction): Promise<Response> {
    try {
      let totalFiles = 0;
      let totalSize = 0;
      let cursor: string | undefined;

      do {
        const listed = await this.bucket.list({ cursor, limit: 1000 });
        totalFiles += listed.objects.length;
        for (const obj of listed.objects) {
          totalSize += obj.size;
        }
        cursor = listed.truncated ? listed.cursor : undefined;
      } while (cursor);

      const sizeInGB = (totalSize / 1e9).toFixed(2);

      const embed = {
        title: '📊 R2 Storage Stats',
        color: 0x5865F2,
        fields: [
          { name: 'Total Files', value: totalFiles.toLocaleString(), inline: true },
          { name: 'Total Size', value: `${sizeInGB} GB`, inline: true },
          { name: 'Status', value: '✅ Online', inline: true },
        ],
        timestamp: new Date().toISOString(),
      };

      return this.createResponse('', [embed]);
    } catch (error) {
      return this.createResponse(`❌ Error: ${error}`);
    }
  }

  /**
   * Handle /list command
   */
  private async handleListCommand(interaction: DiscordInteraction): Promise<Response> {
    try {
      const prefix = interaction.data?.options?.find((o: any) => o.name === 'folder')?.value || '';
      const listed = await this.bucket.list({ prefix, limit: 10 });

      if (listed.objects.length === 0) {
        return this.createResponse('📂 No files found!');
      }

      const fileList = listed.objects
        .map((obj, i) => `${i + 1}. \`${obj.key}\` (${this.formatBytes(obj.size)})`)
        .join('\n');

      const embed = {
        title: '📂 Files in R2',
        description: fileList,
        color: 0x3BA55C,
        footer: {
          text: listed.truncated ? 'Showing first 10 files...' : `Total: ${listed.objects.length} files`,
        },
      };

      return this.createResponse('', [embed]);
    } catch (error) {
      return this.createResponse(`❌ Error: ${error}`);
    }
  }

  /**
   * Handle /upload command (deferred - requires attachment handling)
   */
  private async handleUploadCommand(interaction: DiscordInteraction): Promise<Response> {
    // Note: Discord file uploads require additional handling via bot token
    return this.createResponse(
      '📤 To upload files, use the web dashboard or drag & drop directly into the Discord channel!'
    );
  }

  /**
   * Handle /delete command
   */
  private async handleDeleteCommand(interaction: DiscordInteraction): Promise<Response> {
    const filename = interaction.data?.options?.find((o: any) => o.name === 'filename')?.value;

    if (!filename) {
      return this.createResponse('❌ Please provide a filename to delete!');
    }

    try {
      await this.bucket.delete(filename);
      return this.createResponse(`✅ Deleted: \`${filename}\``);
    } catch (error) {
      return this.createResponse(`❌ Error deleting file: ${error}`);
    }
  }

  /**
   * Create Discord response
   */
  private createResponse(content: string, embeds?: any[]): Response {
    const data: any = { type: 4, data: {} };

    if (content) {
      data.data.content = content;
    }

    if (embeds) {
      data.data.embeds = embeds;
    }

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * Log interaction to R2
   */
  async logInteraction(interaction: DiscordInteraction): Promise<void> {
    const date = new Date().toISOString().split('T')[0];
    const key = `discord-logs/${date}/${Date.now()}.json`;

    await this.bucket.put(key, JSON.stringify(interaction, null, 2), {
      httpMetadata: {
        contentType: 'application/json',
      },
      customMetadata: {
        type: 'discord-interaction',
        command: interaction.data?.name || 'unknown',
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Helper: Format bytes
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }

  /**
   * Register slash commands with Discord
   * Call this once to register your commands
   */
  async registerCommands(): Promise<Response> {
    if (!this.botToken) {
      return new Response('Bot token not configured', { status: 400 });
    }

    const commands = [
      {
        name: 'stats',
        description: 'Get R2 storage statistics',
      },
      {
        name: 'list',
        description: 'List files in R2',
        options: [
          {
            name: 'folder',
            description: 'Folder path to list',
            type: 3,
            required: false,
          },
        ],
      },
      {
        name: 'upload',
        description: 'Upload a file to R2',
      },
      {
        name: 'delete',
        description: 'Delete a file from R2',
        options: [
          {
            name: 'filename',
            description: 'File to delete',
            type: 3,
            required: true,
          },
        ],
      },
      {
        name: 'ping',
        description: 'Check if bot is online',
      },
    ];

    const response = await fetch(
      `https://discord.com/api/v10/applications/${this.applicationId}/commands`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bot ${this.botToken}`,
        },
        body: JSON.stringify(commands),
      }
    );

    if (!response.ok) {
      return new Response(`Failed to register commands: ${await response.text()}`, {
        status: response.status,
      });
    }

    return new Response('Commands registered successfully!', { status: 200 });
  }
}

/**
 * Example slash commands to register with Discord:
 *
 * /stats - Get R2 storage statistics
 * /list [folder] - List files in R2
 * /upload - Upload file to R2
 * /delete <filename> - Delete file from R2
 * /ping - Check bot status
 */
