import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Card, 
  Avatar, 
  Button, 
  Input, 
  Space, 
  Tabs, 
  List, 
  Divider, 
  Tag, 
  Modal, 
  Form, 
  Upload, 
  Select,
  message
} from 'antd';
import { 
  LikeOutlined, 
  LikeFilled, 
  CommentOutlined, 
  ShareAltOutlined, 
  PictureOutlined, 
  UploadOutlined,
  UserOutlined,
  TagOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import MainLayout from '../components/layout/MainLayout';
import { communitySamplePosts, createCommunityPost, CommunityPost } from '../services/creation';
import aiService from '../services/aiService';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

// 徽友圈社区页面
const HuiCommunity: React.FC = () => {
  const [posts, setPosts] = useState<CommunityPost[]>(communitySamplePosts);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);

  // 获取帖子数据
  useEffect(() => {
    // 实际项目中，这里应该从后端API获取数据
    // 这里使用示例数据
  }, []);

  // 点赞帖子
  const likePost = (postId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, likes: post.likes + 1 } 
          : post
      )
    );
  };

  // 添加评论
  const addComment = (postId: string, content: string) => {
    if (!content.trim()) return;
    
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              comments: [
                ...post.comments, 
                {
                  id: `comment-${Date.now()}`,
                  author: '当前用户',
                  content,
                  createdAt: new Date().toLocaleDateString()
                }
              ] 
            } 
          : post
      )
    );
  };

  // 显示创建帖子模态框
  const showCreatePostModal = () => {
    setIsModalVisible(true);
    setImageUrl(null);
  };

  // 关闭创建帖子模态框
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setImageUrl(null);
  };

  // 提交创建帖子表单
  const handleSubmit = async (values: any) => {
    try {
      const newPost = createCommunityPost(
        values.title,
        values.content,
        imageUrl || undefined,
        values.author || '游客',
        values.tags || []
      );
      
      setPosts(prevPosts => [newPost, ...prevPosts]);
      message.success('发布成功！');
      handleCancel();
    } catch (error) {
      console.error('发布帖子失败:', error);
      message.error('发布失败，请重试');
    }
  };

  // 生成AI图像
  const generateAIImage = async () => {
    const prompt = form.getFieldValue('content');
    if (!prompt) {
      message.warning('请先输入内容，AI将根据内容生成相关图像');
      return;
    }
    
    try {
      setIsGeneratingImage(true);
      const imageUrl = await aiService.generateImage(prompt, 'realistic');
      setImageUrl(imageUrl);
      message.success('AI图像生成成功！');
    } catch (error) {
      console.error('生成AI图像失败:', error);
      message.error('生成图像失败，请重试');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // 过滤帖子
  const getFilteredPosts = () => {
    if (activeTab === 'all') {
      return posts;
    }
    return posts.filter(post => post.tags.includes(activeTab));
  };

  return (
    <MainLayout>
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Title level={2}>徽友圈</Title>
          <Button type="primary" onClick={showCreatePostModal}>发布动态</Button>
        </div>
        
        <Paragraph>
          欢迎来到徽友圈！这里是分享青龙湾旅游体验、文化创作和美好记忆的社区。与其他游客交流互动，分享您的徽州之旅。
        </Paragraph>
        
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          style={{ marginBottom: '20px' }}
        >
          <TabPane tab="全部" key="all" />
          <TabPane tab="旅游体验" key="旅游体验" />
          <TabPane tab="文化创作" key="文化创作" />
          <TabPane tab="美食分享" key="美食" />
          <TabPane tab="摄影作品" key="摄影" />
        </Tabs>
        
        <List
          itemLayout="vertical"
          size="large"
          pagination={{
            onChange: page => {
              console.log(page);
            },
            pageSize: 5,
          }}
          dataSource={getFilteredPosts()}
          renderItem={post => (
            <Card 
              style={{ marginBottom: '16px' }}
              actions={[
                <Button 
                  type="text" 
                  icon={<LikeOutlined />} 
                  onClick={() => likePost(post.id)}
                >
                  {post.likes}
                </Button>,
                <Button 
                  type="text" 
                  icon={<CommentOutlined />}
                >
                  {post.comments.length}
                </Button>,
                <Button 
                  type="text" 
                  icon={<ShareAltOutlined />}
                >
                  分享
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar src={post.author.avatar} />}
                title={<a href="#">{post.title}</a>}
                description={
                  <Space>
                    <Text type="secondary">{post.author.name}</Text>
                    <Divider type="vertical" />
                    <Text type="secondary">{post.createdAt}</Text>
                  </Space>
                }
              />
              <div style={{ margin: '16px 0' }}>
                <Paragraph>{post.content}</Paragraph>
                {post.imageUrl && (
                  <div style={{ marginTop: '16px' }}>
                    <img 
                      src={post.imageUrl} 
                      alt={post.title} 
                      style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px' }} 
                    />
                  </div>
                )}
              </div>
              <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                {post.tags.map(tag => (
                  <Tag color="blue" key={tag} style={{ marginRight: '8px' }}>
                    {tag}
                  </Tag>
                ))}
              </div>
              {post.comments.length > 0 && (
                <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px' }}>
                  <List
                    itemLayout="horizontal"
                    dataSource={post.comments}
                    renderItem={comment => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<UserOutlined />} />}
                          title={<Text strong>{comment.author}</Text>}
                          description={comment.content}
                        />
                        <Text type="secondary">{comment.createdAt}</Text>
                      </List.Item>
                    )}
                  />
                </div>
              )}
              <div style={{ marginTop: '16px' }}>
                <Input.Group compact>
                  <Input 
                    style={{ width: 'calc(100% - 100px)' }} 
                    placeholder="添加评论..."
                    onPressEnter={(e) => {
                      addComment(post.id, (e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }}
                  />
                  <Button type="primary">发送</Button>
                </Input.Group>
              </div>
            </Card>
          )}
        />
      </div>
      
      {/* 创建帖子模态框 */}
      <Modal
        title="发布动态"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入标题" />
          </Form.Item>
          
          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <TextArea 
              placeholder="分享您的青龙湾体验..." 
              autoSize={{ minRows: 4, maxRows: 8 }}
            />
          </Form.Item>
          
          <Form.Item label="图片">
            <Space direction="vertical" style={{ width: '100%' }}>
              {imageUrl ? (
                <div style={{ marginBottom: '16px' }}>
                  <img 
                    src={imageUrl} 
                    alt="预览" 
                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} 
                  />
                </div>
              ) : null}
              
              <Space>
                <Upload
                  beforeUpload={(file) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => {
                      setImageUrl(reader.result as string);
                    };
                    return false;
                  }}
                  showUploadList={false}
                >
                  <Button icon={<UploadOutlined />}>上传图片</Button>
                </Upload>
                
                <Button 
                  icon={<PictureOutlined />} 
                  onClick={generateAIImage}
                  loading={isGeneratingImage}
                >
                  AI生成图像
                </Button>
              </Space>
            </Space>
          </Form.Item>
          
          <Form.Item
            name="tags"
            label="标签"
          >
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="添加标签"
              tokenSeparators={[',']}
            >
              <Option value="旅游体验">旅游体验</Option>
              <Option value="文化创作">文化创作</Option>
              <Option value="美食">美食</Option>
              <Option value="摄影">摄影</Option>
              <Option value="徽派建筑">徽派建筑</Option>
              <Option value="青龙湾">青龙湾</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="author"
            label="署名"
          >
            <Input placeholder="您的昵称" />
          </Form.Item>
          
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={handleCancel}>取消</Button>
              <Button type="primary" htmlType="submit">发布</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </MainLayout>
  );
};

export default HuiCommunity; 