/**
 * 虚拟人WebSocket服务
 * 负责与后端WebSocket代理通信，处理虚拟人实时交互
 */

import axios from 'axios';

type MessageHandler = (msg: any) => void;

// 讯飞平台消息类型
interface XFMessage {
  type: string;        // 消息类型
  text?: string;       // 文本内容
  video_url?: string;  // 视频流地址
  audio_url?: string;  // 音频流地址
  error_code?: string; // 错误码
  error_desc?: string; // 错误描述
  result_code?: string; // 结果码
  content?: string;    // 兼容格式：文本内容
  status?: string;     // 状态
  stream_info?: any;   // 流信息参数
  source?: string;     // 消息来源
}

// 定义RTCPlayer类型
declare class RTCPlayer {
  playerType: number;
  stream: any;
  videoSize: { width: number; height: number };
  container: HTMLElement;
  
  on(event: string, callback: Function): this;
  play(): void;
  resume(): void;
  stop(): void;
}

// RTCPlayer可能会从外部脚本加载
declare global {
  interface Window {
    RTCPlayer?: typeof RTCPlayer;
  }
}

export class VirtualHumanWS {
  private ws: WebSocket | null = null;
  private sessionId: string | null = null;
  private handler: MessageHandler | null = null;
  private apiBaseUrl: string = '/api/virtual-human'; // 后端API基础URL
  private isConnecting: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private rtcPlayer: any = null;
  private videoContainer: HTMLElement | null = null;
  private lastStreamUrl: string | null = null;
  private lastStreamInfo: any = null;
  private hasInteracted: boolean = false;
  private backendUrl: string;
  private backendWsUrl: string;
  private rtcPlayerLoaded: boolean = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectDelay: number = 3000; // 初始重连延迟3秒
  private lastActivity: number = Date.now();

  constructor() {
    // 如果提供了完整的后端URL（含协议与端口），则直接使用
    const envBackendUrl = import.meta.env.VITE_BACKEND_URL as string | undefined;

    if (envBackendUrl) {
      // e.g. https://api.example.com:5001 或 http://localhost:5001
      this.backendUrl = envBackendUrl.replace(/\/$/, '');
      const urlObj = new URL(this.backendUrl);
      const wsProto = urlObj.protocol === 'https:' ? 'wss' : 'ws';
      this.backendWsUrl = `${wsProto}://${urlObj.host}`;
    } else {
      // 允许通过 VITE_BACKEND_HOST 指定 host:port
      const envBackendHost = import.meta.env.VITE_BACKEND_HOST as string | undefined;

      // 如果未指定，则自动根据当前页面的域名推断
      const defaultHost = window.location.hostname || 'localhost';
      const backendPort = import.meta.env.VITE_BACKEND_PORT || '5001';
      const backendHost = envBackendHost || `${defaultHost}:${backendPort}`;

      // 根据当前页面协议决定使用 http/ws 还是 https/wss
      const isHttps = window.location.protocol === 'https:';
      const httpProto = isHttps ? 'https' : 'http';
      const wsProto = isHttps ? 'wss' : 'ws';

      this.backendUrl = `${httpProto}://${backendHost}`;
      this.backendWsUrl = `${wsProto}://${backendHost}`;
    }
    this.apiBaseUrl = `${this.backendUrl}/api/virtual-human`;
  }

