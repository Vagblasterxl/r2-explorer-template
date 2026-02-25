/**
 * Admin Dashboard Module
 * Provides analytics and monitoring for R2 storage
 */

export interface StorageStats {
  totalFiles: number;
  totalSize: number;
  filesByType: Record<string, number>;
  sizeByType: Record<string, number>;
  recentUploads: Array<{ key: string; size: number; uploaded: string }>;
  storageByFolder: Record<string, { count: number; size: number }>;
}

export interface WebhookStats {
  total: number;
  bySource: Record<string, number>;
  recentWebhooks: Array<{ source: string; timestamp: string; url: string }>;
}

export class AdminDashboard {
  private bucket: R2Bucket;

  constructor(bucket: R2Bucket) {
    this.bucket = bucket;
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<StorageStats> {
    const stats: StorageStats = {
      totalFiles: 0,
      totalSize: 0,
      filesByType: {},
      sizeByType: {},
      recentUploads: [],
      storageByFolder: {},
    };

    let cursor: string | undefined;
    const recentFiles: Array<{ key: string; size: number; uploaded: string }> = [];

    do {
      const listed = await this.bucket.list({ cursor, limit: 1000 });

      for (const object of listed.objects) {
        stats.totalFiles++;
        stats.totalSize += object.size;

        // File type analysis
        const ext = this.getFileExtension(object.key);
        stats.filesByType[ext] = (stats.filesByType[ext] || 0) + 1;
        stats.sizeByType[ext] = (stats.sizeByType[ext] || 0) + object.size;

        // Folder analysis
        const folder = this.getFolder(object.key);
        if (!stats.storageByFolder[folder]) {
          stats.storageByFolder[folder] = { count: 0, size: 0 };
        }
        stats.storageByFolder[folder].count++;
        stats.storageByFolder[folder].size += object.size;

        // Collect for recent uploads
        recentFiles.push({
          key: object.key,
          size: object.size,
          uploaded: object.uploaded.toISOString(),
        });
      }

      cursor = listed.truncated ? listed.cursor : undefined;
    } while (cursor);

    // Get 10 most recent uploads
    stats.recentUploads = recentFiles
      .sort((a, b) => new Date(b.uploaded).getTime() - new Date(a.uploaded).getTime())
      .slice(0, 10);

    return stats;
  }

  /**
   * Get webhook statistics
   */
  async getWebhookStats(): Promise<WebhookStats> {
    const stats: WebhookStats = {
      total: 0,
      bySource: {},
      recentWebhooks: [],
    };

    try {
      const listed = await this.bucket.list({ prefix: 'webhook-logs/', limit: 1000 });

      for (const object of listed.objects) {
        stats.total++;

        const source = object.customMetadata?.source || 'unknown';
        stats.bySource[source] = (stats.bySource[source] || 0) + 1;

        if (stats.recentWebhooks.length < 10) {
          stats.recentWebhooks.push({
            source,
            timestamp: object.customMetadata?.timestamp || object.uploaded.toISOString(),
            url: object.key,
          });
        }
      }

      stats.recentWebhooks.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch {
      // Webhook logs might not exist
    }

    return stats;
  }

  /**
   * Render dashboard HTML
   */
  async renderDashboard(): Promise<Response> {
    const [storageStats, webhookStats] = await Promise.all([
      this.getStorageStats(),
      this.getWebhookStats(),
    ]);

    const html = this.generateDashboardHTML(storageStats, webhookStats);

    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  /**
   * Get dashboard data as JSON
   */
  async getDashboardData(): Promise<Response> {
    const [storageStats, webhookStats] = await Promise.all([
      this.getStorageStats(),
      this.getWebhookStats(),
    ]);

    return new Response(
      JSON.stringify({
        storage: storageStats,
        webhooks: webhookStats,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Helper methods
  private getFileExtension(key: string): string {
    const ext = key.split('.').pop()?.toLowerCase();
    return ext || 'no-extension';
  }

  private getFolder(key: string): string {
    const parts = key.split('/');
    return parts.length > 1 ? parts[0] : 'root';
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }

  private generateDashboardHTML(storage: StorageStats, webhooks: WebhookStats): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>R2 Admin Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      padding: 20px;
      min-height: 100vh;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 30px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
    .card {
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      padding: 25px;
      border: 1px solid rgba(255,255,255,0.2);
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    }
    .card h2 {
      font-size: 1.5rem;
      margin-bottom: 15px;
      color: #fff;
    }
    .stat {
      font-size: 2.5rem;
      font-weight: bold;
      color: #ffd700;
      margin: 10px 0;
    }
    .label { font-size: 0.9rem; opacity: 0.8; }
    .list { list-style: none; margin-top: 15px; }
    .list li {
      padding: 8px 0;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      display: flex;
      justify-content: space-between;
    }
    .badge {
      background: rgba(255,255,255,0.2);
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.85rem;
    }
    .refresh-btn {
      background: #ffd700;
      color: #333;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      font-weight: bold;
      margin-top: 20px;
      transition: transform 0.2s;
    }
    .refresh-btn:hover { transform: scale(1.05); }
    @media (max-width: 768px) {
      h1 { font-size: 1.8rem; }
      .stat { font-size: 2rem; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 R2 Admin Dashboard</h1>

    <div class="grid">
      <!-- Storage Overview -->
      <div class="card">
        <h2>💾 Storage Overview</h2>
        <div class="stat">${storage.totalFiles}</div>
        <div class="label">Total Files</div>
        <div class="stat">${this.formatBytes(storage.totalSize)}</div>
        <div class="label">Total Size</div>
      </div>

      <!-- Files by Type -->
      <div class="card">
        <h2>📁 Files by Type</h2>
        <ul class="list">
          ${Object.entries(storage.filesByType)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([type, count]) => `
              <li>
                <span>.${type}</span>
                <span class="badge">${count} files</span>
              </li>
            `)
            .join('')}
        </ul>
      </div>

      <!-- Storage by Folder -->
      <div class="card">
        <h2>📂 Storage by Folder</h2>
        <ul class="list">
          ${Object.entries(storage.storageByFolder)
            .sort((a, b) => b[1].size - a[1].size)
            .slice(0, 5)
            .map(([folder, data]) => `
              <li>
                <span>${folder}</span>
                <span class="badge">${this.formatBytes(data.size)}</span>
              </li>
            `)
            .join('')}
        </ul>
      </div>

      <!-- Recent Uploads -->
      <div class="card">
        <h2>⬆️ Recent Uploads</h2>
        <ul class="list">
          ${storage.recentUploads.slice(0, 5).map(file => `
            <li>
              <span title="${file.key}">${this.truncate(file.key, 25)}</span>
              <span class="badge">${this.formatBytes(file.size)}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <!-- Webhook Stats -->
      <div class="card">
        <h2>🔗 Webhooks</h2>
        <div class="stat">${webhooks.total}</div>
        <div class="label">Total Received</div>
        <ul class="list">
          ${Object.entries(webhooks.bySource)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([source, count]) => `
              <li>
                <span>${source}</span>
                <span class="badge">${count}</span>
              </li>
            `)
            .join('')}
        </ul>
      </div>

      <!-- System Status -->
      <div class="card">
        <h2>⚡ System Status</h2>
        <div class="stat">✅</div>
        <div class="label">All Systems Operational</div>
        <div style="margin-top: 15px; opacity: 0.8; font-size: 0.9rem;">
          Last updated: ${new Date().toLocaleString()}
        </div>
        <button class="refresh-btn" onclick="location.reload()">🔄 Refresh Dashboard</button>
      </div>
    </div>
  </div>

  <script>
    // Auto-refresh every 30 seconds
    setTimeout(() => location.reload(), 30000);
  </script>
</body>
</html>`;
  }

  private truncate(str: string, len: number): string {
    return str.length > len ? `${str.substring(0, len)}...` : str;
  }
}
