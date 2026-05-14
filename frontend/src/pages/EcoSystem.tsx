import React, { useState } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { Tabs, Card, Typography, Button, Row, Col, Statistic, Progress, List, Tag, Divider } from 'antd';
import { 
  AreaChartOutlined, 
  BarChartOutlined, 
  LineChartOutlined, 
  PieChartOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import MainLayout from '../components/layout/MainLayout';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

// 模拟环境数据
const environmentalData = {
  airQuality: { value: 85, status: 'good' },
  waterQuality: { value: 92, status: 'excellent' },
  biodiversity: { value: 78, status: 'moderate' },
  noise: 45,
  temperature: { value: 24, unit: '°C' },
  humidity: { value: 65, unit: '%' },
  rainfall: { value: 120, unit: 'mm' },
};

// 模拟生态保护活动
const ecoActivities = [
  { 
    id: 1, 
    title: '青龙湾植树活动', 
    date: '2023-04-22', 
    location: '青龙湾东岸',
    status: 'upcoming',
    participants: 45,
    description: '在青龙湾东岸种植本地树种，增加生物多样性，改善生态环境。'
  },
  { 
    id: 2, 
    title: '水质监测志愿者行动', 
    date: '2023-05-15', 
    location: '青龙湾水域',
    status: 'ongoing',
    participants: 30,
    description: '定期监测青龙湾水质，收集数据并提交环保部门，保护水域生态。'
  },
  { 
    id: 3, 
    title: '垃圾分类宣传活动', 
    date: '2023-06-05', 
    location: '青龙湾游客中心',
    status: 'completed',
    participants: 120,
    description: '向游客宣传垃圾分类知识，发放环保手册，减少环境污染。'
  },
  { 
    id: 4, 
    title: '野生动物保护讲座', 
    date: '2023-07-10', 
    location: '青龙湾文化中心',
    status: 'upcoming',
    participants: 80,
    description: '邀请生态学专家讲解青龙湾野生动物保护知识，提高公众保护意识。'
  },
];

// 环境数据可视化组件
const EnvDataViz: React.FC = () => {
  return (
    <Card>
      <Title level={4}>环境数据可视化</Title>
      <Paragraph>
        实时监测青龙湾生态环境数据，包括空气质量、水质、生物多样性等指标。
      </Paragraph>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic 
              title="空气质量指数" 
              value={environmentalData.airQuality.value} 
              suffix="/100"
              valueStyle={{ color: '#3f8600' }}
            />
            <Progress 
              percent={environmentalData.airQuality.value} 
              status="active" 
              strokeColor={{ 
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
            <Text type="secondary">状态: 优</Text>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic 
              title="水质指数" 
              value={environmentalData.waterQuality.value} 
              suffix="/100"
              valueStyle={{ color: '#3f8600' }}
            />
            <Progress 
              percent={environmentalData.waterQuality.value} 
              status="active" 
              strokeColor={{ 
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
            <Text type="secondary">状态: 优良</Text>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic 
              title="生物多样性指数" 
              value={environmentalData.biodiversity.value} 
              suffix="/100"
              valueStyle={{ color: '#faad14' }}
            />
            <Progress 
              percent={environmentalData.biodiversity.value} 
              status="active" 
              strokeColor={{ 
                '0%': '#faad14',
                '100%': '#87d068',
              }}
            />
            <Text type="secondary">状态: 中等</Text>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic 
              title="噪音水平" 
              value={environmentalData.noise} 
              suffix="dB"
              valueStyle={{ color: '#52c41a' }}
            />
            <Progress 
              percent={environmentalData.noise / 1.2} 
              status="active" 
              strokeColor={{ 
                '0%': '#87d068',
                '100%': '#ff4d4f',
              }}
            />
            <Text type="secondary">状态: 低</Text>
          </Card>
        </Col>
      </Row>
      
      <Divider />
      
      <Title level={5}>气象数据</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic 
              title="温度" 
              value={environmentalData.temperature.value} 
              suffix={environmentalData.temperature.unit}
              prefix={<AreaChartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic 
              title="湿度" 
              value={environmentalData.humidity.value} 
              suffix={environmentalData.humidity.unit}
              prefix={<LineChartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic 
              title="年降雨量" 
              value={environmentalData.rainfall.value} 
              suffix={environmentalData.rainfall.unit}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
      </Row>
      
      <Divider />
      
      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <Button type="primary" icon={<PieChartOutlined />}>查看详细数据报告</Button>
      </div>
    </Card>
  );
};

// 生态保护行动组件
const EcoProtection: React.FC = () => {
  const getStatusTag = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Tag color="blue" icon={<ClockCircleOutlined />}>即将开始</Tag>;
      case 'ongoing':
        return <Tag color="green" icon={<EnvironmentOutlined />}>进行中</Tag>;
      case 'completed':
        return <Tag color="gray" icon={<CheckCircleOutlined />}>已完成</Tag>;
      default:
        return null;
    }
  };
  
  return (
    <Card>
      <Title level={4}>生态保护行动指引</Title>
      <Paragraph>
        参与青龙湾生态保护活动，共同守护美丽家园。您可以查看近期活动并报名参加。
      </Paragraph>
      
      <List
        itemLayout="vertical"
        dataSource={ecoActivities}
        renderItem={item => (
          <List.Item
            key={item.id}
            actions={[
              <span>地点: {item.location}</span>,
              <span>日期: {item.date}</span>,
              <span>参与人数: {item.participants}</span>
            ]}
            extra={
              <Button type="primary">
                {item.status === 'completed' ? '查看回顾' : '立即报名'}
              </Button>
            }
          >
            <List.Item.Meta
              title={
                <div>
                  {item.title} {getStatusTag(item.status)}
                </div>
              }
              description={item.description}
            />
          </List.Item>
        )}
      />
      
      <Divider />
      
      <Title level={5}>个人生态贡献</Title>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card>
            <Statistic title="参与活动" value={2} suffix="次" />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="减少碳排放" value={45.2} suffix="kg" />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="环保积分" value={120} suffix="分" />
          </Card>
        </Col>
      </Row>
      
      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <Button type="primary">查看更多活动</Button>
      </div>
    </Card>
  );
};

// 主页面组件
const EcoSystem: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 根据当前路径确定激活的标签页
  const getActiveTabKey = () => {
    const path = location.pathname;
    if (path.includes('/data')) return 'data';
    if (path.includes('/protection')) return 'protection';
    return 'data'; // 默认标签页
  };
  
  const handleTabChange = (key: string) => {
    navigate(`/ecosystem/${key}`);
  };
  
  return (
    <MainLayout title="众守青灵·生态共生">
      <Tabs 
        activeKey={getActiveTabKey()}
        onChange={handleTabChange}
        style={{ marginBottom: 16 }}
      >
        <TabPane tab={<span><AreaChartOutlined />环境数据可视化</span>} key="data" />
        <TabPane tab={<span><EnvironmentOutlined />生态保护行动</span>} key="protection" />
      </Tabs>
      
      <Routes>
        <Route path="/" element={<Navigate to="data" replace />} />
        <Route path="data" element={<EnvDataViz />} />
        <Route path="protection" element={<EcoProtection />} />
      </Routes>
    </MainLayout>
  );
};

export default EcoSystem; 