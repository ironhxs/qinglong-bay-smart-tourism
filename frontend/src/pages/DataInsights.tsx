import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { Tabs, Card, Typography, Button, Statistic, Row, Col, Table, List, Tag, Divider, Space } from 'antd';
import { 
  LineChartOutlined, 
  PieChartOutlined, 
  BarChartOutlined, 
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

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

// 游客行为洞察组件
const VisitorInsights: React.FC = () => {
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

  return (
    <Card>
      <Title level={4}>游客行为洞察</Title>
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
      
      <Divider orientation="left">游客满意度分析</Divider>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="满意度最高的景点" bordered={false}>
            <List
              dataSource={highSatisfactionAttractions}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <div style={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: '50%', 
                        background: index === 0 ? '#f5222d' : index === 1 ? '#fa8c16' : '#faad14',
                        color: '#fff',
                        textAlign: 'center',
                        lineHeight: '24px'
                      }}>
                        {index + 1}
                      </div>
                    }
                    title={item.attractionName}
                    description={
                      <Space>
                        <StarOutlined style={{ color: '#faad14' }} />
                        <Text strong>{item.satisfaction}</Text>
                        <Text type="secondary">分 (满分5分)</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="停留时间最长的景点" bordered={false}>
            <List
              dataSource={longStayAttractions}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <div style={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: '50%', 
                        background: index === 0 ? '#722ed1' : index === 1 ? '#2f54eb' : '#1890ff',
                        color: '#fff',
                        textAlign: 'center',
                        lineHeight: '24px'
                      }}>
                        {index + 1}
                      </div>
                    }
                    title={item.attractionName}
                    description={
                      <Space>
                        <ClockCircleOutlined style={{ color: '#1890ff' }} />
                        <Text strong>{item.averageStayTime}</Text>
                        <Text type="secondary">分钟</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
      
      <Divider orientation="left">消费行为分析</Divider>
      
      <Card bordered={false}>
        <Table
          dataSource={consumptionData}
          rowKey="category"
          pagination={false}
          columns={[
            {
              title: '消费类别',
              dataIndex: 'category',
              key: 'category'
            },
            {
              title: '消费金额(元)',
              dataIndex: 'amount',
              key: 'amount',
              render: (amount) => amount.toLocaleString()
            },
            {
              title: '占比',
              dataIndex: 'percentage',
              key: 'percentage',
              render: (percentage) => `${percentage}%`
            },
            {
              title: '比例',
              dataIndex: 'percentage',
              key: 'bar',
              render: (percentage) => (
                <div style={{ width: '100%', background: '#f0f0f0', height: 20, borderRadius: 10 }}>
                  <div 
                    style={{ 
                      width: `${percentage}%`, 
                      background: '#1890ff', 
                      height: '100%', 
                      borderRadius: 10 
                    }} 
                  />
                </div>
              )
            }
          ]}
        />
      </Card>
    </Card>
  );
};

// 运营决策组件
const OperationalDecisions: React.FC = () => {
  // 获取洞察报告
  const [insightsReport, setInsightsReport] = useState<string>('');
  
  useEffect(() => {
    // 生成报告
    const report = generateInsightsReport();
    setInsightsReport(report);
  }, []);

  return (
    <Card>
      <Title level={4}>数据驱动决策</Title>
      <Paragraph>
        基于游客行为数据和满意度反馈，为景区运营管理提供数据驱动的决策建议。
      </Paragraph>
      
      <Card 
        title="青龙湾游客行为洞察报告" 
        bordered={false}
        style={{ marginBottom: 24 }}
      >
        <div 
          style={{ 
            lineHeight: '1.8',
            background: '#f9f9f9',
            padding: 16,
            borderRadius: 8
          }}
          dangerouslySetInnerHTML={{ __html: insightsReport }}
        />
        
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Button type="primary" icon={<DownloadOutlined />}>
            导出完整报告
          </Button>
        </div>
      </Card>
      
      <Divider orientation="left">游客反馈关键词</Divider>
      
      <Card bordered={false}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {visitorFeedbackKeywords.map(keyword => (
            <Tag 
              key={keyword.text} 
              color="blue" 
              style={{ 
                fontSize: 12 + (keyword.value / 20), 
                padding: '6px 10px' 
              }}
            >
              {keyword.text}
            </Tag>
          ))}
        </div>
      </Card>
      
      <Divider orientation="left">满意度因素分析</Divider>
      
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 4 }}
        dataSource={satisfactionFactors}
        renderItem={item => (
          <List.Item>
            <Card>
              <Statistic
                title={item.factor}
                value={item.rating}
                precision={1}
                valueStyle={{ color: item.rating >= 4.5 ? '#3f8600' : item.rating >= 4.0 ? '#1890ff' : '#cf1322' }}
                prefix={<StarOutlined />}
                suffix="/5"
              />
            </Card>
          </List.Item>
        )}
      />
      
      <Divider orientation="left">运营建议</Divider>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card 
            title="客流优化" 
            bordered={false}
            actions={[<Button type="link">查看详情</Button>]}
          >
            <ul>
              <li>在周末高峰期增加景点入口引导人员</li>
              <li>优化青龙湾码头和美食街的游客动线</li>
              <li>开发手机App实时显示各景点拥挤度</li>
            </ul>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card 
            title="产品优化" 
            bordered={false}
            actions={[<Button type="link">查看详情</Button>]}
          >
            <ul>
              <li>增加19-30岁年龄段喜爱的互动体验项目</li>
              <li>开发更多结合徽州文化的特色文创产品</li>
              <li>提升非遗展示中心的互动性和参与度</li>
            </ul>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card 
            title="服务优化" 
            bordered={false}
            actions={[<Button type="link">查看详情</Button>]}
          >
            <ul>
              <li>加强景区标识系统建设，优化导览信息</li>
              <li>提升餐饮服务质量，增加徽菜特色菜品</li>
              <li>增设休息区和饮水点，提升游客舒适度</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

// 主页面组件
const DataInsights: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 根据当前路径确定激活的标签页
  const getActiveTabKey = () => {
    const path = location.pathname;
    if (path.includes('/visitor')) return 'visitor';
    if (path.includes('/operation')) return 'operation';
    return 'visitor'; // 默认标签页
  };
  
  const handleTabChange = (key: string) => {
    navigate(`/insights/${key}`);
  };
  
  return (
    <MainLayout title="数据慧脑·运营智擎">
      <Tabs 
        activeKey={getActiveTabKey()}
        onChange={handleTabChange}
        style={{ marginBottom: 16 }}
      >
        <TabPane tab={<span><LineChartOutlined />游客行为洞察</span>} key="visitor" />
        <TabPane tab={<span><PieChartOutlined />运营决策优化</span>} key="operation" />
      </Tabs>
      
      <Routes>
        <Route path="/" element={<Navigate to="visitor" replace />} />
        <Route path="visitor" element={<VisitorInsights />} />
        <Route path="operation" element={<OperationalDecisions />} />
      </Routes>
    </MainLayout>
  );
};

export default DataInsights; 