import express from 'express';
import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const router = express.Router();
const wsClients = new Map<string, WebSocket>();
const sessionInfo = new Map<string, any>();

// 心跳间隔，讯飞平台要求15秒内发送一次心跳
const HEARTBEAT_INTERVAL = 5000; // 5秒，降低间隔确保不会超时
// 连接超时时间
const CONNECTION_TIMEOUT = 30000; // 30秒

// 虚拟人平台配置
const VIRTUAL_HUMAN_CONFIG = {
  wsUrl: 'wss://avatar.cn-huadong-1.xf-yun.com/v1/interact', // 讯飞虚拟人平台地址
  app_id: process.env.XFYUN_APP_ID || '',
  api_key: process.env.XFYUN_API_KEY || '',
  api_secret: process.env.XFYUN_API_SECRET || '',
  scene_id: process.env.XFYUN_SCENE_ID || '',
  avatar_id: process.env.XFYUN_AVATAR_ID || '',
  vcn: process.env.XFYUN_VCN || 'x4_lingxiaoying_assist' // 发音人
};

const isVirtualHumanConfigured = () =>
  Boolean(
    VIRTUAL_HUMAN_CONFIG.app_id &&
      VIRTUAL_HUMAN_CONFIG.api_key &&
      VIRTUAL_HUMAN_CONFIG.api_secret &&
      VIRTUAL_HUMAN_CONFIG.scene_id &&
      VIRTUAL_HUMAN_CONFIG.avatar_id
  );

