import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  List, 
  Tag, 
  Divider, 
  Space,
  Button,
  Spin,
  Alert,
  Tabs
} from 'antd';
import { 
  UserOutlined, 
  RiseOutlined, 
  FallOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  HeartOutlined,
  StarOutlined,
  DollarOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import MainLayout from '../components/layout/MainLayout';
import {
  visitorCountData,
  visitorTypeDistribution,
  visitorSourceDistribution,
  ageGroupDistribution,
  timeSlotDistribution,
  attractionVisitData,
  consumptionData,
  monthlyTrend,
  satisfactionFactors,
  visitorFeedbackKeywords,
  getVisitorTrend,
  getAttractionRanking,
  getHighestSatisfactionAttractions,
  getLongestStayAttractions,
  generateInsightsReport
} from '../services/analytics';
import aiService from '../services/aiService';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

const VisitorInsights: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // 获取游客数据
  const visitorTrend = getVisitorTrend(30);
  const attractionRanking = getAttractionRanking();
  const topAttractions = attractionRanking.slice(0, 5);
  const highSatisfactionAttractions = getHighestSatisfactionAttractions(3);
  const longStayAttractions = getLongestStayAttractions(3);
  
  // 计算总游客数
  const totalVisitors = visitorTrend.reduce((sum, item) => sum + item.count, 0);
  
  // 计算平均满意度
  const avgSatisfaction = attractionVisitData.reduce((sum, item) => sum + item.satisfaction, 0) / attractionVisitData.length;
  
  // 计算月度趋势
  const currentMonth = new Date().getMonth();
  const prevMonth = currentMonth > 0 ? currentMonth - 1 : 11;
  const currentMonthData = monthlyTrend.data[currentMonth];
  const prevMonthData = monthlyTrend.data[prevMonth];
  const visitorGrowth = ((currentMonthData.visitors - prevMonthData.visitors) / prevMonthData.visitors) * 100;
  const revenueGrowth = ((currentMonthData.revenue - prevMonthData.revenue) / prevMonthData.revenue) * 100;

  // 生成AI分析报告
  const generateAIAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = {
        totalVisitors: currentMonthData.visitors,
        visitorTypes: visitorTypeDistribution.map(item => ({
          type: item.type === 'family' ? '家庭游客' : 
                item.type === 'couple' ? '情侣游客' : 
                item.type === 'individual' ? '个人游客' : 
                item.type === 'group' ? '团体游客' : '商务游客',
          percentage: item.percentage
        })),
        popularAttractions: topAttractions.map(item => ({
          name: item.attractionName,
          visitCount: item.visitCount
        })),
        averageSatisfaction: avgSatisfaction
      };
      
      const insights = await aiService.analyzeVisitorData(data);
      setAiInsights(insights);
    } catch (err) {
      console.error('生成AI分析报告失败:', err);
      setError('生成AI分析报告失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 首次加载时生成AI分析报告
  useEffect(() => {
    generateAIAnalysis();
  }, []);

  return (
    <MainLayout>
      <div style={{ padding: '20px' }}>
        <Title level={2}>游客行为洞察</Title>
        <Paragraph>
          通过数据分析，深入了解游客行为模式，为景区管理和服务优化提供决策支持。
        </Paragraph>
        
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="本月游客总量"
                value={currentMonthData.visitors}
                valueStyle={{ color: visitorGrowth >= 0 ? '#3f8600' : '#cf1322' }}
                prefix={visitorGrowth >= 0 ? <RiseOutlined /> : <FallOutlined />}
                suffix={`${visitorGrowth.toFixed(1)}%`}
              />
              <Text type="secondary">较上月</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="本月营收(元)"
                value={currentMonthData.revenue / 10000}
                precision={2}
                valueStyle={{ color: revenueGrowth >= 0 ? '#3f8600' : '#cf1322' }}
                prefix={revenueGrowth >= 0 ? <RiseOutlined /> : <FallOutlined />}
                suffix={`万 (${revenueGrowth.toFixed(1)}%)`}
              />
              <Text type="secondary">较上月</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="平均满意度"
                value={avgSatisfaction}
                precision={1}
                valueStyle={{ color: '#1890ff' }}
                prefix={<StarOutlined />}
                suffix="/5"
              />
              <Text type="secondary">基于所有景点评价</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="人均消费(元)"
                value={320}
                precision={0}
                valueStyle={{ color: '#1890ff' }}
                prefix={<DollarOutlined />}
              />
              <Text type="secondary">包含门票、餐饮、购物等</Text>
            </Card>
          </Col>
        </Row>
        
        <Divider orientation="left">热门景点排名</Divider>
        
        <Table 
          dataSource={topAttractions}
          rowKey="attractionId"
          pagination={false}
          columns={[
            {
              title: '排名',
              dataIndex: 'attractionId',
              key: 'ranking',
              render: (_, __, index) => index + 1
            },
            {
              title: '景点名称',
              dataIndex: 'attractionName',
              key: 'name'
            },
            {
              title: '访问人次',
              dataIndex: 'visitCount',
              key: 'visits',
              sorter: (a, b) => a.visitCount - b.visitCount,
              render: (visits) => <Text strong>{visits.toLocaleString()}</Text>
            },
            {
              title: '平均停留时间',
              dataIndex: 'averageStayTime',
              key: 'stayTime',
              render: (time) => <><ClockCircleOutlined /> {time}分钟</>
            },
            {
              title: '满意度',
              dataIndex: 'satisfaction',
              key: 'satisfaction',
              render: (rating) => <><StarOutlined /> {rating}/5</>
            },
            {
              title: '高峰时段',
              dataIndex: 'peakHours',
              key: 'peakHours',
              render: (hours) => hours.join(', ')
            }
          ]}
        />
        
        <Divider orientation="left">游客分布</Divider>
        
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title="游客类型分布" bordered={false}>
              <List
                dataSource={visitorTypeDistribution}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<UserOutlined />}
                      title={
                        <Space>
                          {item.type === 'family' && '家庭游客'}
                          {item.type === 'couple' && '情侣游客'}
                          {item.type === 'individual' && '个人游客'}
                          {item.type === 'group' && '团体游客'}
                          {item.type === 'business' && '商务游客'}
                          <Tag color="blue">{item.percentage}%</Tag>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="游客来源分布" bordered={false}>
              <List
                dataSource={visitorSourceDistribution}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<EnvironmentOutlined />}
                      title={
                        <Space>
                          {item.source === 'local' && '本地游客'}
                          {item.source === 'domestic' && '国内游客'}
                          {item.source === 'international' && '国际游客'}
                          <Tag color="green">{item.percentage}%</Tag>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
        
        <Divider orientation="left">AI数据分析</Divider>
        
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={4}>AI洞察报告</Title>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />} 
              onClick={generateAIAnalysis}
              loading={loading}
            >
              重新生成
            </Button>
          </div>
          
          {error && (
            <Alert 
              message="错误" 
              description={error} 
              type="error" 
              showIcon 
              style={{ marginBottom: 16 }} 
            />
          )}
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>正在生成AI分析报告，请稍候...</div>
            </div>
          ) : (
            <div 
              dangerouslySetInnerHTML={{ __html: aiInsights.replace(/\n/g, '<br/>') }} 
              style={{ fontSize: '16px', lineHeight: '1.6' }}
            />
          )}
        </Card>
      </div>
    </MainLayout>
  );
};

export default VisitorInsights; 