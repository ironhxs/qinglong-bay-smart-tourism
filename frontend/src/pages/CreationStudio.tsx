import React, { useState } from 'react';
import { 
  Typography, Row, Col, Card, Tabs, Button, Input, Select, Spin,
  Divider, Tag, Space, Form
} from 'antd';
import { 
  EditOutlined, BgColorsOutlined, SoundOutlined, BorderOuterOutlined, 
  BookOutlined, PictureOutlined, EyeOutlined, HistoryOutlined,
  BankOutlined, EnvironmentOutlined, TeamOutlined, FormOutlined,
  CameraOutlined
} from '@ant-design/icons';
import MainLayout from '../components/layout/MainLayout';
import ARSceneViewer from '../components/ARSceneViewer';
import aiService from '../services/aiService';
import { useNavigate, useLocation } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

// 创作类型
type CreationType = 'poetry' | 'story' | 'painting';

// 创作主题
interface CreationTheme {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  imageUrl: string;
  icon: React.ReactNode;
}

// 创作主题列表
const creationThemes: CreationTheme[] = [
  {
    id: 'ancient-architecture',
    name: '徽州古建筑',
    description: '徽州古建筑以马头墙、雕梁画栋、天井庭院为特色，体现了徽州人的居住智慧和审美情趣。',
    keywords: ['马头墙', '徽派建筑', '雕梁画栋', '天井', '木雕', '砖雕', '石雕'],
    imageUrl: '/images/huizhou-architecture.jpg',
    icon: <BankOutlined />
  },
  {
    id: 'natural-landscape',
    name: '青龙湾自然风光',
    description: '青龙湾自然风光秀丽，山水相依，四季分明，是徽州山水的典型代表。',
    keywords: ['青山', '绿水', '古树', '云雾', '溪流', '竹林', '梯田'],
    imageUrl: '/images/qinglong-landscape.jpg',
    icon: <EnvironmentOutlined />
  },
  {
    id: 'folk-customs',
    name: '徽州民俗文化',
    description: '徽州民俗文化源远流长，包括婚嫁习俗、节日庆典、传统手工艺等多方面内容。',
    keywords: ['徽州婚俗', '祭祀', '徽剧', '徽菜', '徽墨', '宗祠', '祠堂'],
    imageUrl: '/images/cultural-artifacts.jpg',
    icon: <TeamOutlined />
  }
];

