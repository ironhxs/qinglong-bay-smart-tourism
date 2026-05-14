import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Tabs, Card, Typography, Button, Row, Col, List, Tag, Divider, Space, Statistic, Badge, Avatar, Empty } from 'antd';
import { 
  LineChartOutlined, 
  EnvironmentOutlined, 
  TeamOutlined, 
  HeartOutlined,
  CalendarOutlined,
  MailOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import MainLayout from '../components/layout/MainLayout';
import {
  EnvironmentalData,
  Species,
  ConservationAction,
  EnvironmentalEvent,
  generateHourlyEnvironmentalData,
  speciesData,
  conservationActions,
  environmentalEvents,
  getLatestEnvironmentalData,
  getAirQualityDescription,
  getWaterQualityDescription,
  getBiodiversityStatusDescription,
  getWeatherDescription,
  getEnvironmentalSummary
} from '../services/ecosystem';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

// 环境数据可视化组件
const EnvironmentDataVisualization: React.FC = () => {
  const [hourlyData, setHourlyData] = useState<EnvironmentalData[]>([]);
  const [latestData, setLatestData] = useState<EnvironmentalData | null>(null);
  
  useEffect(() => {
    // 获取环境数据
    const data = generateHourlyEnvironmentalData();
    setHourlyData(data);
    setLatestData(data[data.length - 1]);
  }, []);
  
  // 获取空气质量等级颜色
  const getAirQualityColor = (level: string): string => {
    switch (level) {
      case 'excellent': return '#52c41a';
      case 'good': return '#95de64';
      case 'moderate': return '#faad14';
      case 'poor': return '#fa8c16';
      case 'very_poor': return '#f5222d';
      case 'hazardous': return '#cf1322';
      default: return '#d9d9d9';
    }
  };
  
  // 获取水质等级颜色
  const getWaterQualityColor = (level: string): string => {
    switch (level) {
      case 'excellent': return '#1890ff';
      case 'good': return '#69c0ff';
      case 'moderate': return '#faad14';
      case 'poor': return '#fa8c16';
      case 'very_poor': return '#f5222d';
      default: return '#d9d9d9';
    }
  };
  
  // 获取生物多样性状态颜色
  const getBiodiversityColor = (index: number): string => {
    if (index >= 90) return '#52c41a';
    if (index >= 80) return '#95de64';
    if (index >= 70) return '#faad14';
    if (index >= 60) return '#fa8c16';
    return '#f5222d';
  };

  return (
    <Card>
      <Title level={4}>环境数据可视化</Title>
      <Paragraph>
        实时监测青龙湾生态环境数据，直观展示环境变化趋势，助力生态保护决策。
      </Paragraph>
      
      {latestData ? (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card 
                title={
                  <Space>
                    <Badge color={getAirQualityColor(latestData.airQuality.level)} />
                    空气质量
                  </Space>
                } 
                bordered={false}
              >
                <Statistic 
                  title="AQI指数" 
                  value={latestData.airQuality.aqi} 
                  valueStyle={{ 
                    color: getAirQualityColor(latestData.airQuality.level) 
                  }}
                />
                <Paragraph>{getAirQualityDescription(latestData.airQuality.level)}</Paragraph>
                <div>
                  <Text type="secondary">PM2.5: {latestData.airQuality.pm25.toFixed(1)} μg/m³</Text>
                  <br />
                  <Text type="secondary">PM10: {latestData.airQuality.pm10.toFixed(1)} μg/m³</Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card 
                title={
                  <Space>
                    <Badge color={getWaterQualityColor(latestData.waterQuality.level)} />
                    水质状况
                  </Space>
                } 
                bordered={false}
              >
                <Statistic 
                  title="pH值" 
                  value={latestData.waterQuality.ph.toFixed(1)} 
                  valueStyle={{ 
                    color: getWaterQualityColor(latestData.waterQuality.level) 
                  }}
                />
                <Paragraph>{getWaterQualityDescription(latestData.waterQuality.level)}</Paragraph>
                <div>
                  <Text type="secondary">溶解氧: {latestData.waterQuality.dissolvedOxygen.toFixed(1)} mg/L</Text>
                  <br />
                  <Text type="secondary">水温: {latestData.waterQuality.temperature.toFixed(1)} °C</Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card 
                title={
                  <Space>
                    <Badge color={getBiodiversityColor(latestData.biodiversity.conservationIndex)} />
                    生物多样性
                  </Space>
                } 
                bordered={false}
              >
                <Statistic 
                  title="保护指数" 
                  value={latestData.biodiversity.conservationIndex} 
                  valueStyle={{ 
                    color: getBiodiversityColor(latestData.biodiversity.conservationIndex) 
                  }}
                  suffix="/100"
                />
                <Paragraph>{getBiodiversityStatusDescription(latestData.biodiversity.conservationIndex)}</Paragraph>
                <div>
                  <Text type="secondary">植物种类: {latestData.biodiversity.floraSpecies} 种</Text>
                  <br />
                  <Text type="secondary">动物种类: {latestData.biodiversity.faunaSpecies} 种</Text>
                </div>
              </Card>
            </Col>
          </Row>
          
          <Card 
            title="天气状况" 
            bordered={false}
            style={{ marginTop: 16 }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={6}>
                <Statistic 
                  title="温度" 
                  value={latestData.weather.temperature.toFixed(1)} 
                  suffix="°C" 
                />
              </Col>
              <Col xs={24} md={6}>
                <Statistic 
                  title="湿度" 
                  value={latestData.weather.humidity.toFixed(0)} 
                  suffix="%" 
                />
              </Col>
              <Col xs={24} md={6}>
                <Statistic 
                  title="风速" 
                  value={latestData.weather.windSpeed.toFixed(1)} 
                  suffix={`km/h (${latestData.weather.windDirection})`} 
                />
              </Col>
              <Col xs={24} md={6}>
                <Statistic 
                  title="紫外线指数" 
                  value={latestData.weather.uvIndex} 
                  valueStyle={{ 
                    color: latestData.weather.uvIndex > 7 ? '#f5222d' : 
                           latestData.weather.uvIndex > 5 ? '#fa8c16' : 
                           latestData.weather.uvIndex > 2 ? '#faad14' : '#52c41a' 
                  }}
                />
              </Col>
            </Row>
          </Card>
          
          <Divider orientation="left">青龙湾特色物种</Divider>
          
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
            dataSource={speciesData}
            renderItem={item => (
              <List.Item>
                <Card
                  hoverable
                  cover={
                    <img 
                      alt={item.name} 
                      src={item.imageUrl} 
                      style={{ height: 200, objectFit: 'cover' }}
                    />
                  }
                >
                  <Card.Meta 
                    title={
                      <Space>
                        {item.name}
                        <Tag 
                          color={
                            item.conservationStatus === 'critically_endangered' ? '#cf1322' :
                            item.conservationStatus === 'endangered' ? '#f5222d' :
                            item.conservationStatus === 'vulnerable' ? '#fa8c16' :
                            item.conservationStatus === 'near_threatened' ? '#faad14' : '#52c41a'
                          }
                        >
                          {item.conservationStatus === 'critically_endangered' && '极危'}
                          {item.conservationStatus === 'endangered' && '濒危'}
                          {item.conservationStatus === 'vulnerable' && '易危'}
                          {item.conservationStatus === 'near_threatened' && '近危'}
                          {item.conservationStatus === 'least_concern' && '无忧'}
                        </Tag>
                      </Space>
                    }
                    description={
                      <>
                        <Text type="secondary" italic>{item.scientificName}</Text>
                        <Paragraph ellipsis={{ rows: 2 }} style={{ marginTop: 8 }}>
                          {item.description}
                        </Paragraph>
                        <Text type="secondary">栖息地: {item.habitat}</Text>
                      </>
                    }
                  />
                </Card>
              </List.Item>
            )}
          />
          
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Button type="primary">查看更多物种信息</Button>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Empty description="正在加载环境数据..." />
        </div>
      )}
    </Card>
  );
};

// 生态保护行动组件
const ConservationActions: React.FC = () => {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  
  return (
    <Card>
      <Title level={4}>生态保护行动</Title>
      <Paragraph>
        参与青龙湾生态保护行动，共同守护这片美丽的自然生态系统。
      </Paragraph>
      
      <List
        itemLayout="vertical"
        size="large"
        dataSource={conservationActions}
        renderItem={item => (
          <Card 
            style={{ marginBottom: 16 }}
            hoverable
            onClick={() => setSelectedAction(item.id === selectedAction ? null : item.id)}
          >
            <List.Item
              key={item.id}
              extra={
                <img
                  width={272}
                  alt={item.title}
                  src={item.imageUrl}
                  style={{ height: 153, objectFit: 'cover' }}
                />
              }
            >
              <List.Item.Meta
                title={<Text strong>{item.title}</Text>}
                description={
                  <Space>
                    <Tag color="blue">{
                      item.category === 'habitat_protection' ? '栖息地保护' :
                      item.category === 'species_conservation' ? '物种保护' :
                      item.category === 'pollution_control' ? '污染控制' :
                      item.category === 'education' ? '环保教育' : '可持续发展'
                    }</Tag>
                    <Tag color="green">
                      {item.difficulty === 'easy' ? '简单' : 
                       item.difficulty === 'moderate' ? '适中' : '挑战性'}
                    </Tag>
                    <Tag color="orange">
                      影响力: {item.impact === 'low' ? '低' : 
                              item.impact === 'medium' ? '中' : '高'}
                    </Tag>
                  </Space>
                }
              />
              <Paragraph>{item.description}</Paragraph>
              <Row>
                <Col xs={24} md={8}>
                  <Text type="secondary"><TeamOutlined /> 参与人数: {item.participants}人</Text>
                </Col>
                <Col xs={24} md={8}>
                  <Text type="secondary"><ClockCircleOutlined /> 持续时间: {item.duration}</Text>
                </Col>
                <Col xs={24} md={8}>
                  <Text type="secondary"><EnvironmentOutlined /> 地点: {item.location}</Text>
                </Col>
              </Row>
              
              {selectedAction === item.id && (
                <div style={{ marginTop: 16 }}>
                  <Divider style={{ margin: '12px 0' }} />
                  <Paragraph>
                    <Text strong>联系方式:</Text> {item.contactInfo}
                  </Paragraph>
                  <Button type="primary" icon={<HeartOutlined />}>
                    我要参与
                  </Button>
                </div>
              )}
            </List.Item>
          </Card>
        )}
      />
      
      <Divider orientation="left">环保活动日历</Divider>
      
      <List
        itemLayout="horizontal"
        dataSource={environmentalEvents}
        renderItem={item => (
          <List.Item
            actions={[
              <Button type="link" icon={<MailOutlined />} href={`mailto:${item.contactEmail}`}>
                联系
              </Button>,
              item.registrationUrl && (
                <Button type="link" icon={<LinkOutlined />} href={item.registrationUrl} target="_blank">
                  报名
                </Button>
              )
            ]}
          >
            <List.Item.Meta
              avatar={
                <Avatar 
                  style={{ 
                    backgroundColor: 
                      item.type === 'cleanup' ? '#1890ff' :
                      item.type === 'education' ? '#52c41a' :
                      item.type === 'planting' ? '#722ed1' :
                      item.type === 'monitoring' ? '#fa8c16' : '#2f54eb'
                  }}
                  icon={
                    item.type === 'cleanup' ? <CheckCircleOutlined /> :
                    item.type === 'education' ? <ExclamationCircleOutlined /> :
                    item.type === 'planting' ? <HeartOutlined /> :
                    item.type === 'monitoring' ? <LineChartOutlined /> : <CloseCircleOutlined />
                  }
                />
              }
              title={<Text strong>{item.title}</Text>}
              description={
                <Space>
                  <CalendarOutlined /> {item.date}
                  <EnvironmentOutlined /> {item.location}
                  <Tag color="blue">{
                    item.type === 'cleanup' ? '清洁行动' :
                    item.type === 'education' ? '环保教育' :
                    item.type === 'planting' ? '植树活动' :
                    item.type === 'monitoring' ? '环境监测' : '工作坊'
                  }</Tag>
                </Space>
              }
            />
            <div>{item.description}</div>
          </List.Item>
        )}
      />
    </Card>
  );
};

// 主页面组件
const EcosystemProtection: React.FC = () => {
  const navigate = useNavigate();
  
  const handleTabChange = (key: string) => {
    navigate(`/ecosystem/${key}`);
  };
  
  return (
    <MainLayout title="众守青灵·生态共生">
      <Routes>
        <Route path="/" element={<Navigate to="/ecosystem/data" replace />} />
        <Route path="/data" element={<EnvironmentDataVisualization />} />
        <Route path="/actions" element={<ConservationActions />} />
      </Routes>
      
      <Tabs 
        defaultActiveKey="data" 
        onChange={handleTabChange}
        style={{ marginTop: 16 }}
      >
        <TabPane tab={<span><LineChartOutlined />环境数据可视化</span>} key="data" />
        <TabPane tab={<span><HeartOutlined />生态保护行动</span>} key="actions" />
      </Tabs>
    </MainLayout>
  );
};

export default EcosystemProtection; 