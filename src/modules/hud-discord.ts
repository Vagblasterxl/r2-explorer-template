/**
 * Discord Control HUD Module
 * Returns HTML for Discord-themed control panel
 */

export function getDiscordHUD(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Discord Control HUD</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%);
      color: #fff;
      overflow: hidden;
      height: 100vh;
    }
    .hud-grid {
      display: grid;
      grid-template-columns: 300px 1fr 350px;
      grid-template-rows: 80px 1fr 100px;
      gap: 15px;
      padding: 15px;
      height: 100vh;
    }
    .header {
      grid-column: 1 / -1;
      background: linear-gradient(90deg, #5865F2, #7289DA);
      border-radius: 15px;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 8px 32px rgba(88, 101, 242, 0.3);
    }
    .header h1 {
      font-size: 2rem;
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .status-indicator {
      width: 15px;
      height: 15px;
      border-radius: 50%;
      background: #3BA55C;
      box-shadow: 0 0 15px #3BA55C;
      animation: pulse-status 2s infinite;
    }
    @keyframes pulse-status {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .server-list {
      grid-row: 2 / 3;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      padding: 15px;
      overflow-y: auto;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .server-item {
      background: rgba(88, 101, 242, 0.2);
      border-radius: 10px;
      padding: 15px;
      margin-bottom: 10px;
      cursor: pointer;
      transition: all 0.3s;
      border: 2px solid transparent;
    }
    .server-item:hover {
      background: rgba(88, 101, 242, 0.4);
      transform: translateX(5px);
    }
    .server-item.active {
      border-color: #5865F2;
      background: rgba(88, 101, 242, 0.5);
      box-shadow: 0 0 20px rgba(88, 101, 242, 0.5);
    }
    .server-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #5865F2, #7289DA);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      font-weight: bold;
      float: left;
      margin-right: 10px;
    }
    .main-content {
      grid-row: 2 / 3;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      padding: 20px;
      overflow-y: auto;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .channel-header {
      font-size: 1.5rem;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .message {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 10px;
      padding: 15px;
      margin-bottom: 10px;
      border-left: 3px solid #5865F2;
    }
    .message-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
    }
    .user-avatar {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: linear-gradient(135deg, #7289DA, #99AAB5);
    }
    .username {
      font-weight: bold;
      color: #7289DA;
    }
    .timestamp {
      font-size: 0.8rem;
      color: #99AAB5;
      margin-left: auto;
    }
    .message-content {
      padding-left: 40px;
      line-height: 1.5;
    }
    .stats-panel {
      grid-row: 2 / 3;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      padding: 20px;
      overflow-y: auto;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .stat-card {
      background: rgba(88, 101, 242, 0.2);
      border-radius: 10px;
      padding: 15px;
      margin-bottom: 15px;
      border-left: 4px solid #5865F2;
    }
    .stat-label {
      font-size: 0.85rem;
      color: #99AAB5;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: #fff;
      margin-top: 5px;
    }
    .stat-trend {
      font-size: 0.9rem;
      color: #3BA55C;
      margin-top: 5px;
    }
    .control-panel {
      grid-column: 1 / -1;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      padding: 20px;
      display: flex;
      gap: 15px;
      align-items: center;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .control-btn {
      flex: 1;
      padding: 20px;
      border-radius: 10px;
      border: 2px solid;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .btn-primary {
      background: #5865F2;
      border-color: #5865F2;
      color: #fff;
    }
    .btn-primary:hover {
      background: #4752C4;
      box-shadow: 0 0 20px rgba(88, 101, 242, 0.5);
    }
    .btn-success {
      background: #3BA55C;
      border-color: #3BA55C;
      color: #fff;
    }
    .btn-success:hover {
      background: #2D7D46;
      box-shadow: 0 0 20px rgba(59, 165, 92, 0.5);
    }
    .btn-danger {
      background: #ED4245;
      border-color: #ED4245;
      color: #fff;
    }
    .btn-danger:hover {
      background: #C03537;
      box-shadow: 0 0 20px rgba(237, 66, 69, 0.5);
    }
    .btn-info {
      background: transparent;
      border-color: #7289DA;
      color: #7289DA;
    }
    .btn-info:hover {
      background: rgba(114, 137, 218, 0.2);
      box-shadow: 0 0 20px rgba(114, 137, 218, 0.5);
    }
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb {
      background: #5865F2;
      border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb:hover { background: #7289DA; }
    .activity-feed {
      max-height: 200px;
      overflow-y: auto;
      margin-top: 10px;
    }
    .activity-item {
      padding: 8px;
      margin: 5px 0;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 5px;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .activity-icon { font-size: 1.2rem; }
    @media (max-width: 1200px) {
      .hud-grid {
        grid-template-columns: 1fr;
        grid-template-rows: auto auto 1fr auto auto;
      }
      .server-list, .stats-panel {
        grid-row: auto;
      }
    }
  </style>
</head>
<body>
  <div class="hud-grid">
    <div class="header">
      <h1>
        <span>💬</span>
        Discord Control HUD
        <div class="status-indicator"></div>
      </h1>
      <div style="display: flex; gap: 15px; align-items: center;">
        <span style="font-size: 0.9rem;">Bot Status: <strong style="color: #3BA55C;">ONLINE</strong></span>
        <span style="font-size: 0.9rem;">Latency: <strong>42ms</strong></span>
      </div>
    </div>
    <div class="server-list">
      <h3 style="margin-bottom: 15px; color: #7289DA;">Servers</h3>
      <div class="server-item active" onclick="selectServer(this, 'Main Server')">
        <div class="server-icon">MS</div>
        <div>
          <strong>Main Server</strong>
          <div style="font-size: 0.8rem; color: #99AAB5;">Ready</div>
        </div>
      </div>
      <div class="server-item" onclick="selectServer(this, 'Dev Server')">
        <div class="server-icon">DS</div>
        <div>
          <strong>Dev Server</strong>
          <div style="font-size: 0.8rem; color: #99AAB5;">Ready</div>
        </div>
      </div>
    </div>
    <div class="main-content">
      <div class="channel-header">
        <span>#</span>
        <span id="current-channel">general</span>
      </div>
      <div id="messages-container"></div>
    </div>
    <div class="stats-panel">
      <h3 style="margin-bottom: 15px; color: #7289DA;">Statistics</h3>
      <div class="stat-card">
        <div class="stat-label">Total Messages</div>
        <div class="stat-value" id="total-messages">0</div>
        <div class="stat-trend">↑ Ready</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Active Users</div>
        <div class="stat-value" id="active-users">0</div>
        <div class="stat-trend">↑ Online</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Commands Executed</div>
        <div class="stat-value" id="commands-executed">0</div>
        <div class="stat-trend">✅ Ready</div>
      </div>
      <h3 style="margin: 20px 0 15px 0; color: #7289DA;">Recent Activity</h3>
      <div class="activity-feed" id="activity-feed"></div>
    </div>
    <div class="control-panel">
      <button class="control-btn btn-primary" onclick="refreshStats()">📊 Refresh Stats</button>
      <button class="control-btn btn-success" onclick="runCommand()">⚡ Run Command</button>
      <button class="control-btn btn-info" onclick="viewLogs()">📋 View Logs</button>
      <button class="control-btn btn-info" onclick="backToSystem()">← System HUD</button>
    </div>
  </div>
  <script>
    const messages = [
      { user: 'System', content: 'Discord HUD initialized ✅', time: new Date().toLocaleTimeString() },
      { user: 'Bot', content: 'All systems operational', time: new Date().toLocaleTimeString() },
    ];

    function loadMessages() {
      const container = document.getElementById('messages-container');
      container.innerHTML = messages.map(msg => \`
        <div class="message">
          <div class="message-header">
            <div class="user-avatar"></div>
            <span class="username">\${msg.user}</span>
            <span class="timestamp">\${msg.time}</span>
          </div>
          <div class="message-content">\${msg.content}</div>
        </div>
      \`).join('');
    }

    const activities = [
      { icon: '📨', text: 'HUD loaded' },
      { icon: '✅', text: 'Bot health check passed' },
      { icon: '📊', text: 'Ready for commands' },
    ];

    function loadActivities() {
      const feed = document.getElementById('activity-feed');
      feed.innerHTML = activities.map(activity => \`
        <div class="activity-item">
          <span class="activity-icon">\${activity.icon}</span>
          <span>\${activity.text}</span>
        </div>
      \`).join('');
    }

    function selectServer(element, serverName) {
      document.querySelectorAll('.server-item').forEach(item => {
        item.classList.remove('active');
      });
      element.classList.add('active');
      addActivity(\`📡 Switched to \${serverName}\`);
    }

    function refreshStats() {
      addActivity('🔄 Refreshing stats...');
      fetch('/admin/api/stats')
        .then(r => r.json())
        .then(data => {
          addActivity('✅ Stats updated');
        })
        .catch(() => addActivity('❌ Stats fetch failed'));
    }

    function runCommand() {
      const command = prompt('Enter bot command:');
      if (command) {
        addActivity(\`⚡ Command executed: \${command}\`);
        alert(\`Command "\${command}" executed successfully!\`);
      }
    }

    function viewLogs() {
      window.open('/admin', '_blank');
    }

    function backToSystem() {
      window.location.href = '/hud/system';
    }

    function addActivity(text) {
      const feed = document.getElementById('activity-feed');
      const item = document.createElement('div');
      item.className = 'activity-item';
      item.innerHTML = \`
        <span class="activity-icon">🔔</span>
        <span>\${text}</span>
      \`;
      feed.insertBefore(item, feed.firstChild);
      if (feed.children.length > 10) {
        feed.removeChild(feed.lastChild);
      }
    }

    loadMessages();
    loadActivities();
  </script>
</body>
</html>`;
}
