import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as WebSocketServer } from 'ws';
import attractionsRouter from './routes/attractions';
import aiRouter from './routes/ai';
import virtualHumanRouter, { wsClients, sessionInfo, handleWebSocket } from './routes/virtualHuman';
import { errorHandler } from './middlewares/errorHandler';
import { Request, Response } from 'express';

// WebSocket验证客户端信息的类型
interface VerifyClientInfo {
  origin: string;
  secure: boolean;
  req: http.IncomingMessage;
}

export const createApp = () => {
  const app = express();

  // 配置CORS，允许前端访问
  app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004', 'http://localhost:3005', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001', 'http://127.0.0.1:3002', 'http://127.0.0.1:3003', 'http://127.0.0.1:3004', 'http://127.0.0.1:3005'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  
  app.use(express.json());

  // 健康检查端点
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // 路由配置
  app.use('/api/attractions', attractionsRouter);
  app.use('/api/ai', aiRouter);
  app.use('/api/virtual-human', virtualHumanRouter);

  // 错误处理中间件
  app.use(errorHandler);

  return app;
};

export const createServer = () => {
  const app = createApp();
  const server = http.createServer(app);
  
  // 创建WebSocket服务器
  const wss = new WebSocketServer({ 
    server,
    // 允许跨域
    verifyClient: (info: VerifyClientInfo) => {
      // 打印连接的客户端信息，调试用
      console.log('[WebSocket] 新连接请求:', {
        origin: info.origin,
        secure: info.secure,
        req: {
          url: info.req.url,
          headers: {
            host: info.req.headers.host,
            origin: info.req.headers.origin
          }
        }
      });
      // 允许所有连接
      return true;
    }
  });
  
  // 处理WebSocket连接
  wss.on('connection', (ws, req) => {
    try {
      console.log('[WebSocket] 收到新连接:', req.url);
      
      // 从URL中提取会话ID
      const url = new URL(req.url || '/', `http://${req.headers.host}`);
      const sessionId = url.searchParams.get('sessionId');
      
      if (!sessionId) {
        console.error('[WebSocket] 连接缺少会话ID');
        ws.close(1008, '缺少会话ID');
        return;
      }
      
      console.log(`[WebSocket] 新连接，会话ID: ${sessionId}`);
      
      // 交给虚拟人处理
      handleWebSocket(ws, sessionId);
      
    } catch (error) {
      console.error('[WebSocket] 处理连接时出错:', error);
      ws.close(1011, '处理连接时出错');
    }
  });

  return server;
}; 