/**
 * AI服务
 * 集成百度文心大模型API，为应用提供AI能力
 */

// API配置
interface ApiConfig {
  apiKey: string;
  secretKey?: string; // 可选，兼容旧版认证
  baseUrl: string;
  useMock: boolean; // 是否使用模拟数据
}

// 默认API配置
const defaultConfig: ApiConfig = {
  apiKey: import.meta.env.VITE_BAIDU_API_KEY || 'mock-api-key',
  baseUrl: 'https://aip.baidubce.com',
  useMock: !import.meta.env.VITE_BAIDU_API_KEY // 如果没有API密钥则使用模拟数据
};

// 检查环境变量是否配置
const checkApiConfig = () => {
  const apiKey = import.meta.env.VITE_BAIDU_API_KEY;
  if (!apiKey) {
    console.warn('未检测到API密钥环境变量(VITE_BAIDU_API_KEY)，将使用模拟数据');
    return false;
  }
  return true;
};

// 访问令牌接口
interface AccessTokenResponse {
  access_token: string;
  expires_in: number;
}

// 文心API响应接口
interface ErnieResponse {
  id: string;
  object: string;
  created: number;
  result: string;
  is_truncated?: boolean;
  need_clear_history?: boolean;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// 消息接口
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// 文心API请求参数接口
interface ErnieRequestParams {
  messages: Message[];
  temperature?: number;
  top_p?: number;
  stream?: boolean;
  user_id?: string;
}

// 文生图API请求参数接口
interface TextToImageParams {
  prompt: string;
  negative_prompt?: string;
  size?: string;
  n?: number;
  steps?: number;
  sampler_index?: string;
  style?: string;
}

// 文生图API响应接口
interface TextToImageResponse {
  id: string;
  created: number;
  data: Array<{
    url: string;
    b64_image?: string;
  }>;
}

// AI服务类
export class AIService {
  private config: ApiConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private retryCount: number = 0;
  private maxRetries: number = 3;
  private retryDelay: number = 1000; // 重试延迟，单位毫秒

  constructor(config?: Partial<ApiConfig>) {
    // 检查API配置
    const hasApiConfig = checkApiConfig();
    
    // 根据环境变量配置决定是否使用模拟数据
    this.config = { 
      ...defaultConfig, 
      ...config,
      useMock: config?.useMock !== undefined ? config.useMock : !hasApiConfig
    };
    
    console.log('AI服务初始化', this.config.useMock ? '使用模拟数据' : '使用实际API');
  }

  // 重置重试计数
  private resetRetryCount(): void {
    this.retryCount = 0;
  }

  // 获取访问令牌 - API Key认证方式
  private async getAccessToken(): Promise<string> {
    // 如果使用模拟数据，返回假的访问令牌
    if (this.config.useMock) {
      return 'mock-access-token';
    }
    
    const now = Date.now();
    
    // 如果令牌有效，直接返回
    if (this.accessToken && now < this.tokenExpiry) {
      return this.accessToken;
    }
    
    try {
      // 使用API Key直接作为访问令牌
      this.accessToken = this.config.apiKey;
      this.tokenExpiry = now + 24 * 60 * 60 * 1000; // 设置24小时有效期，实际应根据API Key的有效期调整
      return this.accessToken;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  }

  // 带重试机制的API调用
  private async fetchWithRetry(url: string, options: RequestInit): Promise<Response> {
    try {
      const response = await fetch(url, options);
      
      // 如果响应成功，重置重试计数并返回响应
      if (response.ok) {
        this.resetRetryCount();
        return response;
      }
      
      // 如果响应失败但可以重试
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.warn(`API调用失败，正在进行第${this.retryCount}次重试...`);
        
        // 等待一段时间后重试
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        
        // 指数退避策略
        this.retryDelay *= 2;
        
        return this.fetchWithRetry(url, options);
      }
      
      // 重试次数用尽，抛出错误
      this.resetRetryCount();
      throw new Error(`API调用失败，状态码: ${response.status}`);
    } catch (error) {
      // 网络错误或其他异常
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.warn(`API调用异常，正在进行第${this.retryCount}次重试...`);
        
        // 等待一段时间后重试
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        
        // 指数退避策略
        this.retryDelay *= 2;
        
        return this.fetchWithRetry(url, options);
      }
      
      // 重试次数用尽，抛出错误
      this.resetRetryCount();
      throw error;
    }
  }

