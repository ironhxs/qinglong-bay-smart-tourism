import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Tabs, Card, Typography, Button, Input, Avatar, Space, List, Divider } from 'antd';
import { 
  AudioOutlined, 
  CameraOutlined, 
  RobotOutlined, 
  PlayCircleOutlined, 
  PauseCircleOutlined,
  BankOutlined,
  HistoryOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  SendOutlined,
  UserOutlined
} from '@ant-design/icons';
import MainLayout from '../components/layout/MainLayout';
import { speak, stopSpeaking, isSpeaking, voiceGuideContents } from '../services/tts';
import { culturalScenes, initARScene, isARSupported, requestCameraPermission } from '../services/ar';
import VirtualHumanChat from '../components/VirtualHumanChat';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

// 语音导览组件
const VoiceGuide: React.FC = () => {
  const [playing, setPlaying] = useState<number | null>(null);
  const [customText, setCustomText] = useState('');
  
  // 停止当前播放的语音
  const stopCurrentSpeech = () => {
    stopSpeaking();
    setPlaying(null);
  };
  
  // 播放或暂停语音
  const togglePlay = (id: number) => {
    if (playing === id) {
      stopCurrentSpeech();
    } else {
      stopCurrentSpeech();
      speak(voiceGuideContents[id as keyof typeof voiceGuideContents]);
      setPlaying(id);
    }
  };

  // 生成自定义语音导览
  const generateCustomGuide = () => {
    if (!customText.trim()) {
      return;
    }
    
    stopCurrentSpeech();
    speak(customText);
  };
  
  // 语音导览数据
  const voiceGuideData = [
    { id: 1, name: '青龙湾历史介绍', duration: '3:25', icon: <HistoryOutlined /> },
    { id: 2, name: '徽派建筑特色', duration: '2:45', icon: <BankOutlined /> },
    { id: 3, name: '青龙湾生态系统', duration: '4:10', icon: <EnvironmentOutlined /> },
    { id: 4, name: '当地民俗文化', duration: '5:20', icon: <TeamOutlined /> },
  ];
  
  return (
    <Card>
      <Title level={4}>AI语音导览（徽音随行）</Title>
      <Paragraph>
        使用先进的AI语音合成技术，为您提供沉浸式的景点讲解体验。点击播放按钮即可收听。
      </Paragraph>
      
      <List
        itemLayout="horizontal"
        dataSource={voiceGuideData}
        renderItem={item => (
          <List.Item
            actions={[
              <Button 
                type="primary" 
                shape="circle" 
                icon={playing === item.id ? <PauseCircleOutlined /> : <PlayCircleOutlined />} 
                onClick={() => togglePlay(item.id)}
              />
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar icon={item.icon} style={{ backgroundColor: '#1890ff' }} />}
              title={item.name}
              description={`时长: ${item.duration}`}
            />
          </List.Item>
        )}
      />
      
      <Divider />
      
      <Title level={5}>自定义语音导览</Title>
      <Space direction="vertical" style={{ width: '100%' }}>
        <TextArea 
          rows={4} 
          placeholder="请输入您想了解的内容，AI将为您生成语音导览..." 
          value={customText}
          onChange={e => setCustomText(e.target.value)}
        />
        <Button 
          type="primary" 
          icon={<AudioOutlined />}
          onClick={generateCustomGuide}
        >
          生成语音导览
        </Button>
      </Space>
    </Card>
  );
};

// AR文化重现组件
const ARScene: React.FC = () => {
  const [selectedScene, setSelectedScene] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const arContainerRef = useRef<HTMLDivElement>(null);
  
  // 检查AR支持
  const [arSupported, setArSupported] = useState<boolean>(false);
  
  useEffect(() => {
    // 检查设备是否支持AR
    setArSupported(isARSupported());
  }, []);
  
  // 启动AR场景
  const startARScene = async (sceneId: string) => {
    setSelectedScene(sceneId);
    
    // 请求摄像头权限
    const permission = await requestCameraPermission();
    setCameraPermission(permission);
    
    if (permission && arContainerRef.current) {
      // 初始化AR场景
      initARScene('ar-container', sceneId);
    }
  };
  
  // 为每个场景准备缩略图
  const getSceneThumbnail = (sceneId: string) => {
    // 使用本地图片
    return `/images/${sceneId}.jpg`;
  };
  
  return (
    <Card>
      <Title level={4}>AR文化重现（虚实徽境）</Title>
      <Paragraph>
        通过增强现实技术，重现青龙湾历史文化场景，让历史在您眼前栩栩如生。
        {!arSupported && (
          <Text type="danger" style={{ display: 'block', marginTop: 8 }}>
            您的设备可能不支持AR功能，但您仍可以查看场景预览图片。
          </Text>
        )}
      </Paragraph>
      
      <div style={{ marginBottom: 20 }}>
        <Text type="secondary">请选择您想体验的AR场景：</Text>
      </div>
      
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
        dataSource={culturalScenes}
        renderItem={item => (
          <List.Item>
            <Card 
              hoverable 
              cover={<img alt={item.name} src={getSceneThumbnail(item.id)} />}
              actions={[
                <Button 
                  type="primary" 
                  icon={<CameraOutlined />}
                  onClick={() => startARScene(item.id)}
                >
                  启动AR
                </Button>
              ]}
            >
              <Card.Meta title={item.name} description={item.description} />
            </Card>
          </List.Item>
        )}
      />
      
      <Divider />
      
      <div 
        id="ar-container" 
        ref={arContainerRef}
        style={{ 
          textAlign: 'center', 
          padding: 20, 
          background: '#f5f5f5', 
          borderRadius: 4,
          minHeight: 300
        }}
      >
        {selectedScene === null ? (
          <>
            <BankOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <Title level={5}>AR体验区</Title>
            <Paragraph>
              请先选择上方的AR场景，然后允许使用摄像头权限以获得最佳体验。
            </Paragraph>
          </>
        ) : (
          <Paragraph>正在加载 {selectedScene} 场景...</Paragraph>
        )}
      </div>
    </Card>
  );
};

// 虚拟角色互动组件（使用新的VirtualHumanChat组件）
const VirtualCharacter: React.FC = () => {
  return (
    <Card>
      <Title level={4}>虚拟人实时交互（小青徽）</Title>
      <Paragraph>
        与AI驱动的虚拟导游"小青徽"实时对话，体验沉浸式交互，了解青龙湾和徽州文化的点点滴滴。
      </Paragraph>
      
      <VirtualHumanChat />
    </Card>
  );
};

// 主页面组件
const ImmersiveTour: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 根据当前路径确定激活的标签页
  const getActiveTabKey = () => {
    const path = location.pathname;
    if (path.includes('/voice')) return 'voice';
    if (path.includes('/ar')) return 'ar';
    if (path.includes('/character')) return 'character';
    return 'voice'; // 默认标签页
  };
  
  const handleTabChange = (key: string) => {
    navigate(`/immersive/${key}`);
  };
  
  return (
    <MainLayout title="徽脉智语·沉浸漫游">
      <Tabs 
        activeKey={getActiveTabKey()}
        onChange={handleTabChange}
        style={{ marginBottom: 16 }}
      >
        <TabPane tab={<span><AudioOutlined />AI语音导览</span>} key="voice" />
        <TabPane tab={<span><CameraOutlined />AR文化重现</span>} key="ar" />
        <TabPane tab={<span><RobotOutlined />虚拟角色互动</span>} key="character" />
      </Tabs>
      
      <Routes>
        <Route path="/" element={<Navigate to="voice" replace />} />
        <Route path="voice" element={<VoiceGuide />} />
        <Route path="ar" element={<ARScene />} />
        <Route path="character" element={<VirtualCharacter />} />
      </Routes>
    </MainLayout>
  );
};

export default ImmersiveTour; 