  /**
   * 连接到虚拟人服务
   * @param handler 消息处理函数
   * @returns 是否连接成功
   */
  async connect(handler: MessageHandler): Promise<boolean> {
    try {
      if (this.isConnecting) {
        console.log('[VirtualHuman] 正在连接中，请稍候...');
        return false;
      }

      this.isConnecting = true;
      this.handler = handler;
      
      // 1. 从后端获取会话token
      console.log('[VirtualHuman] 请求会话token...');
      // 添加超时处理
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
      
      try {
        const response = await fetch(`${this.apiBaseUrl}/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId); // 清除超时
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('[VirtualHuman] 获取会话token失败:', errorData.error, errorData.details || '');
          this.isConnecting = false;
          return false;
        }
        
        const data = await response.json();
        if (!data.success || !data.sessionId) {
          console.error('[VirtualHuman] 获取会话token失败:', data.error || '未知错误');
          this.isConnecting = false;
          return false;
        }
        
        this.sessionId = data.sessionId;
        console.log(`[VirtualHuman] 获取会话token成功: ${this.sessionId}`);
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.error('[VirtualHuman] 获取会话token超时');
        } else {
          console.error('[VirtualHuman] 获取会话token失败:', error);
        }
        this.isConnecting = false;
        return false;
      }
      
      // 2. 连接到后端WebSocket代理
      const wsUrl = `${this.backendWsUrl}/ws?sessionId=${this.sessionId}`;
      
      console.log(`[VirtualHuman] 连接到WebSocket: ${wsUrl}`);
      
      return new Promise((resolve) => {
        try {
          this.ws = new WebSocket(wsUrl);

          if (!this.ws) {
            this.isConnecting = false;
            resolve(false);
            return;
          }

          // 添加WebSocket连接超时
          const connectionTimeoutId = setTimeout(() => {
            if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
              console.error('[VirtualHuman] WebSocket连接超时');
              console.error(this.ws.readyState); // 输出当前WebSocket状态
              this.ws.close();
              this.isConnecting = false;
              resolve(false);
            }
          }, 10000); // 10秒连接超时

          this.ws.onopen = () => {
            console.log('[VirtualHuman] WebSocket已连接');
            this.isConnecting = false;
            this.reconnectAttempts = 0;
            
            clearTimeout(connectionTimeoutId); // 清除连接超时
            
            // 更新最后活动时间
            this.lastActivity = Date.now();
            
            // 启动心跳
            this.startHeartbeat();
            
            // 不要立即resolve，等待连接确认消息
            // 添加5秒后的兜底超时，以防连接确认消息未到达
            setTimeout(() => {
              if (this.isConnecting) {
                console.log('[VirtualHuman] 未收到连接确认消息，继续执行');
                this.isConnecting = false;
                resolve(true);
              }
            }, 5000);
          };
          
          this.ws.onmessage = (event) => {
            if (this.handler) {
              try {
                // 尝试解析消息为JSON
                let data: XFMessage;
                try {
                  data = JSON.parse(event.data);
                } catch (error) {
                  console.error('[VirtualHuman] 解析WebSocket消息失败:', error);
                  console.log('[VirtualHuman] 原始消息:', event.data);
                  return;
                }
                
                console.log('[VirtualHuman] 收到消息:', data);
                
                // 检查是否是连接确认消息
                if (data.type === 'connection_confirm') {
                  console.log('[VirtualHuman] 收到连接确认消息');
                  if (this.isConnecting) {
                    this.isConnecting = false;
                    resolve(true);
                  }
                  return;
                }
                
                // 处理会话不存在的错误
                if (data.type === 'error' && data.error_code === 'SESSION_NOT_FOUND') {
                  console.error('[VirtualHuman] 会话不存在或已过期，将重新创建会话');
                  this.sessionId = null; // 清除失效的会话ID
                  
                  // 关闭当前连接
                  if (this.ws) {
                    this.ws.close();
                  }
                  
                  // 延迟重连
                  setTimeout(() => this.connect(this.handler!), 1000);
                  
                  // 通知用户
                  this.handler({
                    type: 'error',
                    error_code: data.error_code,
                    error_desc: data.error_desc
                  });
                  return;
                }
                
                // 处理讯飞平台特有的消息格式
                if (data.type === 'text' || data.content) {
                  // 文本消息 - 保留原有的文本消息处理机制
                  this.handler({
                    type: 'text',
                    content: data.text || data.content || '',
                    // 添加source字段表明消息来源于虚拟人
                    source: 'virtual_human'
                  });
                } else if (data.type === 'video' && data.video_url) {
                  this.lastStreamUrl = data.video_url;
                  this.lastStreamInfo = data.stream_info || null;
                  
                  // 通知UI层
                  this.handler({
                    type: 'video',
                    video_url: data.video_url,
                    stream_info: data.stream_info
                  });
                  
                  // 如果已设置视频容器，则初始化RTCPlayer
                  if (this.videoContainer) {
                    this.initRTCPlayer(data.stream_info);
                  }
                } else if (data.type === 'audio' && data.audio_url) {
                  // 音频流
                  this.handler({
                    type: 'audio',
                    audio_url: data.audio_url
                  });
                } else if (data.error_code || data.error_desc) {
                  // 错误消息
                  console.error('[VirtualHuman] 平台返回错误:', data.error_code, data.error_desc);
                  this.handler({
                    type: 'error',
                    error_code: data.error_code,
                    error_desc: data.error_desc
                  });
                } else if (data.type === 'heartbeat') {
                  // 心跳响应，不需处理
                  console.log('[VirtualHuman] 收到心跳响应');
                } else {
                  // 其他消息，直接传递
                  this.handler(data);
                }
              } catch (error) {
                console.error('[VirtualHuman] 处理WebSocket消息失败:', error);
              }
            }
          };
          
          this.ws.onerror = (event) => {
            console.error('[VirtualHuman] WebSocket错误:', event);
            // 不要在这里关闭，让onclose去处理
            if (this.isConnecting) {
              clearTimeout(connectionTimeoutId);
              this.isConnecting = false;
              resolve(false);
            }
          };
          
          this.ws.onclose = (event) => {
            console.log('[VirtualHuman] WebSocket已关闭', event.code, event.reason);
            
            // 清理心跳
            this.stopHeartbeat();
            
            // 如果是正常关闭，不需要重连
            if (event.code === 1000) {
              // 正常关闭
              return;
            }
            
            // 针对1005错误码进行特殊处理
            if (event.code === 1005) {
              console.log('[VirtualHuman] 检测到1005错误，这通常是由于WebSocket连接被服务器异常关闭');
              // 可能是浏览器与服务端之间的代理问题
              
              // 如果还在连接中，说明是连接失败导致的关闭
              if (this.isConnecting) {
                clearTimeout(connectionTimeoutId);
                this.isConnecting = false;
                resolve(false);
                return;
              }

              // 尝试立即重连
              console.log('[VirtualHuman] 对于1005错误，立即尝试重连');
              this.reconnectAttempts = 0; // 重置重连次数，视作全新连接
              this.scheduleReconnect(1000); // 1秒后尝试重连
              
              if (this.handler) {
                this.handler({
                  type: 'error',
                  error_code: 'WEBSOCKET_CLOSED_1005',
                  error_desc: '连接已断开(1005)，正在尝试重新连接...'
                });
              }
              return;
            }

            // 针对1006错误码进行特殊处理（异常关闭，无关闭帧）
            if (event.code === 1006) {
              console.log('[VirtualHuman] 检测到1006错误，这通常是由于网络中断或服务器异常导致的无关闭帧关闭');
              
              // 如果还在连接中，则认为连接失败
              if (this.isConnecting) {
                clearTimeout(connectionTimeoutId);
                this.isConnecting = false;
                resolve(false);
                return;
              }

              // 尝试立即重连
              console.log('[VirtualHuman] 对于1006错误，立即尝试重连');
              this.reconnectAttempts = 0;
              this.scheduleReconnect(1000);

              if (this.handler) {
                this.handler({
                  type: 'error',
                  error_code: 'WEBSOCKET_CLOSED_1006',
                  error_desc: '连接已断开(1006)，正在尝试重新连接...'
                });
              }
              return;
            }
            
            // 如果还在连接中，说明是连接失败导致的关闭
            if (this.isConnecting) {
              clearTimeout(connectionTimeoutId);
              this.isConnecting = false;
              resolve(false);
              return;
            }
            
            // 非正常关闭，尝试重连
            console.log(`[VirtualHuman] 尝试重连 (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})...`);
            this.scheduleReconnect();
            
            if (this.handler) {
              this.handler({
                type: 'error',
                error_code: 'WEBSOCKET_CLOSED',
                error_desc: `WebSocket连接已关闭: ${event.code} ${event.reason || '未知原因'}`
              });
            }
          };
        } catch (error) {
          console.error('[VirtualHuman] 连接到WebSocket失败:', error);
          this.isConnecting = false;
          resolve(false);
        }
      });
    } catch (error) {
      console.error('[VirtualHuman] 连接虚拟人服务失败:', error);
      this.isConnecting = false;
      return false;
    }
  }

  /**
   * 发送文本消息
   * @param text 文本内容
   * @returns 是否发送成功
   */
  async sendText(text: string): Promise<boolean> {
    try {
      if (!this.sessionId) {
        console.error('[VirtualHuman] 未建立会话');
        return false;
      }
      
      console.log(`[VirtualHuman] 发送文本消息: ${text}`);
      
      // 用户互动，用于解除浏览器自动播放限制
      this.hasInteracted = true;
      
      if (this.rtcPlayer) {
        try {
          this.rtcPlayer.resume();
        } catch (e) {
          console.log('[VirtualHuman] 尝试恢复播放:', e);
        }
      }
      
      // 通过API发送文本消息
      const response = await fetch(`${this.apiBaseUrl}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          text
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('[VirtualHuman] 发送消息失败:', errorData.error, errorData.details || '');
        return false;
      }
      
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('[VirtualHuman] 发送消息失败:', error);
      return false;
    }
  }

