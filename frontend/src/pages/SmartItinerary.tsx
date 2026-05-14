import React, { useState } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { Tabs, Card, Typography, Button, Form, Input, Select, Switch, Slider, List, Tag, Timeline, Divider, Row, Col, Space, Empty } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, ClockCircleOutlined, SearchOutlined, TeamOutlined, HeartOutlined } from '@ant-design/icons';
import MainLayout from '../components/layout/MainLayout';
import { 
  UserPreference, 
  generateItinerary, 
  Itinerary, 
  ItineraryItem,
  findAttractionsByKeywords,
  findAttractionGroupsByTags,
  Attraction,
  AttractionGroup,
  attractions
} from '../services/itinerary';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// 智能行程规划组件
const ItineraryPlanner: React.FC = () => {
  const [form] = Form.useForm();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(false);

  // 生成行程
  const handleGenerateItinerary = (values: UserPreference) => {
    setLoading(true);
    
    // 模拟API调用延迟
    setTimeout(() => {
      const generatedItinerary = generateItinerary(values);
      setItinerary(generatedItinerary);
      setLoading(false);
    }, 1500);
  };

  return (
    <Card>
      <Title level={4}>AI智能行程规划</Title>
      <Paragraph>
        根据您的偏好和需求，AI将为您量身定制最佳青龙湾游览路线。
      </Paragraph>
      
      <Row gutter={24}>
        <Col xs={24} lg={12}>
          <Card title="您的偏好设置" bordered={false}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleGenerateItinerary}
              initialValues={{
                duration: 4,
                startTime: '09:00',
                interests: ['文化', '历史'],
                avoidCrowds: true,
                includeFood: true,
                pace: 'moderate',
                transportMode: 'walking'
              }}
            >
              <Form.Item
                name="duration"
                label="游览时长（小时）"
                rules={[{ required: true, message: '请选择游览时长' }]}
              >
                <Slider min={1} max={8} marks={{ 1: '1h', 4: '4h', 8: '8h' }} />
              </Form.Item>
              
              <Form.Item
                name="startTime"
                label="开始时间"
                rules={[{ required: true, message: '请选择开始时间' }]}
              >
                <Select>
                  <Option value="08:00">08:00</Option>
                  <Option value="09:00">09:00</Option>
                  <Option value="10:00">10:00</Option>
                  <Option value="11:00">11:00</Option>
                  <Option value="13:00">13:00</Option>
                  <Option value="14:00">14:00</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="interests"
                label="兴趣偏好"
                rules={[{ required: true, message: '请选择至少一个兴趣' }]}
              >
                <Select mode="multiple" placeholder="选择您的兴趣">
                  <Option value="文化">文化</Option>
                  <Option value="历史">历史</Option>
                  <Option value="自然">自然</Option>
                  <Option value="摄影">摄影</Option>
                  <Option value="美食">美食</Option>
                  <Option value="建筑">建筑</Option>
                  <Option value="非遗">非遗</Option>
                  <Option value="体验">体验</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="avoidCrowds"
                valuePropName="checked"
                label="避开人群"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item
                name="includeFood"
                valuePropName="checked"
                label="包含美食体验"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item
                name="pace"
                label="游览节奏"
                rules={[{ required: true, message: '请选择游览节奏' }]}
              >
                <Select>
                  <Option value="relaxed">轻松悠闲</Option>
                  <Option value="moderate">适中平衡</Option>
                  <Option value="intensive">紧凑高效</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="transportMode"
                label="交通方式"
                rules={[{ required: true, message: '请选择交通方式' }]}
              >
                <Select>
                  <Option value="walking">步行</Option>
                  <Option value="cycling">骑行</Option>
                  <Option value="driving">驾车</Option>
                </Select>
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block>
                  生成智能行程
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          {itinerary ? (
            <Card 
              title={
                <div>
                  <CalendarOutlined /> {itinerary.name}
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    {itinerary.date}
                  </Text>
                </div>
              } 
              bordered={false}
            >
              <Paragraph>
                <Space>
                  <Text><ClockCircleOutlined /> 总时长: {Math.floor(itinerary.totalDuration / 60)}小时{itinerary.totalDuration % 60}分钟</Text>
                  <Text><EnvironmentOutlined /> 总距离: {itinerary.distance}公里</Text>
                </Space>
              </Paragraph>
              
              <Divider style={{ margin: '12px 0' }} />
              
              <Timeline>
                {itinerary.items.map((item, index) => (
                  <Timeline.Item key={index} color={index % 2 === 0 ? 'blue' : 'green'}>
                    <Text strong>{item.time}</Text> {item.activity}
                    <Card size="small" style={{ marginTop: 8, marginBottom: 16 }}>
                      <div style={{ display: 'flex' }}>
                        <img 
                          src={item.attraction.image} 
                          alt={item.attraction.name} 
                          style={{ width: 80, height: 60, objectFit: 'cover', marginRight: 12, borderRadius: 4 }}
                        />
                        <div>
                          <Text strong>{item.attraction.name}</Text>
                          <br />
                          <Text type="secondary">停留: {item.duration}分钟</Text>
                          <div style={{ marginTop: 4 }}>
                            {item.attraction.tags.slice(0, 2).map(tag => (
                              <Tag key={tag} color="blue">{tag}</Tag>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Timeline.Item>
                ))}
              </Timeline>
              
              <Divider style={{ margin: '12px 0' }} />
              
              <Button type="primary" block>
                保存此行程
              </Button>
            </Card>
          ) : (
            <Card bordered={false} style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="请在左侧设置您的偏好，生成专属行程"
              />
            </Card>
          )}
        </Col>
      </Row>
    </Card>
  );
};

// 一键寻徽组件
const QuickSearch: React.FC = () => {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<Attraction[]>([]);
  const [recommendedGroups, setRecommendedGroups] = useState<AttractionGroup[]>([]);
  const [loading, setLoading] = useState(false);

  // 搜索景点
  const handleSearch = (value: string) => {
    if (!value.trim()) {
      setKeywords([]);
      setSearchResults([]);
      return;
    }
    
    setLoading(true);
    
    // 分割关键词
    const keywordArray = value.split(/[,，、\s]+/).filter(k => k.trim());
    setKeywords(keywordArray);
    
    // 搜索景点
    setTimeout(() => {
      const results = findAttractionsByKeywords(keywordArray);
      setSearchResults(results);
      
      // 根据关键词查找推荐组合
      const groups = findAttractionGroupsByTags(keywordArray);
      setRecommendedGroups(groups);
      
      setLoading(false);
    }, 800);
  };

  // 热门搜索关键词
  const popularKeywords = ['文化', '历史', '自然', '美食', '亲子', '摄影', '非遗'];

  return (
    <Card>
      <Title level={4}>一键寻"徽"</Title>
      <Paragraph>
        输入您感兴趣的关键词，快速找到符合需求的景点和推荐路线。
      </Paragraph>
      
      <Input.Search
        placeholder="输入关键词，如：历史、文化、自然、美食..."
        enterButton={<><SearchOutlined /> 寻徽</>}
        size="large"
        onSearch={handleSearch}
        loading={loading}
        style={{ marginBottom: 16 }}
      />
      
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">热门搜索：</Text>
        {popularKeywords.map(keyword => (
          <Tag 
            key={keyword} 
            color="blue" 
            style={{ cursor: 'pointer', margin: '4px' }}
            onClick={() => handleSearch(keyword)}
          >
            {keyword}
          </Tag>
        ))}
      </div>
      
      <Divider />
      
      {keywords.length > 0 && (
        <>
          <Title level={5}>搜索结果</Title>
          
          {searchResults.length > 0 ? (
            <>
              <Paragraph>
                找到 {searchResults.length} 个与 "{keywords.join(', ')}" 相关的景点
              </Paragraph>
              
              <List
                itemLayout="horizontal"
                dataSource={searchResults}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 4 }}
                        />
                      }
                      title={<Text strong>{item.name}</Text>}
                      description={
                        <>
                          <Paragraph ellipsis={{ rows: 2 }}>{item.description}</Paragraph>
                          <div>
                            {item.tags.map(tag => (
                              <Tag key={tag} color="blue">{tag}</Tag>
                            ))}
                          </div>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
              
              {recommendedGroups.length > 0 && (
                <>
                  <Divider />
                  
                  <Title level={5}>推荐组合</Title>
                  <Paragraph>
                    根据您的兴趣，我们为您推荐以下景点组合
                  </Paragraph>
                  
                  <List
                    grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
                    dataSource={recommendedGroups}
                    renderItem={group => (
                      <List.Item>
                        <Card 
                          hoverable 
                          title={group.name}
                          extra={<HeartOutlined />}
                        >
                          <Paragraph>{group.description}</Paragraph>
                          <Paragraph>
                            <Space>
                              <Text><ClockCircleOutlined /> {Math.floor(group.totalDuration / 60)}小时{group.totalDuration % 60}分钟</Text>
                              <Text><TeamOutlined /> 适合{group.tags.includes('亲子') ? '家庭' : '所有人'}</Text>
                            </Space>
                          </Paragraph>
                          <div>
                            {group.tags.map(tag => (
                              <Tag key={tag} color="blue">{tag}</Tag>
                            ))}
                          </div>
                          <div style={{ marginTop: 12 }}>
                            <Button type="primary" block>查看详情</Button>
                          </div>
                        </Card>
                      </List.Item>
                    )}
                  />
                </>
              )}
            </>
          ) : (
            <Empty description="未找到相关景点，请尝试其他关键词" />
          )}
        </>
      )}
      
      {keywords.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <SearchOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          <Paragraph style={{ marginTop: 16 }}>
            请输入关键词开始搜索
          </Paragraph>
        </div>
      )}
    </Card>
  );
};

// 主页面组件
const SmartItinerary: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 根据当前路径确定激活的标签页
  const getActiveTabKey = () => {
    const path = location.pathname;
    if (path.includes('/planner')) return 'planner';
    if (path.includes('/match')) return 'match';
    return 'planner'; // 默认标签页
  };
  
  const handleTabChange = (key: string) => {
    navigate(`/itinerary/${key}`);
  };
  
  return (
    <MainLayout title="智策游程·随心所驭">
      <Tabs 
        activeKey={getActiveTabKey()}
        onChange={handleTabChange}
        style={{ marginBottom: 16 }}
      >
        <TabPane tab={<span><CalendarOutlined />AI智能行程规划</span>} key="planner" />
        <TabPane tab={<span><SearchOutlined />一键寻"徽"</span>} key="match" />
      </Tabs>
      
      <Routes>
        <Route path="/" element={<Navigate to="planner" replace />} />
        <Route path="planner" element={<ItineraryPlanner />} />
        <Route path="match" element={<QuickSearch />} />
      </Routes>
    </MainLayout>
  );
};

export default SmartItinerary; 