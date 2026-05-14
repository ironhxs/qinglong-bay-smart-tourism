import express from 'express';
import cors from 'cors';
import http from 'http';
import https from 'https';
import fs from 'fs';
import WebSocket from 'ws';
import { handleWebSocket } from './routes/virtualHuman';
import { createApp } from './app';

const PORT = process.env.PORT || 5001; // 修改为5001避免与已有服务冲突

// 检测是否启用 HTTPS
const HTTPS_KEY = process.env.HTTPS_KEY;
const HTTPS_CERT = process.env.HTTPS_CERT;

// 创建应用
const app = createApp();

// 创建 HTTP 或 HTTPS 服务器
let server: http.Server | https.Server;

if (HTTPS_KEY && HTTPS_CERT && fs.existsSync(HTTPS_KEY) && fs.existsSync(HTTPS_CERT)) {
  const options = {
    key: fs.readFileSync(HTTPS_KEY),
    cert: fs.readFileSync(HTTPS_CERT)
  };
  server = https.createServer(options, app);
  console.log('[Server] HTTPS 模式已启用');
} else {
  server = http.createServer(app);
  console.log('[Server] 以 HTTP 模式运行');
}

// 创建WebSocket服务器
const wss = new WebSocket.Server({ server, path: '/ws' });

// 处理WebSocket连接
wss.on('connection', (ws, req) => {
  console.log('[WebSocket] 收到新连接:', req.url);

  // 解析URL中的会话ID
  const url = new URL(`http://localhost${req.url}`);
  const sessionId = url.searchParams.get('sessionId');

  if (!sessionId) {
    console.error('[WebSocket] 无效的会话ID');
    ws.close(1008, '无效会话ID');
    return;
  }

  console.log(`[WebSocket] 新连接，会话ID: ${sessionId}`);
  handleWebSocket(ws, sessionId);
});

// 启动服务器
server.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`API端点可访问: http://localhost:${PORT}/api`);
  console.log(`WebSocket服务: ws://localhost:${PORT}/ws`);
}); 