  /**
   * 设置视频容器，用于RTCPlayer
   * @param container 视频容器元素
   */
  setVideoContainer(container: HTMLElement): void {
    this.videoContainer = container;
    
    // 如果已有流URL，则立即初始化RTCPlayer
    if (this.lastStreamUrl) {
      this.initRTCPlayer(this.lastStreamInfo || undefined);
    }
  }
  
  /**
   * 处理用户交互，解除浏览器自动播放限制
   */
  handleUserInteraction(): void {
    this.hasInteracted = true;
    if (this.rtcPlayer) {
      try {
        this.rtcPlayer.resume();
        console.log('[VirtualHuman] 用户交互，尝试恢复播放');
      } catch (e) {
        console.log('[VirtualHuman] 恢复播放失败:', e);
      }
    }
  }
  
  /**
   * 初始化RTCPlayer
   * @param streamInfo 流信息参数
   */
  private initRTCPlayer(streamInfo?: any): void {
    try {
      // 如果传入的是字符串，说明误传了 URL，当成 undefined 处理
      if (streamInfo && typeof streamInfo === 'string') {
        streamInfo = undefined;
      }
      
      // 检查是否有RTCPlayer
      if (!window.RTCPlayer) {
        console.error('[VirtualHuman] RTCPlayer未加载，无法播放视频流');
        return;
      }
      
      // 如果已经有播放器实例，先停止并清理
      if (this.rtcPlayer) {
        this.rtcPlayer.stop();
        this.rtcPlayer = null;
      }
      
      // 确保容器存在
      if (!this.videoContainer) {
        console.error('[VirtualHuman] 未设置视频容器，无法播放');
        return;
      }
      
      // 清空容器
      while (this.videoContainer.firstChild) {
        this.videoContainer.removeChild(this.videoContainer.firstChild);
      }
      
      // 创建播放器容器
      const playerContainer = document.createElement('div');
      playerContainer.className = 'rtc-player-container';
      playerContainer.style.width = '100%';
      playerContainer.style.height = '100%';
      this.videoContainer.appendChild(playerContainer);
      
      console.log('[VirtualHuman] 初始化RTCPlayer...');
      console.log('[VirtualHuman] 流地址:', this.lastStreamUrl);
      
      // 创建RTCPlayer实例
      const player = new window.RTCPlayer();
      
      // 设置事件监听
      player.on("play", () => {
        console.log("[VirtualHuman] RTCPlayer事件: play");
      })
      .on("playing", () => {
        console.log("[VirtualHuman] RTCPlayer事件: playing");
      })
      .on("waiting", () => {
        console.log("[VirtualHuman] RTCPlayer事件: waiting");
      })
      .on("error", (e: any) => {
        console.error("[VirtualHuman] RTCPlayer错误:", e);
        
        // 通知UI层错误
        if (this.handler) {
          this.handler({
            type: 'error',
            error_code: 'PLAYER_ERROR',
            error_desc: '视频播放失败: ' + e
          });
        }
      })
      .on("not-allowed", () => {
        console.log("[VirtualHuman] 触发浏览器限制播放策略，播放前必须与浏览器产生交互");
        // 如果用户已交互，尝试恢复播放
        if (this.hasInteracted) {
          player.resume();
        } else {
          // 通知UI层需要用户交互
          if (this.handler) {
            this.handler({
              type: 'interaction_required',
              error_code: 'NOT_ALLOWED',
              error_desc: '需要用户交互才能播放视频和音频'
            });
          }
        }
      });
      
      // 设置XRTC协议参数
      player.playerType = 12; // XRTC协议类型
      
      // 使用后端传递的streamInfo参数（如果有）
      if (streamInfo) {
        console.log('[VirtualHuman] 使用后端提供的流参数:', streamInfo);
        player.stream = streamInfo;
      } else {
        // 解析流URL中的参数 (根据官方文档提供的格式)
        try {
          console.log('[VirtualHuman] 开始解析流地址参数');
          
          // 检查流URL是否存在
          if (!this.lastStreamUrl) {
            throw new Error('流地址为空');
          }
          
          // 示例URL格式：wss://xrtc-cn-east-2.xf-yun.com/v1/xrtc/start?sid=vdh00093f77@hu190be60f7ee0442882&appid=xxx&userid=xxx
          const url = new URL(this.lastStreamUrl);
          
          // 从URL中提取sid
          let sid = '';
          const sidMatch = this.lastStreamUrl?.match(/sid=([^&]+)/);
          if (sidMatch && sidMatch[1]) {
            sid = sidMatch[1];
          }
          
          // 从URL中提取roomId (根据文档，是stream_url的后半段)
          let roomId = '';
          const pathParts = url.pathname.split('/');
          if (pathParts.length > 0) {
            const lastPart = pathParts[pathParts.length - 1];
            if (lastPart) roomId = lastPart;
          }
          
          // 从查询参数中获取其他值
          const auth = url.searchParams.get('auth') || 'Bearer';
          const appid = url.searchParams.get('appid') || '1000000001';
          const userId = url.searchParams.get('userid') || this.sessionId?.substring(0, 8) || Date.now().toString();
          
          // 构建server (根据文档，是stream_url的前半段，并将xrtc改为http)
          const server = url.protocol + '//' + url.hostname;
          
          console.log('[VirtualHuman] 流参数解析结果:', {
            sid,
            server,
            roomId,
            auth,
            appid,
            userId
          });
          
          // 设置流参数 (必须按照官方文档提供的参数名，大小写一致)
          player.stream = {
            sid: sid,
            server: server,
            auth: auth,
            appid: appid,
            userId: userId,
            roomId: roomId,
            timeStr: Date.now().toString()
          };
          
        } catch (e) {
          console.error('[VirtualHuman] 解析流URL参数失败:', e);
          console.log('[VirtualHuman] 使用默认流参数');
          
          // 如果解析失败，使用默认参数
          player.stream = {
            sid: this.lastStreamUrl || 'default_stream',
            server: 'https://xrtc-cn-east-2.xf-yun.com',
            auth: 'Bearer',
            appid: '1000000001',
            userId: this.sessionId?.substring(0, 8) || Date.now().toString(),
            roomId: 'default',
            timeStr: Date.now().toString()
          };
        }
      }
      
      // 设置视频尺寸 (与虚拟人保持一致)
      player.videoSize = { 
        width: 720,
        height: 1280
      };
      
      // 设置容器
      player.container = playerContainer;
      
      console.log('[VirtualHuman] 开始播放视频流');
      
      // 开始播放
      player.play();
      
      // 保存播放器引用
      this.rtcPlayer = player;
      
    } catch (error) {
      console.error('[VirtualHuman] 初始化RTCPlayer失败:', error);
      
      // 通知UI层错误
      if (this.handler) {
        this.handler({
          type: 'error',
          error_code: 'PLAYER_INIT_ERROR',
          error_desc: '初始化播放器失败: ' + error
        });
      }
    }
  }