// 生成讯飞平台所需的认证信息
function assembleAuthUrl(requestUrl: string, apiKey: string, apiSecret: string): { url: string, date: string } {
  try {
    // 转换WebSocket的URL，ws转为http，wss转为https
    const httpRequestUrl = requestUrl.replace("ws://", "http://").replace("wss://", "https://");
    
    // 生成RFC 1123格式的时间戳
    const now = new Date();
    const date = now.toUTCString();
    
    // 生成签名字符串
    const host = new URL(httpRequestUrl).host;
    const path = new URL(httpRequestUrl).pathname;
    const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
    
    // 使用HMAC-SHA256进行签名
    const hmac = crypto.createHmac('sha256', apiSecret);
    hmac.update(signatureOrigin);
    const signature = hmac.digest('base64');
    
    // 组装认证字段
    const authorizationOrigin = `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
    const authorization = Buffer.from(authorizationOrigin).toString('base64');
    
    // 返回带授权信息的URL和日期
    const url = `${requestUrl}?authorization=${authorization}&date=${encodeURIComponent(date)}&host=${host}`;
    return { url, date };
  } catch (error) {
    console.error('组装认证URL失败:', error);
    throw new Error(`组装认证URL失败: ${error}`);
  }
}

// 获取会话token
router.post('/token', async (req, res) => {
  try {
    const sessionId = uuidv4();
    console.log(`[虚拟人] 创建会话: ${sessionId}`);

    // 保存会话信息
    sessionInfo.set(sessionId, {
      createdAt: new Date(),
      lastActivity: new Date(),
      config: { ...VIRTUAL_HUMAN_CONFIG },
    });

    res.json({
      success: true,
      sessionId,
      message: '会话创建成功'
    });
  } catch (error) {
    console.error('[虚拟人] 创建会话失败:', error);
    res.status(500).json({
      success: false,
      error: '创建会话失败',
      details: String(error)
    });
  }
});

// 发送文本消息
router.post('/send', async (req, res) => {
  try {
    const { sessionId, text } = req.body;

    if (!sessionId || !text) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数',
        details: '需要提供sessionId和text'
      });
    }

    // 检查会话是否存在
    if (!sessionInfo.has(sessionId)) {
      return res.status(404).json({
        success: false,
        error: '会话不存在',
        details: '请先创建会话'
      });
    }

    // 获取WebSocket连接
    const wsClient = wsClients.get(sessionId);
    if (!wsClient || wsClient.readyState !== WebSocket.OPEN) {
      return res.status(400).json({
        success: false,
        error: 'WebSocket连接未建立',
        details: '请先建立WebSocket连接'
      });
    }

    // 更新会话最后活动时间
    const session = sessionInfo.get(sessionId);
    session.lastActivity = new Date();

    // 发送文本交互消息
    const textMessage = {
      type: 'text_interact',
      data: {
        text: text,
        pers_id: session.config.avatar_id,
        vcn: session.config.vcn
      }
    };

    console.log(`[虚拟人] 发送文本消息: ${text}`);
    wsClient.send(JSON.stringify(textMessage));

    res.json({
      success: true,
      message: '消息已发送'
    });
  } catch (error) {
    console.error('[虚拟人] 发送消息失败:', error);
    res.status(500).json({
      success: false,
      error: '发送消息失败',
      details: String(error)
    });
  }
});

// 关闭会话
router.post('/close', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数',
        details: '需要提供sessionId'
      });
    }

    // 关闭WebSocket连接
    const wsClient = wsClients.get(sessionId);
    if (wsClient) {
      wsClient.close();
      wsClients.delete(sessionId);
    }

    // 删除会话信息
    sessionInfo.delete(sessionId);

    console.log(`[虚拟人] 关闭会话: ${sessionId}`);
    res.json({
      success: true,
      message: '会话已关闭'
    });
  } catch (error) {
    console.error('[虚拟人] 关闭会话失败:', error);
    res.status(500).json({
      success: false,
      error: '关闭会话失败',
      details: String(error)
    });
  }
});

// 会话心跳
router.post('/heartbeat', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数',
        details: '需要提供sessionId'
      });
    }

    // 检查会话是否存在
    if (!sessionInfo.has(sessionId)) {
      return res.status(404).json({
        success: false,
        error: '会话不存在',
        details: '请先创建会话'
      });
    }

    // 更新会话最后活动时间
    const session = sessionInfo.get(sessionId);
    session.lastActivity = new Date();

    // 如果有讯飞平台的WebSocket连接，发送心跳
    if (session.platformWs && session.platformWs.readyState === WebSocket.OPEN) {
      session.platformWs.send(JSON.stringify({ type: 'ping' }));
    }

    res.json({
      success: true,
      message: '心跳已更新'
    });
  } catch (error) {
    console.error('[虚拟人] 心跳更新失败:', error);
    res.status(500).json({
      success: false,
      error: '心跳更新失败',
      details: String(error)
    });
  }
});

// WebSocket连接处理
export function handleWebSocket(ws: WebSocket, sessionId: string) {
  try {
    // 检查会话是否存在
    if (!sessionInfo.has(sessionId)) {
      console.error(`[虚拟人] WebSocket连接失败: 会话 ${sessionId} 不存在`);
      ws.send(JSON.stringify({
        type: 'error',
        error_code: 'SESSION_NOT_FOUND',
        error_desc: `会话 ${sessionId} 不存在或已过期，请刷新页面重试`
      }));
      ws.close(1008, '无效会话');
      return;
    }

    console.log(`[WebSocket] 新连接，会话ID: ${sessionId}`);
    
    // 先给客户端发送一个连接确认消息
    ws.send(JSON.stringify({
      type: 'connection_confirm',
      message: '连接已建立',
      timestamp: Date.now()
    }));
    
    // 保存WebSocket连接
    wsClients.set(sessionId, ws);
    
    // 获取会话信息
    const session = sessionInfo.get(sessionId);
    
    // 更新会话最后活动时间
    session.lastActivity = new Date();

    if (!isVirtualHumanConfigured()) {
      ws.send(JSON.stringify({
        type: 'text',
        text: '当前为本地演示模式：未配置讯飞虚拟人密钥，因此不会连接外部平台。'
      }));

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          session.lastActivity = new Date();

          if (message.type === 'heartbeat') return;

          if (message.type === 'text') {
            ws.send(JSON.stringify({
              type: 'text',
              text: `小青徽收到：${message.text || '欢迎来到青龙湾'}`
            }));
          }
        } catch (error) {
          console.error('[虚拟人] 本地演示消息处理失败:', error);
        }
      });

      ws.on('close', () => {
        wsClients.delete(sessionId);
      });

      return;
    }
    
    // 创建到讯飞平台的WebSocket连接
    try {
      // 组装带有认证信息的URL
      const { url, date } = assembleAuthUrl(
        VIRTUAL_HUMAN_CONFIG.wsUrl, 
        VIRTUAL_HUMAN_CONFIG.api_key, 
        VIRTUAL_HUMAN_CONFIG.api_secret
      );
      
      console.log(`[虚拟人] 连接到讯飞平台: ${url}`);
      
      // 创建到讯飞平台的WebSocket连接
      const platformWs = new WebSocket(url, {
        headers: {
          'Date': date
        },
        handshakeTimeout: CONNECTION_TIMEOUT, // 增加连接超时时间
        followRedirects: true // 添加自动跟踪重定向选项
      });
      
      // 保存讯飞平台的WebSocket连接
      session.platformWs = platformWs;

      // 连接超时处理
      let connectionTimeoutId = setTimeout(() => {
        if (platformWs.readyState !== WebSocket.OPEN) {
          console.error('[虚拟人] 连接讯飞平台超时');
          platformWs.terminate();
          ws.send(JSON.stringify({
            type: 'error',
            error_code: 'CONNECTION_TIMEOUT',
            error_desc: '连接讯飞平台超时，请重试'
          }));
        }
      }, CONNECTION_TIMEOUT);
      
      // 监听讯飞平台WebSocket连接成功
      platformWs.on('open', () => {
        console.log(`[虚拟人] 连接到讯飞平台成功`);
        
        // 清除连接超时定时器
        clearTimeout(connectionTimeoutId);
        
        // 发送启动消息
        const startMessage = {
          header: {
            app_id: VIRTUAL_HUMAN_CONFIG.app_id,
            ctrl: 'start',
            request_id: `start_${Date.now()}`,
            scene_id: VIRTUAL_HUMAN_CONFIG.scene_id
          },
          parameter: {
            avatar: {
              avatar_id: VIRTUAL_HUMAN_CONFIG.avatar_id,
              stream: {
                protocol: 'xrtc',
                alpha: 0
              }
            },
            tts: {
              vcn: VIRTUAL_HUMAN_CONFIG.vcn
            }
          }
          // payload 无需在 start 时填写
        };
        
        console.log('[虚拟人] 发送start消息:', startMessage);
        platformWs.send(JSON.stringify(startMessage));
        
        // 启动心跳，更频繁地发送心跳以避免超时
        const heartbeat = setInterval(() => {
          if (platformWs.readyState === WebSocket.OPEN) {
            console.log('[虚拟人] 发送平台心跳');
            try {
              // 优先使用原生 WebSocket ping 帧，避免平台识别 JSON 心跳格式不正确导致 10114 超时
              if (typeof (platformWs as any).ping === 'function') {
                // Node.js ws 库支持 ping 方法
                (platformWs as any).ping();
              } else {
                // 回退到 JSON 格式心跳（旧实现）
                platformWs.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
              }
            } catch (error) {
              console.error('[虚拟人] 发送心跳失败:', error);
            }
          } else {
            console.warn('[虚拟人] 无法发送心跳，连接已关闭');
            clearInterval(heartbeat);
          }
        }, HEARTBEAT_INTERVAL);
        
        session.heartbeat = heartbeat;

        // 添加客户端心跳，确保双向连接保持活跃
        const clientHeartbeat = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            console.log('[虚拟人] 发送客户端心跳');
            try {
              ws.send(JSON.stringify({ 
                type: 'heartbeat', 
                timestamp: Date.now() 
              }));
            } catch (error) {
              console.error('[虚拟人] 发送客户端心跳失败:', error);
            }
          } else {
            console.warn('[虚拟人] 无法发送客户端心跳，连接已关闭');
            clearInterval(clientHeartbeat);
          }
        }, HEARTBEAT_INTERVAL * 2);
        
        session.clientHeartbeat = clientHeartbeat;

        // 监听pong事件，确认心跳响应
        (platformWs as any).on('pong', () => {
          console.log('[虚拟人] 收到平台PONG响应');
        });
      });
      
      // 监听讯飞平台WebSocket消息
      platformWs.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          console.log('[虚拟人] 收到讯飞平台消息:', message);
          
          // 更新会话最后活动时间
          session.lastActivity = new Date();
          
          // 解析消息
          if (message.payload?.avatar?.event_type === 'stream_info') {
            const avatarPayload = message.payload.avatar;
            const videoUrl = avatarPayload.stream_url; // xrtcs://...

            console.log('[虚拟人] 收到 stream_info，流地址:', videoUrl);

            // ---------------- 构造完整 streamInfo ----------------
            let streamInfo: any = {};

            try {
              const urlObj = new URL(videoUrl.replace('xrtcs://', 'http://')); // 方便解析
              const server = `${urlObj.protocol.replace('http', 'xrtcs')}//${urlObj.host}`; // 恢复 xrtcs://域名
              const roomId = urlObj.pathname.replace(/^\//, '');

              // 从 header.sid 或 payload.avatar.cid 推测 sid
              const sidCandidate = message.header?.sid || avatarPayload.cid || '';

              streamInfo = {
                sid: sidCandidate,
                server,
                roomId,
                auth: avatarPayload.stream_extend?.user_sign || avatarPayload.user_sign || '',
                appid: avatarPayload.stream_extend?.appid || VIRTUAL_HUMAN_CONFIG.app_id,
                userId: sessionId.substring(0, 8),
                timeStr: Date.now().toString()
              };
            } catch (e) {
              console.error('[虚拟人] 解析 stream_url 失败:', e);
            }

            const videoPayload = {
              type: 'video',
              video_url: videoUrl,
              stream_info: streamInfo
            };

            console.log('[虚拟人] 向客户端推送 video 帧:', videoPayload);
            ws.send(JSON.stringify(videoPayload));
            console.log('[虚拟人] video 帧已发送给会话', sessionId);
          }
          else if (message.code === 0 && message.header && message.header.type === 'init') {
            // 初始化消息，包含流地址
            const streamData = message.payload.stream;
            console.log('[虚拟人] 解析旧版 init 流信息');
            
            const videoUrl = `${streamData.server.replace("http://", "wss://")}/v1/xrtc/start?sid=${streamData.sid}&appid=${VIRTUAL_HUMAN_CONFIG.app_id}&userid=${sessionId.substring(0, 8)}`;
            
            const streamInfo = {
              sid: streamData.sid,
              server: streamData.server,
              roomId: streamData.roomid,
              auth: `Bearer ${streamData.user_sign}`,
              appid: VIRTUAL_HUMAN_CONFIG.app_id,
              userId: sessionId.substring(0, 8),
              timeStr: Date.now().toString()
            };
            
            ws.send(JSON.stringify({
              type: 'video',
              video_url: videoUrl,
              stream_info: streamInfo
            }));
          }
          else if (message.header && message.header.type === 'tts') {
            // TTS语音合成消息
            const content = message.payload.text || '';
            
            // 发送文本给客户端
            ws.send(JSON.stringify({
              type: 'text',
              text: content
            }));
          }
          else if (message.error_code || message.header?.code !== 0) {
            // 错误消息
            console.error('[虚拟人] 讯飞平台返回错误:', message.error_code, message.error_desc || message.header?.message);
            
            // 发送错误给客户端
            ws.send(JSON.stringify({
              type: 'error',
              error_code: message.error_code || message.header?.code || 'UNKNOWN_ERROR',
              error_desc: message.error_desc || message.header?.message || '未知错误'
            }));

            // 如果是超时错误，尝试自动重连
            if (message.error_code === 10114 || message.error_desc === 'over time') {
              console.log('[虚拟人] 检测到超时错误，尝试重连');
              // 关闭当前连接
              if (platformWs.readyState === WebSocket.OPEN) {
                platformWs.close();
              }
              
              // 清理心跳
              if (session.heartbeat) {
                clearInterval(session.heartbeat);
                delete session.heartbeat;
              }

              // 通知客户端需要重连
              ws.send(JSON.stringify({
                type: 'error',
                error_code: 'CONNECTION_RESET_NEEDED',
                error_desc: '连接已超时，请重新连接'
              }));
            }
          }
          else if (message.header && message.header.type === 'pong') {
            // 心跳响应，不需要处理
            console.log('[虚拟人] 收到心跳响应');
          }
          else {
            // 其他消息直接转发给客户端
            ws.send(data.toString());
          }
        } catch (error) {
          console.error('[虚拟人] 处理讯飞平台消息失败:', error);
        }
      });
      
      // 监听讯飞平台WebSocket错误
      platformWs.on('error', (error) => {
        console.error('[虚拟人] 讯飞平台WebSocket错误:', error);
        ws.send(JSON.stringify({
          type: 'error',
          error_code: 'PLATFORM_WEBSOCKET_ERROR',
          error_desc: `讯飞平台连接错误: ${error.message || String(error)}`
        }));
      });
      
      // 监听讯飞平台WebSocket关闭
      platformWs.on('close', (code, reason) => {
        console.log(`[虚拟人] 讯飞平台WebSocket已关闭: ${code} ${reason}`);
        
        // 清理心跳
        if (session.heartbeat) {
          clearInterval(session.heartbeat);
          delete session.heartbeat;
        }

        // 清理客户端心跳
        if (session.clientHeartbeat) {
          clearInterval(session.clientHeartbeat);
          delete session.clientHeartbeat;
        }
        
        ws.send(JSON.stringify({
          type: 'error',
          error_code: 'PLATFORM_WEBSOCKET_CLOSED',
          error_desc: `讯飞平台连接已关闭: ${code} ${reason}`
        }));
      });
      
      // 监听WebSocket事件
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          console.log(`[虚拟人] 收到客户端消息:`, message);
          
          // 处理心跳消息
          if (message.type === 'heartbeat') {
            session.lastActivity = new Date();
            return;
          }
          
          // 处理文本消息
          if (message.type === 'text') {
            // 客户端发送文本，转发给讯飞平台
            const textMessage = {
              type: 'text_interact',
              data: {
                text: message.text,
                pers_id: VIRTUAL_HUMAN_CONFIG.avatar_id,
                vcn: VIRTUAL_HUMAN_CONFIG.vcn
              }
            };
            
            if (platformWs.readyState === WebSocket.OPEN) {
              console.log('[虚拟人] 转发文本消息到讯飞平台:', message.text);
              platformWs.send(JSON.stringify(textMessage));
            } else {
              console.error('[虚拟人] 无法转发消息，讯飞平台连接已关闭');
              ws.send(JSON.stringify({
                type: 'error',
                error_code: 'PLATFORM_WEBSOCKET_CLOSED',
                error_desc: '讯飞平台连接已关闭，无法发送消息'
              }));
            }
          }
        } catch (error) {
          console.error(`[虚拟人] 处理客户端消息失败:`, error);
        }
      });
      
      // 添加错误事件处理
      ws.on('error', (error) => {
        console.error(`[虚拟人] 客户端WebSocket错误 (${sessionId}):`, error);
        
        // 记录更多详细信息
        if (error instanceof Error) {
          console.error(`[虚拟人] 错误类型: ${error.name}, 描述: ${error.message}`);
          console.error(`[虚拟人] 错误堆栈: ${error.stack}`);
        }
        
        // 如果需要，可以发送错误通知给客户端
        try {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'error',
              error_code: 'WEBSOCKET_ERROR',
              error_desc: `WebSocket连接错误: ${error.message || '未知错误'}`
            }));
          }
        } catch (e) {
          console.error(`[虚拟人] 无法向客户端发送错误通知:`, e);
        }
      });
      
      // 监听客户端WebSocket关闭
      ws.on('close', (code, reason) => {
        console.log(`[虚拟人] 客户端WebSocket已关闭: ${sessionId}, 关闭码: ${code}, 原因: ${reason || '无'}`);
        
        // 关闭到讯飞平台的连接
        if (platformWs.readyState === WebSocket.OPEN) {
          platformWs.close();
        }
        
        // 清理心跳
        if (session.heartbeat) {
          clearInterval(session.heartbeat);
          delete session.heartbeat;
        }

        // 清理客户端心跳
        if (session.clientHeartbeat) {
          clearInterval(session.clientHeartbeat);
          delete session.clientHeartbeat;
        }
        
        // 删除WebSocket连接
        wsClients.delete(sessionId);
      });
      
    } catch (error) {
      console.error('[虚拟人] 创建讯飞平台WebSocket连接失败:', error);
      ws.send(JSON.stringify({
        type: 'error',
        error_code: 'PLATFORM_CONNECTION_ERROR',
        error_desc: `连接讯飞平台失败: ${error}`
      }));
      ws.close(1011, '无法连接到讯飞平台');
    }
  } catch (error) {
    console.error('[虚拟人] WebSocket连接处理失败:', error);
    ws.send(JSON.stringify({
      type: 'error',
      error_code: 'WEBSOCKET_CONNECTION_ERROR',
      error_desc: `WebSocket连接失败: ${error}`
    }));
    ws.close(1012, '无法建立WebSocket连接');
  }
}

export { wsClients, sessionInfo };
export default router; 
