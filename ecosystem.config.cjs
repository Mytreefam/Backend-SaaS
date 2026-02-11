/**
 * PM2 ecosystem for UDAR Edge Delivery 360
 *
 * Backend runs on PORT=4000 (nginx proxies /sass/api -> 127.0.0.1:4000).
 */
module.exports = {
  apps: [
    {
      name: 'udar-edge-backend',
      cwd: './server',
      script: './dist/src/server.js',
      // Alternative if you prefer: script: 'npm', args: 'start'
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      restart_delay: 2000,
      time: true,
      merge_logs: true,
      // Load env vars from server/.env
      env_file: './server/.env',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};