  /**
   * 关闭连接
   */
  async close(): Promise<void> {
    try {
      // 停止RTCPlayer
      if (this.rtcPlayer) {
        try {
          this.rtcPlayer.stop();
        } catch (e) {
          console.error('[VirtualHuman] 停止RTCPlayer失败:', e);
        }
        this.rtcPlayer = null;
      }
      
      // 停止心跳
      this.stopHeartbeat();
      
      if (this.sessionId) {
        console.log('[VirtualHuman] 关闭会话...');
        
        // 关闭会话
        await fetch(`${this.apiBaseUrl}/close`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sessionId: this.sessionId
          })
        });
      }
      
      // 关闭WebSocket连接
      this.ws?.close();
      this.ws = null;
      this.sessionId = null;
      this.lastStreamUrl = null;
      console.log('[VirtualHuman] 会话已关闭');
    } catch (error) {
      console.error('[VirtualHuman] 关闭会话失败:', error);
    }
  }
  
  /**
   * 启动心跳机制
   * 每5秒发送一次心跳消息，保持连接
   */
  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      // 更新上次活动时间，避免在发心跳时自己触发重连
      this.lastActivity = Date.now();
      
      this.sendHeartbeat();
      
      // 检查连接是否长时间无活动
      const inactiveTime = Date.now() - this.lastActivity;
      if (inactiveTime > 30000) { // 30秒无活动
        console.warn(`[VirtualHuman] 连接长时间无活动 (${inactiveTime}ms)，尝试重连`);
        this.reconnect();
      }
    }, 5000); // 5秒发送一次心跳，确保不会触发讯飞平台的over time错误
  }
  
  /**
   * 停止心跳机制
   */
  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // 发送心跳
  private sendHeartbeat(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('[VirtualHuman] 发送心跳');
      try {
        this.ws.send(JSON.stringify({
          type: 'heartbeat',
          timestamp: Date.now()
        }));
        
        // 同时通过API发送心跳
        if (this.sessionId) {
          fetch(`${this.apiBaseUrl}/heartbeat`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: this.sessionId })
          })
          .catch(error => console.error('[VirtualHuman] 发送API心跳失败:', error));
        }
      } catch (error) {
        console.error('[VirtualHuman] 发送心跳失败:', error);
      }
    } else {
      console.warn('[VirtualHuman] 无法发送心跳，WebSocket未连接或已关闭');
      
      // WebSocket已关闭，尝试重连
      if (this.ws && this.ws.readyState === WebSocket.CLOSED) {
        this.scheduleReconnect();
      }
    }
  }
  
  // 安排重连
  private scheduleReconnect(delay?: number): void {
    // 清除现有的重连计划
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    // 超过最大重连次数
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[VirtualHuman] 达到最大重连次数，停止重连');
      
      // 通知UI层
      if (this.handler) {
        this.handler({
          type: 'error',
          error_code: 'MAX_RECONNECT_ATTEMPTS',
          error_desc: '连接失败，已达到最大重连次数'
        });
      }
      
      return;
    }
    
    // 计算重连延迟（指数退避策略）
    const calculatedDelay = delay || Math.min(30000, this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts));
    console.log(`[VirtualHuman] 计划在 ${calculatedDelay}ms 后重连，尝试次数: ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts}`);
    
    // 通知UI层
    if (this.handler) {
      this.handler({
        type: 'reconnect_scheduled',
        attempt: this.reconnectAttempts + 1,
        maxAttempts: this.maxReconnectAttempts,
        delay: calculatedDelay
      });
    }
    
    // 安排重连
    this.reconnectTimeout = setTimeout(() => {
      this.reconnect();
    }, calculatedDelay);
  }
  
  // 执行重连
  private async reconnect(): Promise<void> {
    // 已经有连接，先关闭
    if (this.ws) {
      this.close();
    }
    
    // 增加重连次数
    this.reconnectAttempts++;
    
    console.log(`[VirtualHuman] 正在重连，尝试次数: ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
    
    // 通知UI层
    if (this.handler) {
      this.handler({
        type: 'reconnecting',
        attempt: this.reconnectAttempts,
        maxAttempts: this.maxReconnectAttempts
      });
    }
    
    // 重新连接
    const success = await this.connect(this.handler!);
    
    if (!success) {
      console.error('[VirtualHuman] 重连失败');
      
      // 安排下一次重连
      this.scheduleReconnect();
    } else {
      console.log('[VirtualHuman] 重连成功');
      
      // 通知UI层
      if (this.handler) {
        this.handler({
          type: 'reconnected'
        });
      }
    }
  }
} 