import React, { useState } from 'react';
import { 
  Typography, 
  Card, 
  Button, 
  Input, 
  Space, 
  Select, 
  Spin, 
  Alert, 
  Row, 
  Col, 
  Divider,
  Tag,
  Image,
  Radio,
  message
} from 'antd';
import { 
  PictureOutlined, 
  DownloadOutlined, 
  CopyOutlined,
  ReloadOutlined,
  SaveOutlined
} from '@ant-design/icons';
import MainLayout from '../components/layout/MainLayout';
import imageGenerationService, {
  supportedStyles,
  supportedSizes,
  getSamplePrompts,
  getDefaultNegativePrompt,
  ImageGenerationResult
} from '../services/imageGeneration';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ImageGeneration: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [negativePrompt, setNegativePrompt] = useState<string>(getDefaultNegativePrompt());
  const [style, setStyle] = useState<string>('realistic');
  const [size, setSize] = useState<string>('1024x1024');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<ImageGenerationResult | null>(null);
  const [generationHistory, setGenerationHistory] = useState<ImageGenerationResult[]>([]);

  // 生成图像
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      message.warning('请输入提示词');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await imageGenerationService.generateImage({
        prompt,
        style,
        size,
        negativePrompt: negativePrompt.trim() ? negativePrompt : undefined
      });
      
      setGeneratedImage(result);
      setGenerationHistory(prev => [result, ...prev.slice(0, 9)]);
      message.success('图像生成成功！');
    } catch (err) {
      console.error('生成图像失败:', err);
      setError('生成图像失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 使用示例提示词
  const useSamplePrompt = (samplePrompt: string) => {
    setPrompt(samplePrompt);
  };

  // 下载图像
  const downloadImage = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage.imageUrl;
    link.download = `青龙湾图像_${new Date().getTime()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 复制提示词
  const copyPrompt = () => {
    if (!generatedImage) return;
    
    navigator.clipboard.writeText(generatedImage.prompt)
      .then(() => message.success('提示词已复制到剪贴板'))
      .catch(() => message.error('复制失败，请手动复制'));
  };

  return (
    <MainLayout>
      <div style={{ padding: '20px' }}>
        <Title level={2}>徽州风格图像生成</Title>
        <Paragraph>
          使用AI技术生成具有徽州特色的图像，可用于创意设计、旅游宣传、文化展示等场景。
        </Paragraph>
        
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title="图像生成设置" bordered={false}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>提示词</Text>
                  <TextArea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="描述您想要生成的图像，例如：青龙湾日落，晚霞映照水面"
                    autoSize={{ minRows: 3, maxRows: 6 }}
                  />
                </div>
                
                <div>
                  <Text strong>示例提示词</Text>
                  <div style={{ marginTop: 8 }}>
                    {getSamplePrompts().map((sample, index) => (
                      <Tag
                        key={index}
                        color="blue"
                        style={{ marginBottom: 8, cursor: 'pointer' }}
                        onClick={() => useSamplePrompt(sample)}
                      >
                        {sample.length > 20 ? `${sample.substring(0, 20)}...` : sample}
                      </Tag>
                    ))}
                  </div>
                </div>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Text strong>图像风格</Text>
                    <Select
                      value={style}
                      onChange={setStyle}
                      style={{ width: '100%', marginTop: 8 }}
                    >
                      {supportedStyles.map(styleOption => (
                        <Option key={styleOption.key} value={styleOption.key}>
                          {styleOption.name} - {styleOption.description}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={12}>
                    <Text strong>图像尺寸</Text>
                    <Select
                      value={size}
                      onChange={setSize}
                      style={{ width: '100%', marginTop: 8 }}
                    >
                      {supportedSizes.map(sizeOption => (
                        <Option key={sizeOption.key} value={sizeOption.key}>
                          {sizeOption.name}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                </Row>
                
                <div>
                  <Text strong>负面提示词（可选）</Text>
                  <TextArea
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="描述您不希望在图像中出现的元素"
                    autoSize={{ minRows: 2, maxRows: 4 }}
                  />
                </div>
                
                <Button
                  type="primary"
                  icon={<PictureOutlined />}
                  onClick={handleGenerate}
                  loading={loading}
                  block
                >
                  生成图像
                </Button>
              </Space>
            </Card>
          </Col>
          
          <Col xs={24} md={12}>
            <Card title="生成结果" bordered={false}>
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
                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                  <Spin size="large" />
                  <div style={{ marginTop: 16 }}>正在生成图像，请稍候...</div>
                </div>
              ) : generatedImage ? (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <Image
                      src={generatedImage.imageUrl}
                      alt="生成的图像"
                      style={{ maxWidth: '100%', maxHeight: '400px' }}
                    />
                  </div>
                  
                  <Space style={{ marginBottom: 16 }}>
                    <Button icon={<DownloadOutlined />} onClick={downloadImage}>
                      下载图像
                    </Button>
                    <Button icon={<CopyOutlined />} onClick={copyPrompt}>
                      复制提示词
                    </Button>
                  </Space>
                  
                  <div>
                    <Text strong>使用的提示词：</Text>
                    <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: '展开' }}>
                      {generatedImage.prompt}
                    </Paragraph>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '80px 0', color: '#999' }}>
                  <PictureOutlined style={{ fontSize: 48 }} />
                  <div style={{ marginTop: 16 }}>
                    请输入提示词并点击"生成图像"按钮
                  </div>
                </div>
              )}
            </Card>
          </Col>
        </Row>
        
        {generationHistory.length > 0 && (
          <>
            <Divider orientation="left">生成历史</Divider>
            <Row gutter={[16, 16]}>
              {generationHistory.map((item, index) => (
                <Col xs={24} sm={12} md={8} lg={6} key={index}>
                  <Card
                    hoverable
                    cover={
                      <div style={{ height: 200, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                          alt={`生成历史 ${index + 1}`}
                          src={item.imageUrl}
                          style={{ width: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    }
                    actions={[
                      <Button 
                        type="text" 
                        icon={<ReloadOutlined />} 
                        onClick={() => {
                          setPrompt(item.prompt);
                          setStyle(item.style);
                        }}
                      >
                        重用
                      </Button>,
                      <Button 
                        type="text" 
                        icon={<DownloadOutlined />} 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = item.imageUrl;
                          link.download = `青龙湾图像_${new Date().getTime()}.jpg`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      >
                        下载
                      </Button>
                    ]}
                  >
                    <Card.Meta
                      title={`风格: ${supportedStyles.find(s => s.key === item.style)?.name || item.style}`}
                      description={
                        <Paragraph ellipsis={{ rows: 2 }}>
                          {item.prompt}
                        </Paragraph>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default ImageGeneration; 