const CreationStudio: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTheme, setSelectedTheme] = useState<CreationTheme | null>(null);
  const [customTheme, setCustomTheme] = useState('');
  const [customKeywords, setCustomKeywords] = useState('');
  const [creationType, setCreationType] = useState<CreationType>('poetry');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedARScene, setSelectedARScene] = useState('huizhou-architecture');

  // 根据当前路径确定激活的标签
  const getActiveTabKey = () => {
    if (location.pathname.includes('/image')) return 'image';
    return 'workshop';
  };

  // 处理标签页切换
  const handleTabChange = (activeKey: string) => {
    if (activeKey === 'image') {
      navigate('/creation/image');
    } else {
      navigate('/creation/workshop');
    }
  };

  // 处理主题选择
  const handleThemeSelect = (theme: CreationTheme | null) => {
    setSelectedTheme(theme);
    if (theme) {
      setCustomTheme(theme.name);
      setCustomKeywords(theme.keywords.join('、'));
    }
  };

  // 处理创作类型选择
  const handleCreationTypeChange = (value: CreationType) => {
    setCreationType(value);
  };

  // 生成AI创作内容
  const generateCreation = async () => {
    if (!customTheme.trim()) {
      alert('请输入创作主题');
      return;
    }

    const keywords = customKeywords.split('、').filter(k => k.trim());
    if (keywords.length === 0) {
      alert('请输入至少一个关键词');
      return;
    }

    try {
      setIsGenerating(true);
      const result = await aiService.generateCreation(
        creationType,
        customTheme.trim(),
        keywords
      );
      setGeneratedContent(result);
    } catch (error) {
      console.error('生成创作内容失败:', error);
      alert('生成创作内容失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Title level={2} style={{ fontWeight: 'bold', color: '#1a237e' }}>
          徽韵创想·云端共鸣
        </Title>
        <Paragraph style={{ color: '#455a64', marginBottom: 24 }}>
          AI赋能的文创工坊，激发您的创作灵感，探索徽州文化的无限可能
        </Paragraph>

        <Tabs 
          activeKey={getActiveTabKey()}
          onChange={handleTabChange}
          type="card"
        >
          <TabPane tab={<span><FormOutlined />AI文创</span>} key="workshop">
            <Row gutter={24}>
              <Col xs={24} md={8}>
                <Card title="创作设置">
                  <Form layout="vertical">
                    <Form.Item label="创作类型">
                      <Select
                        value={creationType}
                        onChange={handleCreationTypeChange}
                        style={{ width: '100%' }}
                      >
                        <Option value="poetry">
                          <Space>
                            <BookOutlined />
                            徽州风格诗词
                          </Space>
                        </Option>
                        <Option value="story">
                          <Space>
                            <HistoryOutlined />
                            徽州故事
                          </Space>
                        </Option>
                        <Option value="painting">
                          <Space>
                            <PictureOutlined />
                            徽派风格图像描述
                          </Space>
                        </Option>
                      </Select>
                    </Form.Item>

                    <Divider>预设主题</Divider>
                    
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {creationThemes.map(theme => (
                        <Card
                          key={theme.id}
                          size="small"
                          hoverable
                          style={{ 
                            marginBottom: 10,
                            border: selectedTheme?.id === theme.id ? '2px solid #1890ff' : undefined 
                          }}
                          onClick={() => handleThemeSelect(theme)}
                        >
                          <div style={{ display: 'flex' }}>
                            <div style={{ 
                              width: 60, 
                              height: 60, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              backgroundColor: '#f0f2f5',
                              borderRadius: 4,
                              marginRight: 10 
                            }}>
                              {theme.icon && React.cloneElement(theme.icon as React.ReactElement, { 
                                style: { fontSize: 32, color: '#1890ff' } 
                              })}
                            </div>
                            <div>
                              <Text strong>{theme.name}</Text>
                              <Paragraph type="secondary" ellipsis={{ rows: 2 }}>
                                {theme.description}
                              </Paragraph>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </Space>

                    <Divider>自定义主题</Divider>
                    
                    <Form.Item label="创作主题">
                      <Input 
                        value={customTheme}
                        onChange={e => setCustomTheme(e.target.value)}
                        placeholder="请输入徽州文化相关主题，如徽派建筑、青龙湾风光、徽州民俗等"
                      />
                    </Form.Item>
                    
                    <Form.Item label="关键词">
                      <Input 
                        value={customKeywords}
                        onChange={e => setCustomKeywords(e.target.value)}
                        placeholder="输入与主题相关的关键词，如马头墙、木雕、水墨等，用顿号、分隔"
                      />
                    </Form.Item>
                    
                    <Button 
                      type="primary" 
                      block 
                      onClick={generateCreation}
                      icon={<EditOutlined />}
                      loading={isGenerating}
                    >
                      生成创作内容
                    </Button>
                  </Form>
                </Card>
              </Col>
              
              <Col xs={24} md={16}>
                <Card title={
                  <div>
                    <Text strong>创作结果</Text>
                    {creationType === 'poetry' && (
                      <Tag color="blue" style={{ marginLeft: 8 }}>徽州风格诗词</Tag>
                    )}
                    {creationType === 'story' && (
                      <Tag color="green" style={{ marginLeft: 8 }}>徽州故事</Tag>
                    )}
                    {creationType === 'painting' && (
                      <Tag color="purple" style={{ marginLeft: 8 }}>徽派风格图像描述</Tag>
                    )}
                    {customTheme && (
                      <Tag color="orange" style={{ marginLeft: 8 }}>{customTheme}</Tag>
                    )}
                  </div>
                }>
                  {isGenerating ? (
                    <div style={{ textAlign: 'center', padding: '30px 0' }}>
                      <Spin size="large" />
                      <div style={{ marginTop: 16 }}>正在创作中，请稍候...</div>
                    </div>
                  ) : generatedContent ? (
                    <div 
                      style={{ 
                        background: '#f9f9f9',
                        padding: 16,
                        borderRadius: 4,
                        border: '1px solid #e8e8e8',
                        fontFamily: creationType === 'poetry' ? 'KaiTi, STKaiti, serif' : 'inherit',
                        lineHeight: 1.8
                      }}
                      dangerouslySetInnerHTML={{ __html: generatedContent }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                      <BookOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                      <div>在左侧选择主题并点击"生成创作内容"，AI将为您创作徽州风格的内容</div>
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>
          
          <TabPane tab={<span><PictureOutlined />图像生成</span>} key="image">
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <img src="/images/artifacts.jpg" alt="徽州工艺品" style={{ maxWidth: '100%', height: 'auto', maxHeight: 300, marginBottom: 24 }} />
              <Title level={4}>AI图像生成功能正在开发中</Title>
              <Paragraph>
                敬请期待！未来您将能够使用此功能生成徽州风格的AI图像。
              </Paragraph>
            </div>
          </TabPane>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default CreationStudio; 