/**
 * Webhook Receiver Module
 * Receives webhooks, logs to R2, triggers actions
 */

export interface WebhookConfig {
  bucket: R2Bucket;
  logFolder?: string;
  enableLogging?: boolean;
  verifySignature?: (request: Request) => Promise<boolean>;
}

export interface WebhookLog {
  timestamp: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body: any;
  source?: string;
}

export class WebhookReceiver {
  private bucket: R2Bucket;
  private logFolder: string;
  private enableLogging: boolean;
  private verifySignature?: (request: Request) => Promise<boolean>;

  constructor(config: WebhookConfig) {
    this.bucket = config.bucket;
    this.logFolder = config.logFolder || 'webhook-logs';
    this.enableLogging = config.enableLogging ?? true;
    this.verifySignature = config.verifySignature;
  }

  /**
   * Handle incoming webhook
   */
  async handleWebhook(request: Request): Promise<Response> {
    // Verify signature if configured
    if (this.verifySignature) {
      const isValid = await this.verifySignature(request);
      if (!isValid) {
        return new Response('Invalid signature', { status: 403 });
      }
    }

    // Parse webhook data
    const webhookData = await this.parseWebhook(request);

    // Log to R2 if enabled
    if (this.enableLogging) {
      await this.logWebhook(webhookData);
    }

    // Process webhook (extend this for custom logic)
    const result = await this.processWebhook(webhookData);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * Parse incoming webhook request
   */
  private async parseWebhook(request: Request): Promise<WebhookLog> {
    const url = new URL(request.url);
    const headers: Record<string, string> = {};

    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    let body: any;
    const contentType = request.headers.get('content-type') || '';

    try {
      if (contentType.includes('application/json')) {
        body = await request.json();
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData();
        body = Object.fromEntries(formData.entries());
      } else {
        body = await request.text();
      }
    } catch {
      body = null;
    }

    return {
      timestamp: new Date().toISOString(),
      method: request.method,
      url: url.toString(),
      headers,
      body,
      source: this.detectSource(headers),
    };
  }

  /**
   * Log webhook to R2
   */
  private async logWebhook(webhookData: WebhookLog): Promise<void> {
    const date = webhookData.timestamp.split('T')[0];
    const key = `${this.logFolder}/${date}/${Date.now()}.json`;

    await this.bucket.put(key, JSON.stringify(webhookData, null, 2), {
      httpMetadata: {
        contentType: 'application/json',
      },
      customMetadata: {
        source: webhookData.source || 'unknown',
        method: webhookData.method,
        timestamp: webhookData.timestamp,
      },
    });
  }

  /**
   * Process webhook (override this for custom logic)
   */
  protected async processWebhook(webhookData: WebhookLog): Promise<any> {
    // Default: just acknowledge receipt
    return {
      success: true,
      message: 'Webhook received',
      timestamp: webhookData.timestamp,
      source: webhookData.source,
    };
  }

  /**
   * Detect webhook source from headers
   */
  private detectSource(headers: Record<string, string>): string {
    if (headers['x-github-event']) return 'github';
    if (headers['x-gitlab-event']) return 'gitlab';
    if (headers['x-stripe-signature']) return 'stripe';
    if (headers['x-slack-signature']) return 'slack';
    if (headers['x-discord-signature']) return 'discord';
    if (headers['user-agent']?.includes('Stripe')) return 'stripe';
    return 'unknown';
  }

  /**
   * Get webhook logs from R2
   */
  async getLogs(date?: string): Promise<WebhookLog[]> {
    const prefix = date
      ? `${this.logFolder}/${date}/`
      : `${this.logFolder}/`;

    const listed = await this.bucket.list({ prefix, limit: 100 });
    const logs: WebhookLog[] = [];

    for (const object of listed.objects) {
      const obj = await this.bucket.get(object.key);
      if (obj) {
        const content = await obj.text();
        logs.push(JSON.parse(content));
      }
    }

    return logs.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
}
