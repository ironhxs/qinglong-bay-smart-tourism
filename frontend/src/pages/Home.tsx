import React from 'react';
import { Typography, Button, Card, Row, Col, Divider } from 'antd';
import { Link } from 'react-router-dom';
import { 
  AudioOutlined, 
  EnvironmentOutlined, 
  CompassOutlined, 
  EditOutlined, 
  LineChartOutlined, 
  TeamOutlined,
  BookOutlined,
  PictureOutlined, 
  SafetyOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import MainLayout from '../components/layout/MainLayout';

const { Title, Paragraph, Text } = Typography;

const Home: React.FC = () => {
  return (
    <MainLayout>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Title level={1} style={{ color: '#1a237e' }}>青龙湾生态智能系统</Title>
          <Paragraph style={{ fontSize: 18, color: '#455a64' }}>
            智慧旅游 · 文化传承 · 生态保护
          </Paragraph>
        </div>
        
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Card
              hoverable
              style={{ height: '100%' }}
              cover={
                <div style={{ 
                  height: 200, 
                  background: 'linear-gradient(135deg, #1a237e 0%, #4fc3f7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AudioOutlined style={{ fontSize: 64, color: 'white' }} />
                </div>
              }
            >
              <Title level={4}>徽脉智语·沉浸漫游</Title>
              <Paragraph>
                通过AI语音导览、AR文化重现和虚拟角色互动，带您身临其境体验徽州文化。
              </Paragraph>
              <Link to="/immersive">
                <Button type="primary">立即体验</Button>
              </Link>
            </Card>
          </Col>
          
          <Col xs={24} md={8}>
            <Card
              hoverable
              style={{ height: '100%' }}
              cover={
                <div style={{ 
                  height: 200, 
                  background: 'linear-gradient(135deg, #00695c 0%, #4db6ac 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <SafetyOutlined style={{ fontSize: 64, color: 'white' }} />
                </div>
              }
            >
              <Title level={4}>众守青灵·生态共生</Title>
              <Paragraph>
                探索青龙湾独特的生态系统，了解环保措施和参与生态保护行动。
              </Paragraph>
              <Link to="/ecosystem">
                <Button type="primary" style={{ background: '#00695c', borderColor: '#00695c' }}>
                  探索生态
                </Button>
              </Link>
            </Card>
          </Col>
          
          <Col xs={24} md={8}>
            <Card
              hoverable
              style={{ height: '100%' }}
              cover={
                <div style={{ 
                  height: 200, 
                  background: 'linear-gradient(135deg, #f57f17 0%, #ffb74d 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CompassOutlined style={{ fontSize: 64, color: 'white' }} />
                </div>
              }
            >
              <Title level={4}>智策游程·随心所"驭"</Title>
              <Paragraph>
                AI智能行程规划，根据您的兴趣偏好定制专属徽州旅行体验。
              </Paragraph>
              <Link to="/itinerary">
                <Button type="primary" style={{ background: '#f57f17', borderColor: '#f57f17' }}>
                  规划行程
                </Button>
              </Link>
            </Card>
          </Col>
        </Row>
        
        <Divider style={{ margin: '48px 0' }} />
        
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Card
              hoverable
              style={{ height: '100%' }}
              cover={
                <div style={{ 
                  height: 200, 
                  background: 'linear-gradient(135deg, #c2185b 0%, #f48fb1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <BookOutlined style={{ fontSize: 64, color: 'white' }} />
                </div>
              }
            >
              <Title level={4}>徽韵创想·云端共鸣</Title>
              <Paragraph>
                AI文创工坊，激发灵感创作徽州风格诗词、故事和图像。
              </Paragraph>
              <Link to="/creation">
                <Button type="primary" style={{ background: '#c2185b', borderColor: '#c2185b' }}>
                  开始创作
                </Button>
              </Link>
            </Card>
          </Col>
          
          <Col xs={24} md={8}>
            <Card
              hoverable
              style={{ height: '100%' }}
              cover={
                <div style={{ 
                  height: 200, 
                  background: 'linear-gradient(135deg, #0d47a1 0%, #64b5f6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <LineChartOutlined style={{ fontSize: 64, color: 'white' }} />
                </div>
              }
            >
              <Title level={4}>数据慧脑·运营智擎</Title>
              <Paragraph>
                游客行为分析和智能运营决策，提升景区管理效率。
              </Paragraph>
              <Link to="/insights">
                <Button type="primary" style={{ background: '#0d47a1', borderColor: '#0d47a1' }}>
                  查看数据
                </Button>
              </Link>
            </Card>
          </Col>
          
          <Col xs={24} md={8}>
            <Card
              hoverable
              style={{ height: '100%' }}
              cover={
                <div style={{ 
                  height: 200, 
                  background: 'linear-gradient(135deg, #4a148c 0%, #9c27b0 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <TeamOutlined style={{ fontSize: 64, color: 'white' }} />
                </div>
              }
            >
              <Title level={4}>徽友圈</Title>
              <Paragraph>
                分享您的徽州之旅，与其他游客交流互动，留下美好记忆。
              </Paragraph>
              <Link to="/community">
                <Button type="primary" style={{ background: '#4a148c', borderColor: '#4a148c' }}>
                  进入社区
                </Button>
              </Link>
            </Card>
          </Col>
        </Row>
      </div>
    </MainLayout>
  );
};

export default Home; 