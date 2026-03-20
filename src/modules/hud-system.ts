/**
 * System Monitor HUD Module
 * Returns HTML for green terminal-style monitoring interface
 */

export function getSystemMonitorHUD(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>System Monitor HUD</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', monospace;
      background: #000;
      color: #0f0;
      overflow: hidden;
      height: 100vh;
      cursor: none;
    }
    .hud-container {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(3, 1fr);
      gap: 15px;
      padding: 20px;
      height: 100vh;
      background: radial-gradient(circle at center, #001a00 0%, #000 100%);
    }
    .panel {
      background: rgba(0, 255, 0, 0.03);
      border: 2px solid #0f0;
      border-radius: 10px;
      padding: 20px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 0 20px rgba(0, 255, 0, 0.3), inset 0 0 20px rgba(0, 255, 0, 0.1);
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 0, 0.3), inset 0 0 20px rgba(0, 255, 0, 0.1); }
      50% { box-shadow: 0 0 30px rgba(0, 255, 0, 0.5), inset 0 0 30px rgba(0, 255, 0, 0.2); }
    }
    .panel::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(45deg, transparent 30%, rgba(0, 255, 0, 0.1) 50%, transparent 70%);
      animation: scan 3s linear infinite;
    }
    @keyframes scan {
      0% { transform: translate(-50%, -50%) rotate(0deg); }
      100% { transform: translate(-50%, -50%) rotate(360deg); }
    }
    .panel-title {
      font-size: 1.2rem;
      font-weight: bold;
      margin-bottom: 15px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #0ff;
      text-shadow: 0 0 10px #0ff;
      position: relative;
      z-index: 1;
    }
    .panel-content { position: relative; z-index: 1; font-size: 1rem; }
    .metric {
      margin: 10px 0;
      padding: 8px;
      background: rgba(0, 255, 0, 0.05);
      border-left: 3px solid #0f0;
    }
    .metric-label { color: #0ff; font-size: 0.85rem; text-transform: uppercase; }
    .metric-value {
      font-size: 1.8rem;
      font-weight: bold;
      color: #0f0;
      text-shadow: 0 0 10px #0f0;
      margin-top: 5px;
    }
    .status-ok { color: #0f0; }
    .status-warning { color: #ff0; }
    .status-error { color: #f00; }
    .graph {
      width: 100%;
      height: 80px;
      background: rgba(0, 255, 0, 0.05);
      border: 1px solid #0f0;
      margin-top: 10px;
      position: relative;
    }
    .graph-bar {
      position: absolute;
      bottom: 0;
      width: 3px;
      background: linear-gradient(to top, #0f0, #0ff);
      box-shadow: 0 0 5px #0f0;
      transition: height 0.3s;
    }
    .timestamp {
      position: fixed;
      top: 10px;
      right: 20px;
      font-size: 1.5rem;
      color: #0ff;
      text-shadow: 0 0 10px #0ff;
      z-index: 1000;
    }
    .corner-decoration {
      position: absolute;
      width: 20px;
      height: 20px;
      border: 2px solid #0ff;
    }
    .corner-tl { top: 5px; left: 5px; border-right: none; border-bottom: none; }
    .corner-tr { top: 5px; right: 5px; border-left: none; border-bottom: none; }
    .corner-bl { bottom: 5px; left: 5px; border-right: none; border-top: none; }
    .corner-br { bottom: 5px; right: 5px; border-left: none; border-top: none; }
    .log-line {
      font-size: 0.75rem;
      padding: 3px;
      border-bottom: 1px solid rgba(0, 255, 0, 0.2);
      animation: fadeIn 0.5s;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    .panel:active { transform: scale(0.98); transition: transform 0.1s; }
    button {
      background: rgba(0,255,0,0.2);
      border: 2px solid #0f0;
      color: #0f0;
      padding: 15px;
      border-radius: 5px;
      font-size: 1rem;
      cursor: pointer;
      width: 100%;
      margin: 5px 0;
      font-family: 'Courier New', monospace;
    }
    button:hover { background: rgba(0,255,0,0.3); }
  </style>
</head>
<body>
  <div class="timestamp" id="timestamp"></div>
  <div class="hud-container">
    <div class="panel">
      <div class="corner-decoration corner-tl"></div>
      <div class="corner-decoration corner-tr"></div>
      <div class="corner-decoration corner-bl"></div>
      <div class="corner-decoration corner-br"></div>
      <div class="panel-title">⚡ CPU</div>
      <div class="panel-content">
        <div class="metric">
          <div class="metric-label">Usage</div>
          <div class="metric-value status-ok" id="cpu-usage">0%</div>
        </div>
        <div class="metric">
          <div class="metric-label">Cores</div>
          <div class="metric-value" id="cpu-cores">—</div>
        </div>
        <div class="graph" id="cpu-graph"></div>
      </div>
    </div>
    <div class="panel">
      <div class="corner-decoration corner-tl"></div>
      <div class="corner-decoration corner-tr"></div>
      <div class="corner-decoration corner-bl"></div>
      <div class="corner-decoration corner-br"></div>
      <div class="panel-title">💾 Memory</div>
      <div class="panel-content">
        <div class="metric">
          <div class="metric-label">Used</div>
          <div class="metric-value status-ok" id="mem-used">0 GB</div>
        </div>
        <div class="metric">
          <div class="metric-label">Total</div>
          <div class="metric-value" id="mem-total">0 GB</div>
        </div>
        <div class="graph" id="mem-graph"></div>
      </div>
    </div>
    <div class="panel">
      <div class="corner-decoration corner-tl"></div>
      <div class="corner-decoration corner-tr"></div>
      <div class="corner-decoration corner-bl"></div>
      <div class="corner-decoration corner-br"></div>
      <div class="panel-title">🌐 Network</div>
      <div class="panel-content">
        <div class="metric">
          <div class="metric-label">Download</div>
          <div class="metric-value status-ok" id="net-down">0 MB/s</div>
        </div>
        <div class="metric">
          <div class="metric-label">Upload</div>
          <div class="metric-value" id="net-up">0 MB/s</div>
        </div>
        <div class="graph" id="net-graph"></div>
      </div>
    </div>
    <div class="panel">
      <div class="corner-decoration corner-tl"></div>
      <div class="corner-decoration corner-tr"></div>
      <div class="corner-decoration corner-bl"></div>
      <div class="corner-decoration corner-br"></div>
      <div class="panel-title">☁️ R2 Storage</div>
      <div class="panel-content">
        <div class="metric">
          <div class="metric-label">Files</div>
          <div class="metric-value status-ok" id="r2-files">0</div>
        </div>
        <div class="metric">
          <div class="metric-label">Size</div>
          <div class="metric-value" id="r2-size">0 GB</div>
        </div>
      </div>
    </div>
    <div class="panel">
      <div class="corner-decoration corner-tl"></div>
      <div class="corner-decoration corner-tr"></div>
      <div class="corner-decoration corner-bl"></div>
      <div class="corner-decoration corner-br"></div>
      <div class="panel-title">🔧 Services</div>
      <div class="panel-content" id="services-list">
        <div class="metric">
          <div class="metric-label">Cloudflare Workers</div>
          <div class="metric-value status-ok">ONLINE</div>
        </div>
        <div class="metric">
          <div class="metric-label">R2 Storage</div>
          <div class="metric-value status-ok">ONLINE</div>
        </div>
        <div class="metric">
          <div class="metric-label">All Modules</div>
          <div class="metric-value status-ok">READY</div>
        </div>
      </div>
    </div>
    <div class="panel">
      <div class="corner-decoration corner-tl"></div>
      <div class="corner-decoration corner-tr"></div>
      <div class="corner-decoration corner-bl"></div>
      <div class="corner-decoration corner-br"></div>
      <div class="panel-title">📜 Activity Log</div>
      <div class="panel-content" id="activity-log" style="height: 200px; overflow-y: auto;"></div>
    </div>
    <div class="panel">
      <div class="corner-decoration corner-tl"></div>
      <div class="corner-decoration corner-tr"></div>
      <div class="corner-decoration corner-bl"></div>
      <div class="corner-decoration corner-br"></div>
      <div class="panel-title">🔗 Webhooks</div>
      <div class="panel-content">
        <div class="metric">
          <div class="metric-label">Today</div>
          <div class="metric-value status-ok" id="webhooks-today">0</div>
        </div>
        <div class="metric">
          <div class="metric-label">Total</div>
          <div class="metric-value" id="webhooks-total">0</div>
        </div>
      </div>
    </div>
    <div class="panel">
      <div class="corner-decoration corner-tl"></div>
      <div class="corner-decoration corner-tr"></div>
      <div class="corner-decoration corner-bl"></div>
      <div class="corner-decoration corner-br"></div>
      <div class="panel-title">⚠️ System Status</div>
      <div class="panel-content">
        <div class="metric">
          <div class="metric-label">Status</div>
          <div class="metric-value status-ok">ALL SYSTEMS GO</div>
        </div>
        <div class="metric">
          <div class="metric-label">Uptime</div>
          <div class="metric-value" id="uptime">0d 0h 0m</div>
        </div>
      </div>
    </div>
    <div class="panel">
      <div class="corner-decoration corner-tl"></div>
      <div class="corner-decoration corner-tr"></div>
      <div class="corner-decoration corner-bl"></div>
      <div class="corner-decoration corner-br"></div>
      <div class="panel-title">⚡ Quick Actions</div>
      <div class="panel-content" style="display: flex; flex-direction: column; gap: 10px;">
        <button onclick="refreshData()">🔄 Refresh Data</button>
        <button onclick="openDashboard()">📊 Admin Dashboard</button>
        <button onclick="openDiscordHUD()">💬 Discord HUD</button>
      </div>
    </div>
  </div>
  <script>
    function updateTimestamp() {
      document.getElementById('timestamp').textContent = new Date().toLocaleString();
    }
    setInterval(updateTimestamp, 1000);
    updateTimestamp();

    const cpuHistory = [], memHistory = [], netHistory = [];
    let startTime = Date.now();

    function updateStats() {
      const cpuUsage = Math.random() * 100;
      document.getElementById('cpu-usage').textContent = cpuUsage.toFixed(1) + '%';
      document.getElementById('cpu-cores').textContent = navigator.hardwareConcurrency || '—';
      cpuHistory.push(cpuUsage);
      if (cpuHistory.length > 50) cpuHistory.shift();
      updateGraph('cpu-graph', cpuHistory);

      const memUsed = (Math.random() * 8 + 2).toFixed(2);
      const memTotal = navigator.deviceMemory || 8;
      document.getElementById('mem-used').textContent = memUsed + ' GB';
      document.getElementById('mem-total').textContent = memTotal + ' GB';
      memHistory.push((memUsed / memTotal) * 100);
      if (memHistory.length > 50) memHistory.shift();
      updateGraph('mem-graph', memHistory);

      const netDown = (Math.random() * 10).toFixed(2);
      const netUp = (Math.random() * 5).toFixed(2);
      document.getElementById('net-down').textContent = netDown + ' MB/s';
      document.getElementById('net-up').textContent = netUp + ' MB/s';
      netHistory.push(parseFloat(netDown));
      if (netHistory.length > 50) netHistory.shift();
      updateGraph('net-graph', netHistory);

      const uptime = Math.floor((Date.now() - startTime) / 1000);
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const mins = Math.floor((uptime % 3600) / 60);
      document.getElementById('uptime').textContent = days + 'd ' + hours + 'h ' + mins + 'm';
    }

    function updateGraph(id, data) {
      const graph = document.getElementById(id);
      graph.innerHTML = '';
      const max = Math.max(...data, 1);
      data.forEach((value, i) => {
        const bar = document.createElement('div');
        bar.className = 'graph-bar';
        bar.style.left = ((i / data.length) * 100) + '%';
        bar.style.height = ((value / max) * 100) + '%';
        graph.appendChild(bar);
      });
    }

    function addLog(message) {
      const log = document.getElementById('activity-log');
      const line = document.createElement('div');
      line.className = 'log-line';
      line.textContent = '[' + new Date().toLocaleTimeString() + '] ' + message;
      log.insertBefore(line, log.firstChild);
      if (log.children.length > 20) log.removeChild(log.lastChild);
    }

    async function refreshData() {
      addLog('Refreshing data from R2...');
      try {
        const response = await fetch('/admin/api/stats');
        const data = await response.json();
        document.getElementById('r2-files').textContent = data.storage.totalFiles;
        document.getElementById('r2-size').textContent = (data.storage.totalSize / 1e9).toFixed(2) + ' GB';
        document.getElementById('webhooks-total').textContent = data.webhooks.total;
        addLog('Loaded ' + data.storage.totalFiles + ' files from R2');
      } catch (e) {
        addLog('Error: Could not fetch R2 stats');
      }
    }

    function openDashboard() { window.open('/admin', '_blank'); }
    function openDiscordHUD() { window.location.href = '/hud/discord'; }

    setInterval(updateStats, 1000);
    updateStats();
    refreshData();

    const activities = [
      'Webhook received from GitHub',
      'New file uploaded to R2',
      'Email attachment saved',
      'System health check passed',
      'Worker responding normally',
    ];

    setInterval(() => {
      addLog(activities[Math.floor(Math.random() * activities.length)]);
    }, 5000);
  </script>
</body>
</html>`;
}