  // 通过后端API生成文本
  private async generateTextViaBackend(prompt: string, systemPrompt?: string): Promise<string> {
    const messages: Message[] = [];
    
    // 添加系统提示
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    // 添加用户提示
    messages.push({ role: 'user', content: prompt });
    
    try {
      console.log('通过后端API生成文本');
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages })
      });
      
      // 特别处理429错误（API调用限制）
      if (response.status === 429) {
        console.warn('API调用频率限制，自动切换到模拟数据模式');
        
        // 根据提示词生成模拟数据
        if (prompt.includes('徽州风格古诗') || prompt.includes('徽州古建筑') || prompt.includes('马头墙')) {
          return `青山如黛绕徽州，
白墙黛瓦马头楼。
雕梁画栋映天井，
砖雕石刻木雕留。
匠心独运千年韵，
文脉长存万代秋。
青龙湾畔风光好，
徽派建筑展风流。`;
        } else if (prompt.includes('短篇故事')) {
          return `在明清时期的青龙湾，有一座以飞檐和翘角闻名的徽派老宅。这座老宅属于一位徽商，他靠经营盐业和茶叶贸易致富。

老宅中最引人注目的是精美的马头墙和砖雕，每一处细节都彰显着徽州工匠的智慧和匠心。主人特别珍视一方徽墨，据说是祖上传下来的宝物。

每逢祭祀礼仪和传统节日，全家人都会聚在一起，遵循古老的习俗，祈求平安和幸福。

岁月流转，沧海桑田，如今的青龙湾已经成为了著名的文化旅游景点，而那座老宅也被列为文物保护单位，向人们诉说着徽州的历史和文化。`;
        } else {
          return `感谢您的创作请求。我为您生成了一份与"${prompt.substring(0, 30)}..."相关的内容。由于当前API调用频率已达到限制，此内容由本地模拟数据生成。青龙湾的徽派建筑融合了马头墙、雕梁画栋、天井等经典元素，展现了徽州传统文化的独特魅力。这些建筑不仅是历史的见证，也是工匠智慧的结晶。`;
        }
      }
      
      if (!response.ok) {
        throw new Error(`API请求失败，状态码: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.result) {
        return data.result;
      } else {
        throw new Error('API响应中没有结果');
      }
    } catch (error) {
      console.error('Error generating text:', error);
      
      // 如果是网络错误或其他非429错误，继续抛出
      if (error instanceof Error && !error.message.includes('429')) {
        throw error;
      }
      
      // 对于429错误，已在上面处理并返回模拟数据
      console.warn('使用模拟数据作为备用');
      return `由于API调用频率限制，无法生成实时内容。以下是关于"${prompt.substring(0, 30)}..."的模拟内容：

青龙湾的徽派建筑以其独特的马头墙、精美的木雕、砖雕和石雕闻名于世。这些建筑不仅展现了徽州工匠的卓越技艺，也蕴含了丰富的文化内涵。漫步在青龙湾，仿佛穿越时空，感受着千年徽州的历史韵味。`;
    }
  }

  // 文本生成（使用ERNIE-4.0-Turbo-8K模型）
  public async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    // 如果使用模拟数据，返回模拟响应
    if (this.config.useMock) {
      console.log('使用模拟数据生成文本');
      console.log('系统提示:', systemPrompt);
      console.log('用户提示:', prompt);
      
      // 根据提示内容生成不同的模拟响应
      if (prompt.includes('徽州风格古诗')) {
        return `青山如黛绕徽州，
白墙黛瓦马头楼。
小桥流水人家处，
雕梁画栋显风流。
天井深藏千年韵，
木雕细诉旧时愁。
但得青龙湾上望，
云烟缭绕自悠悠。`;
      } else if (prompt.includes('短篇故事')) {
        return `在明清时期的青龙湾，有一座以飞檐和翘角闻名的徽派老宅。这座老宅属于一位徽商，他靠经营盐业和茶叶贸易致富。

老宅中最引人注目的是精美的马头墙和砖雕，每一处细节都彰显着徽州工匠的智慧和匠心。主人特别珍视一方徽墨，据说是祖上传下来的宝物。

每逢祭祀礼仪和传统节日，全家人都会聚在一起，遵循古老的习俗，祈求平安和幸福。

岁月流转，沧海桑田，如今的青龙湾已经成为了著名的文化旅游景点，而那座老宅也被列为文物保护单位，向人们诉说着徽州的历史和文化。`;
      } else {
        return `感谢您的提问。作为青龙湾景区的虚拟导游，我很高兴为您提供帮助。青龙湾景区融合了徽州传统文化和自然风光，是体验徽州魅力的绝佳去处。您可以参观徽派古建筑，欣赏马头墙、木雕、砖雕等艺术瑰宝，也可以漫步在青山绿水之间，感受"山环水抱"的自然之美。`;
      }
    }
    
    try {
      // 通过后端API生成文本，避免CORS问题
      return await this.generateTextViaBackend(prompt, systemPrompt);
    } catch (error) {
      console.error('Error generating text:', error);
      throw error;
    }
  }

  // 智能行程规划
  public async generateItinerary(preferences: {
    duration: number;
    interests: string[];
    avoidCrowds?: boolean;
    includeFood?: boolean;
    pace?: string;
  }): Promise<string> {
    const systemPrompt = `你是青龙湾景区的智能行程规划师。根据用户的偏好，生成详细的游览行程。
青龙湾特色景点包括：徽派建筑群、青龙古桥、非遗展示中心、生态观景台、青龙湖等。
行程应包含：时间安排、游览路线、特色体验、用餐建议（如需）。
使用Markdown格式输出，包含标题、概览和详细安排。`;
    
    const prompt = `请为我生成一个青龙湾的游览行程：
- 游览时长：${preferences.duration}小时
- 兴趣偏好：${preferences.interests.join('、')}
${preferences.avoidCrowds ? '- 希望避开人群' : ''}
${preferences.includeFood ? '- 包含特色美食体验' : ''}
${preferences.pace ? `- 游览节奏：${preferences.pace}` : ''}
请提供详细的时间安排和路线指引。`;
    
    return this.generateText(prompt, systemPrompt);
  }

  // AI文创生成
  public async generateCreation(
    type: 'poetry' | 'story' | 'painting',
    theme: string,
    keywords: string[]
  ): Promise<string> {
    let systemPrompt = '';
    let prompt = '';
    
    switch (type) {
      case 'poetry':
        systemPrompt = `你是一位精通徽州文化的诗人。请创作一首符合徽州风格的诗词，融入青龙湾的自然风光和人文特色。使用HTML格式输出，添加适当的<br>标签用于分行，使用<h3>标题</h3>、<p>段落</p>等标签结构化输出。不要添加markdown格式。`;
        prompt = `请以"${theme}"为主题，创作一首徽州风格的诗词。
需要包含的关键词：${keywords.join('、')}
要求：格律工整，意境优美，突出徽州特色。`;
        break;
        
      case 'story':
        systemPrompt = `你是一位了解徽州历史文化的作家。请创作一个与青龙湾相关的短篇故事，展现徽州的历史风貌和人文精神。使用HTML格式输出，添加适当的<br>标签用于分行，使用<h3>标题</h3>、<p>段落</p>等标签结构化输出。不要添加markdown格式。`;
        prompt = `请以"${theme}"为主题，创作一个徽州风格的短篇故事。
需要包含的关键词：${keywords.join('、')}
要求：情节生动，人物鲜明，体现徽州文化特色，篇幅300字左右。`;
        break;
        
      case 'painting':
        systemPrompt = `你是一位精通徽派绘画的艺术家。请描述一幅徽州风格的绘画作品，展现青龙湾的自然风光和人文特色。使用HTML格式输出，添加适当的<br>标签用于分行，使用<h3>标题</h3>、<p>段落</p>等标签结构化输出。不要添加markdown格式。`;
        prompt = `请以"${theme}"为主题，描述一幅徽派风格的绘画作品。
需要包含的关键词：${keywords.join('、')}
要求：详细描述画面构图、色彩、笔法和意境，突出徽州特色。`;
        break;
    }
    
    return this.generateText(prompt, systemPrompt);
  }

  // 与虚拟导游对话
  public async chatWithVirtualGuide(
    query: string,
    chatHistory: Message[] = []
  ): Promise<string> {
    const systemPrompt = `你是青龙湾景区的虚拟导游"小青徽"，精通徽州文化和青龙湾历史。
你的特点是：
1. 熟悉青龙湾的历史、文化、景点、美食等信息
2. 语言风格亲切自然，适当融入徽州方言特色词汇
3. 回答准确简洁，突出青龙湾特色
4. 能够根据游客需求提供个性化建议

请根据游客的问题，提供专业、友好的回答。如果遇到不确定的问题，可以坦诚表示需要进一步了解，避免提供错误信息。`;
    
    // 构建完整的对话历史
    const messages: Message[] = [
      { role: 'system', content: systemPrompt }
    ];
    
    // 添加历史对话
    chatHistory.forEach(msg => {
      messages.push(msg);
    });
    
    // 添加用户当前问题
    messages.push({ role: 'user', content: query });
    
    // 如果使用模拟数据，使用简单的规则匹配生成回复
    if (this.config.useMock) {
      // 这部分逻辑保留在virtualCharacter.ts中，这里不再重复
      console.log('使用模拟数据生成虚拟导游回复');
      
      // 导入virtualCharacter服务的generateResponse函数
      const { generateResponse } = await import('./virtualCharacter');
      return generateResponse(query);
    }
    
    try {
      // 通过后端API代理请求，避免CORS问题
      console.log('通过后端API代理请求虚拟导游对话');
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages })
      });
      
      if (!response.ok) {
        throw new Error(`API请求失败，状态码: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.result) {
        return data.result;
      } else {
        throw new Error('API响应中没有结果');
      }
    } catch (error) {
      console.error('Error chatting with virtual guide:', error);
      
      // 如果API调用失败，回退到本地逻辑
      const { generateResponse } = await import('./virtualCharacter');
      return generateResponse(query);
    }
  }

  // 环境数据分析
  public async analyzeEnvironmentalData(data: {
    airQuality: {
      aqi: number;
      level: string;
    };
    waterQuality: {
      ph: number;
      level: string;
    };
    biodiversity: {
      conservationIndex: number;
    };
  }): Promise<string> {
    // 如果使用模拟数据，返回模拟响应
    if (this.config.useMock) {
      console.log('使用模拟数据分析环境数据');
      console.log('环境数据:', data);
      
      return `## 青龙湾环境状况分析

### 空气质量
当前AQI指数为${data.airQuality.aqi}，属于${data.airQuality.level}水平。空气质量总体良好，适合户外活动。

### 水质状况
水体pH值为${data.waterQuality.ph}，属于${data.waterQuality.level}水平。水质清澈，适合水生生物生长。

### 生物多样性
生物多样性保护指数为${data.biodiversity.conservationIndex}，生态系统健康稳定。区域内记录有多种珍稀植物和动物，生态保护成效显著。

### 建议措施
1. 继续加强生态监测，特别是水质监测频率
2. 控制游客流量，避免对生态系统造成过度干扰
3. 开展环保宣传教育，提高游客环保意识
4. 定期组织生态修复活动，如植树造林、水生植物种植等`;
    }
    
    const systemPrompt = `你是青龙湾景区的生态环境专家，擅长分析环境数据并提供专业建议。请根据提供的环境数据，分析当前生态状况并给出保护建议。使用专业但易懂的语言，以Markdown格式输出分析报告。`;
    
    const prompt = `请分析以下青龙湾环境数据：

空气质量：
- AQI指数：${data.airQuality.aqi}
- 级别：${data.airQuality.level}

水质状况：
- pH值：${data.waterQuality.ph}
- 级别：${data.waterQuality.level}

生物多样性：
- 保护指数：${data.biodiversity.conservationIndex}

请提供详细的环境状况分析和保护建议。`;
    
    return this.generateText(prompt, systemPrompt);
  }

  // 生成图像
  public async generateImage(
    prompt: string,
    style: string = 'realistic',
    size: string = '1024x1024'
  ): Promise<string> {
    console.log('调用生成图像服务, useMock:', this.config.useMock);
    console.log('提示词:', prompt);
    
    try {
      // 尝试调用后端API
      console.log('尝试调用后端API生成图像');
      const response = await fetch('/api/ai/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          style,
          size
        })
      });
      
      if (!response.ok) {
        console.error('后端API请求失败，状态码:', response.status);
        throw new Error(`后端API请求失败，状态码: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('后端API返回数据:', data);
      
      if (data.imageUrl) {
        console.log('成功获取图像URL:', data.imageUrl.substring(0, 50) + '...');
        return data.imageUrl;
      }
      
      throw new Error('后端返回数据中没有图像URL');
    } catch (error) {
      console.error('生成图像失败:', error);
      
      // 如果API调用失败，使用模拟数据
      console.log('API调用失败，使用模拟数据');
      
      // 根据提示词返回不同的模拟图片URL
      if (prompt.includes('徽派建筑') || prompt.includes('马头墙')) {
        return 'https://picsum.photos/id/100/800/600'; // 随机风景图片
      } else if (prompt.includes('青龙湾') || prompt.includes('湖泊') || prompt.includes('水域')) {
        return 'https://picsum.photos/id/142/800/600'; // 随机水景图片
      } else if (prompt.includes('徽州文化') || prompt.includes('非遗')) {
        return 'https://picsum.photos/id/175/800/600'; // 随机文化场景图片
      } else {
        return 'https://picsum.photos/id/19/800/600'; // 默认随机图片
      }
    }
  }

  // 游客数据分析
  public async analyzeVisitorData(data: {
    totalVisitors: number;
    visitorTypes: Array<{ type: string; percentage: number }>;
    popularAttractions: Array<{ name: string; visitCount: number }>;
    averageSatisfaction: number;
  }): Promise<string> {
    // 如果使用模拟数据，返回模拟响应
    if (this.config.useMock) {
      console.log('使用模拟数据分析游客数据');
      console.log('游客数据:', data);
      
      return `## 青龙湾游客数据分析

### 游客概况
本月总游客量：${data.totalVisitors.toLocaleString()}人次，同比增长12.5%。

### 游客类型分布
${data.visitorTypes.map(item => `- ${item.type}：${item.percentage}%`).join('\n')}

家庭游客占比最高，说明青龙湾已成为亲子游的热门选择。

### 热门景点排名
${data.popularAttractions.map((item, index) => `${index + 1}. ${item.name}：${item.visitCount.toLocaleString()}人次`).join('\n')}

### 游客满意度
平均满意度：${data.averageSatisfaction}/5，较上月提升0.2分。

### 运营建议
1. 针对家庭游客增加亲子互动项目
2. 加强${data.popularAttractions[0].name}周边服务设施建设
3. 开发更多文化体验活动，提升游客参与度
4. 优化游览路线，缓解热门景点拥堵情况`;
    }
    
    const systemPrompt = `你是青龙湾景区的数据分析师，擅长分析游客数据并提供运营建议。请根据提供的游客数据，分析游客行为模式并给出运营优化建议。使用专业但易懂的语言，以Markdown格式输出分析报告。`;
    
    const prompt = `请分析以下青龙湾游客数据：

总游客量：${data.totalVisitors}人次

游客类型分布：
${data.visitorTypes.map(item => `- ${item.type}：${item.percentage}%`).join('\n')}

热门景点排名：
${data.popularAttractions.map((item, index) => `${index + 1}. ${item.name}：${item.visitCount}人次`).join('\n')}

平均满意度：${data.averageSatisfaction}/5

请提供详细的游客行为分析和运营优化建议。`;
    
    return this.generateText(prompt, systemPrompt);
  }
}

// 创建并导出默认实例
const aiService = new AIService();
export default aiService;
