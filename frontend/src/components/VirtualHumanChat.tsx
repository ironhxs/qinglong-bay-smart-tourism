import React, { useEffect, useRef, useState } from 'react';
import { VirtualHumanWS } from '../services/virtualHumanWS';
import './VirtualHumanChat.css';

// 生成唯一ID
function generateUniqueId(prefix: string = ''): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

interface Message {
  id: string;
  from: 'user' | 'virtual' | 'system' | 'ai'; // 添加'ai'类型
  text: string;
  timestamp: number;
  isError?: boolean;
  source?: string;
}

export default function VirtualHumanChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<VirtualHumanWS | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textChatMessagesEndRef = useRef<HTMLDivElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rtcPlayerLoaded, setRtcPlayerLoaded] = useState(false);
  const [interactionRequired, setInteractionRequired] = useState(false);
  
  // 聊天相关状态
  const [showTextChat, setShowTextChat] = useState(true);
  const [showVirtualHuman, setShowVirtualHuman] = useState(true);
  const [activeInput, setActiveInput] = useState<'text_chat' | 'virtual_human'>('text_chat');
  const [textInputValue, setTextInputValue] = useState('');
  const [virtualInputValue, setVirtualInputValue] = useState('');

  // 加载RTCPlayer脚本
  useEffect(() => {
    if (window.RTCPlayer) {
      setRtcPlayerLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = '/rtcplayer.esm.js'; // 确保脚本在正确位置
    script.type = 'module';
    script.async = true;
    script.onload = () => {
      console.log('[VirtualHuman] RTCPlayer脚本加载成功');
      setRtcPlayerLoaded(true);
    };
    script.onerror = () => {
      console.error('[VirtualHuman] RTCPlayer脚本加载失败');
      setError('无法加载虚拟人播放器，请刷新页面重试');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // 连接到虚拟人服务
  useEffect(() => {
    const connectWS = async () => {
      setLoading(true);
      setError(null);
      setInteractionRequired(false);
      
      const ws = new VirtualHumanWS();
      wsRef.current = ws;
      
      const success = await ws.connect((msg) => {
        console.log('收到消息:', msg);
        
        // 处理文本消息
        if (msg.type === 'text' && msg.content) {
          setMessages(prev => [...prev, {
            id: generateUniqueId('virtual'),
            from: 'virtual',
            text: msg.content,
            timestamp: Date.now(),
            source: 'virtual_human'
          }]);
        }
        
        // 处理视频流 - 使用标准方式在RTC不可用时播放
        else if (msg.type === 'video' && msg.video_url && videoRef.current && !rtcPlayerLoaded) {
          videoRef.current.src = msg.video_url;
          videoRef.current.play().catch(err => {
            console.error('播放视频失败:', err);
            setMessages(prev => [...prev, {
              id: generateUniqueId('error'),
              from: 'system',
              text: `视频播放失败: ${err.message}`,
              timestamp: Date.now(),
              isError: true
            }]);
          });
          setVideoLoaded(true);
        }
        
        // 处理音频流
        else if (msg.type === 'audio' && msg.audio_url) {
          const audio = new Audio(msg.audio_url);
          audio.play().catch(err => console.error('播放音频失败:', err));
        }
        
        // 处理需要用户交互的情况
        else if (msg.type === 'interaction_required') {
          console.log('[VirtualHuman] 需要用户交互才能播放');
          setInteractionRequired(true);
          setMessages(prev => [...prev, {
            id: generateUniqueId('interaction'),
            from: 'system',
            text: '请点击页面任意位置以启用音频播放',
            timestamp: Date.now()
          }]);
        }
        
        // 处理错误
        else if (msg.type === 'error') {
          setMessages(prev => [...prev, {
            id: generateUniqueId('error'),
            from: 'system',
            text: `错误: ${msg.error_desc || '未知错误'}`,
            timestamp: Date.now(),
            isError: true
          }]);
          
          // 自动处理特定的错误类型
          if (
            msg.error_code === '10114' || 
            msg.error_desc?.includes('over time') || 
            msg.error_code === 'CONNECTION_RESET_NEEDED' ||
            msg.error_code === 'PLATFORM_WEBSOCKET_CLOSED' ||
            msg.error_code === 'WEBSOCKET_CLOSED_1005' ||
            msg.error_code === 'WEBSOCKET_CLOSED_1006'
          ) {
            // 显示重连消息
            setMessages(prev => [...prev, {
              id: generateUniqueId('reconnect'),
              from: 'system',
              text: '连接已断开，正在尝试重新连接...',
              timestamp: Date.now()
            }]);
            
            // 自动重连
            setTimeout(() => {
              handleReconnect();
            }, 2000);
          } else {
            setError(msg.error_desc || '与虚拟人平台通信时发生错误');
          }
        }
      });
      
      setConnected(success);
      setLoading(false);
      
      if (!success) {
        setError('连接虚拟人平台失败，请稍后重试');
      } else {
        // 添加欢迎消息
        setMessages(prev => [...prev, {
          id: generateUniqueId('welcome'),
          from: 'virtual',
          text: '你好！我是青龙湾虚拟导游小青徽，很高兴为您服务！请问有什么可以帮助您的吗？',
          timestamp: Date.now(),
          source: 'virtual_human'
        }]);
      }
    };
    
    connectWS();
    
    return () => {
      wsRef.current?.close();
    };
  }, []);
  
  // 初始化RTCPlayer
  useEffect(() => {
    if (wsRef.current && videoContainerRef.current && rtcPlayerLoaded && connected) {
      console.log('[VirtualHuman] 设置视频容器');
      wsRef.current.setVideoContainer(videoContainerRef.current);
      setVideoLoaded(true);
    }
  }, [wsRef.current, videoContainerRef.current, rtcPlayerLoaded, connected]);
  
  // 自动滚动到最新消息
  useEffect(() => {
    // 虚拟人消息滚动
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    
    // 文本聊天消息滚动
    if (textChatMessagesEndRef.current) {
      textChatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // 处理用户交互，解除浏览器自动播放限制
  const handleUserInteraction = () => {
    if (wsRef.current && interactionRequired) {
      wsRef.current.handleUserInteraction();
      setInteractionRequired(false);
      
      // 添加交互成功消息
      setMessages(prev => [...prev, {
        id: generateUniqueId('interaction-success'),
        from: 'system',
        text: '音频已启用，现在可以正常与虚拟人对话',
        timestamp: Date.now()
      }]);
    }
  };
  
  // 发送虚拟人消息
  const handleSendToVirtualHuman = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!virtualInputValue.trim() || !wsRef.current || !connected) return;
    
    // 添加用户消息到列表
    const userMsg: Message = {
      id: generateUniqueId('user'),
      from: 'user',
      text: virtualInputValue,
      timestamp: Date.now(),
      source: 'virtual_human'
    };
    
    setMessages(prev => [...prev, userMsg]);
    setVirtualInputValue('');
    
    // 发送到虚拟人服务
    const success = await wsRef.current.sendText(virtualInputValue);
    if (!success) {
      // 发送失败，添加错误消息
      setMessages(prev => [...prev, {
        id: generateUniqueId('error'),
        from: 'system',
        text: '消息发送失败，请稍后重试。',
        timestamp: Date.now(),
        isError: true
      }]);
      setError('无法发送消息，请检查网络连接');
    }
  };

  // 发送文本聊天消息
  const handleSendTextChat = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!textInputValue.trim()) return;
    
    // 添加用户消息到列表
    const userMsg: Message = {
      id: generateUniqueId('text-user'),
      from: 'user',
      text: textInputValue,
      timestamp: Date.now(),
      source: 'text_chat'
    };
    
    setMessages(prev => [...prev, userMsg]);
    
    // 模拟回复
    setTimeout(() => {
      const response: Message = {
        id: generateUniqueId('text-ai'),
        from: 'virtual',
        text: `您好，这是文本聊天回复：${textInputValue}`,
        timestamp: Date.now(),
        source: 'text_chat'
      };
      
      setMessages(prev => [...prev, response]);
    }, 500);
    
    setTextInputValue('');
  };

  // 重新连接
  const handleReconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    setMessages(messages => messages.filter(m => m.source !== 'virtual_human'));
    setLoading(true);
    setConnected(false);
    setVideoLoaded(false);
    setError(null);
    setInteractionRequired(false);
    
    setTimeout(() => {
      const connectWS = async () => {
        const ws = new VirtualHumanWS();
        wsRef.current = ws;
        
        const success = await ws.connect((msg) => {
          // 处理文本消息
          if (msg.type === 'text' && msg.content) {
            setMessages(prev => [...prev, {
              id: generateUniqueId('virtual'),
              from: 'virtual',
              text: msg.content,
              timestamp: Date.now(),
              source: 'virtual_human'
            }]);
          }
          
          // 处理视频流
          else if (msg.type === 'video' && msg.video_url && videoRef.current && !rtcPlayerLoaded) {
            videoRef.current.src = msg.video_url;
            videoRef.current.play().catch(err => {
              console.error('播放视频失败:', err);
              setError(`视频播放失败: ${err.message}`);
            });
            setVideoLoaded(true);
          }
          
          // 处理音频流
          else if (msg.type === 'audio' && msg.audio_url) {
            const audio = new Audio(msg.audio_url);
            audio.play().catch(err => console.error('播放音频失败:', err));
          }
          
          // 处理需要用户交互的情况
          else if (msg.type === 'interaction_required') {
            console.log('[VirtualHuman] 需要用户交互才能播放');
            setInteractionRequired(true);
            setMessages(prev => [...prev, {
              id: generateUniqueId('interaction'),
              from: 'system',
              text: '请点击页面任意位置以启用音频播放',
              timestamp: Date.now()
            }]);
          }
          
          // 处理错误
          else if (msg.type === 'error') {
            setMessages(prev => [...prev, {
              id: generateUniqueId('error'),
              from: 'system',
              text: `错误: ${msg.error_desc || '未知错误'}`,
              timestamp: Date.now(),
              isError: true
            }]);
            
            // 自动处理特定的错误类型
            if (
              msg.error_code === '10114' || 
              msg.error_desc?.includes('over time') || 
              msg.error_code === 'CONNECTION_RESET_NEEDED' ||
              msg.error_code === 'PLATFORM_WEBSOCKET_CLOSED' ||
              msg.error_code === 'WEBSOCKET_CLOSED_1005' ||
              msg.error_code === 'WEBSOCKET_CLOSED_1006'
            ) {
              // 显示重连消息
              setMessages(prev => [...prev, {
                id: generateUniqueId('reconnect'),
                from: 'system',
                text: '连接已断开，正在尝试重新连接...',
                timestamp: Date.now()
              }]);
              
              // 自动重连
              setTimeout(() => {
                handleReconnect();
              }, 2000);
            } else {
              setError(msg.error_desc || '与虚拟人平台通信时发生错误');
            }
          }
        });
        
        setConnected(success);
        setLoading(false);
        
        if (!success) {
          setError('连接虚拟人平台失败，请稍后重试');
        } else {
          // 添加欢迎消息
          setMessages(prev => [...prev, {
            id: generateUniqueId('welcome-reconnect'),
            from: 'virtual',
            text: '你好！我是青龙湾虚拟导游小青徽，很高兴为您服务！请问有什么可以帮助您的吗？',
            timestamp: Date.now(),
            source: 'virtual_human'
          }]);
          
          // 设置视频容器
          if (videoContainerRef.current && rtcPlayerLoaded) {
            ws.setVideoContainer(videoContainerRef.current);
            setVideoLoaded(true);
          }
        }
      };
      
      connectWS();
    }, 1000);
  };

  // 过滤消息 - 根据来源显示
  const textChatMessages = messages.filter(msg => !msg.source || msg.source === 'text_chat');
  const virtualHumanMessages = messages.filter(msg => !msg.source || msg.source === 'virtual_human');
  
  // 处理来自虚拟人服务的消息
  const handleMessage = (msg: any) => {
    console.log('收到消息:', msg);

    if (msg.type === 'text') {
      setMessages(prev => [...prev, {
        id: generateUniqueId('ai'),
        from: 'ai',
        text: msg.content,
        timestamp: Date.now()
      }]);
    } 
    // 处理错误
    else if (msg.type === 'error') {
      setMessages(prev => [...prev, {
        id: generateUniqueId('error'),
        from: 'system',
        text: `错误: ${msg.error_desc || '未知错误'}`,
        timestamp: Date.now(),
        isError: true
      }]);
      
      // 显示重连消息
      if (msg.error_code === 'SESSION_NOT_FOUND' || 
          msg.error_code === '10114' || 
          msg.error_desc?.includes('over time') || 
          msg.error_code === 'CONNECTION_RESET_NEEDED' ||
          msg.error_code === 'PLATFORM_WEBSOCKET_CLOSED') {
        
        setMessages(prev => [...prev, {
          id: generateUniqueId('reconnect'),
          from: 'system',
          text: '连接已断开，正在尝试重新连接...',
          timestamp: Date.now()
        }]);
      }
    }
  };

  return (
    <div className="chat-container">
      <div className="dual-chat-layout">
        {/* 文本聊天区域 */}
        <div className="text-chat-panel">
          <h3>文本聊天</h3>
          <div className="virtual-human-messages text-chat-messages">
            {textChatMessages.map(msg => (
              <div 
                key={msg.id} 
                className={`message ${
                  msg.from === 'user' 
                    ? 'user-message' 
                    : msg.from === 'system' 
                      ? 'system-message' 
                      : 'virtual-message'
                } ${msg.isError ? 'error-message' : ''}`}
              >
                <div className="message-content">{msg.text}</div>
                <div className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
            <div ref={textChatMessagesEndRef} />
          </div>
          
          <form className="virtual-human-input" onSubmit={handleSendTextChat}>
            <input
              type="text"
              value={textInputValue}
              onChange={(e) => setTextInputValue(e.target.value)}
              placeholder="请输入文本聊天问题..."
            />
            <button type="submit" disabled={!textInputValue.trim()}>
              发送
            </button>
          </form>
        </div>

        {/* 虚拟人交互区域 */}
        <div 
          className="virtual-human-chat" 
          onClick={interactionRequired ? handleUserInteraction : undefined}
        >
          <div 
            className="virtual-human-video-container" 
            ref={videoContainerRef}
            onClick={interactionRequired ? handleUserInteraction : undefined}
          >
            {/* 仅当RTCPlayer不可用时使用标准video */}
            {!rtcPlayerLoaded && (
              <video 
                ref={videoRef} 
                className="virtual-human-video" 
                playsInline 
                autoPlay 
                muted={false} 
                controls={false}
                onLoadedData={() => setVideoLoaded(true)}
              />
            )}
            
            {!videoLoaded && (
              <div className="virtual-human-placeholder">
                <img src="/images/avatar.png" alt="小青徽" />
                <p>{error ? '加载虚拟人失败' : '正在加载虚拟人...'}</p>
                {error && <small className="error-text">{error}</small>}
              </div>
            )}
            
            {interactionRequired && videoLoaded && (
              <div className="virtual-human-interaction-prompt">
                <div className="interaction-message">
                  <p>请点击此处启用音频</p>
                  <small>由于浏览器安全限制，需要您的交互才能启用音频播放</small>
                </div>
              </div>
            )}
          </div>
          
          <div className="virtual-human-messages">
            {virtualHumanMessages.map(msg => (
              <div 
                key={msg.id} 
                className={`message ${
                  msg.from === 'user' 
                    ? 'user-message' 
                    : msg.from === 'system' 
                      ? 'system-message' 
                      : 'virtual-message'
                } ${msg.isError ? 'error-message' : ''}`}
              >
                <div className="message-content">{msg.text}</div>
                <div className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <form className="virtual-human-input" onSubmit={handleSendToVirtualHuman}>
            <input
              type="text"
              value={virtualInputValue}
              onChange={(e) => setVirtualInputValue(e.target.value)}
              placeholder="请输入虚拟人问题..."
              disabled={!connected || loading}
            />
            <button 
              type="submit" 
              disabled={!connected || loading || !virtualInputValue.trim()}
            >
              发送
            </button>
          </form>
        </div>
      </div>
      
      {loading && (
        <div className="loading-indicator">
          连接中
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}
      
      {!connected && !loading && (
        <div className="connection-error">
          {error || '连接失败，请重试'}
          <button onClick={handleReconnect}>重新连接</button>
        </div>
      )}
    </div>
  );
} 