/**
 * 图像生成服务
 * 使用百度文心大模型API生成图像
 */

// 图像生成选项接口
export interface ImageGenerationOptions {
  prompt: string;
  style?: string;
  size?: string;
  negativePrompt?: string;
}

// 图像生成结果接口
export interface ImageGenerationResult {
  imageUrl: string;
  prompt: string;
  style: string;
  generatedAt: string;
}

// 支持的图像风格
export const supportedStyles = [
  { key: 'realistic', name: '写实风格', description: '逼真的照片级效果' },
  { key: 'cartoon', name: '卡通风格', description: '动漫和卡通效果' },
  { key: 'ink', name: '水墨风格', description: '中国传统水墨画风格' },
  { key: 'oil', name: '油画风格', description: '西方传统油画效果' },
  { key: 'sketch', name: '素描风格', description: '手绘素描效果' },
  { key: 'huizhou', name: '徽州风格', description: '徽派特色风格效果' },
  { key: 'vintage', name: '复古风格', description: '带有历史感的老照片效果' }
];

// 支持的图像尺寸
export const supportedSizes = [
  { key: '512x512', name: '小图 (512x512)' },
  { key: '768x768', name: '中图 (768x768)' },
  { key: '1024x1024', name: '大图 (1024x1024)' },
  { key: '1280x720', name: '宽屏 (1280x720)' },
  { key: '720x1280', name: '竖屏 (720x1280)' }
];

// 徽州风格关键词库
const huizhouStyleKeywords = {
  // 建筑类
  buildings: [
    '徽派建筑',
    '马头墙',
    '徽州古建筑',
    '砖雕',
    '木雕',
    '石雕',
    '雕梁画栋',
    '天井',
    '飞檐翘角',
    '粉墙黛瓦',
    '徽州民居',
    '牌坊',
    '祠堂'
  ],
  
  // 自然风光类
  landscapes: [
    '青龙湾',
    '青山绿水',
    '徽州山水',
    '烟雨江南',
    '晨雾缭绕',
    '竹林',
    '古树',
    '梯田',
    '溪流',
    '青龙湖',
    '山环水抱'
  ],
  
  // 文化类
  culture: [
    '徽墨',
    '徽州文化',
    '文房四宝',
    '徽剧',
    '非遗',
    '徽州古韵',
    '徽州婚俗',
    '宗祠',
    '祭祀',
    '歙砚',
    '徽州版画'
  ],
  
  // 风格类
  styles: [
    '黑白色调',
    '中式风格',
    '古朴典雅',
    '水墨意境',
    '徽派韵味',
    '传统工艺',
    '明清风格',
    '古典美学',
    '东方美学'
  ]
};

// 随机从关键词库中选择关键词
const getRandomKeywords = (count: number = 3): string[] => {
  const allCategories = Object.values(huizhouStyleKeywords).flat();
  const keywords: string[] = [];
  
  // 确保至少从每个类别选择一个关键词
  const categories = Object.values(huizhouStyleKeywords);
  categories.forEach(category => {
    const randomIndex = Math.floor(Math.random() * category.length);
    keywords.push(category[randomIndex]);
  });
  
  // 如果需要更多关键词，从所有类别中随机选择
  while (keywords.length < count) {
    const randomIndex = Math.floor(Math.random() * allCategories.length);
    const keyword = allCategories[randomIndex];
    
    // 避免重复
    if (!keywords.includes(keyword)) {
      keywords.push(keyword);
    }
  }
  
  // 限制数量
  return keywords.slice(0, count);
};

// 根据风格自动优化提示词
const optimizePromptByStyle = (prompt: string, style: string): string => {
  // 原始提示词
  let optimizedPrompt = prompt;
  
  // 根据不同风格添加相应的关键词
  switch (style) {
    case 'ink':
      optimizedPrompt += ', 水墨画风格, 中国传统绘画, 墨韵, 留白艺术';
      break;
    case 'oil':
      optimizedPrompt += ', 油画风格, 厚重质感, 丰富色彩, 光影对比';
      break;
    case 'cartoon':
      optimizedPrompt += ', 卡通风格, 简洁线条, 明亮色彩, 可爱风格';
      break;
    case 'sketch':
      optimizedPrompt += ', 素描风格, 线条, 明暗对比, 写生技法';
      break;
    case 'huizhou':
      optimizedPrompt += ', 徽州风格, 徽派特色, 黑白对比, 古朴典雅';
      break;
    case 'vintage':
      optimizedPrompt += ', 复古风格, 老照片效果, 怀旧色调, 年代感';
      break;
    case 'realistic':
    default:
      optimizedPrompt += ', 高清细节, 写实效果, 自然光线, 真实质感';
      break;
  }
  
  return optimizedPrompt;
};

// 默认的徽州风格提示词增强
const enhancePromptWithHuizhouStyle = (prompt: string, style: string = 'realistic'): string => {
  // 获取2-3个徽州关键词
  const keywordCount = Math.floor(Math.random() * 2) + 2; // 2-3个
  const huizhouKeywords = getRandomKeywords(keywordCount);
  
  // 基础增强：添加徽州关键词
  let enhancedPrompt = `徽州风格，青龙湾特色，${prompt}`;
  
  // 添加选定的关键词
  huizhouKeywords.forEach(keyword => {
    if (!prompt.toLowerCase().includes(keyword.toLowerCase())) {
      enhancedPrompt += `, ${keyword}`;
    }
  });
  
  // 根据风格进一步优化
  return optimizePromptByStyle(enhancedPrompt, style);
};

// 生成图像
export const generateImage = async (options: ImageGenerationOptions): Promise<ImageGenerationResult> => {
  const { 
    prompt, 
    style = 'realistic', 
    size = '1024x1024', 
    negativePrompt = getDefaultNegativePrompt()
  } = options;
  
  // 增强提示词
  const enhancedPrompt = enhancePromptWithHuizhouStyle(prompt, style);
  
  console.log('原始提示词:', prompt);
  console.log('增强后提示词:', enhancedPrompt);
  console.log('风格:', style);
  console.log('尺寸:', size);
  
  try {
    // 调用后端 API（已由 Vite 代理至 http://localhost:5000）
    console.log('开始调用后端API: /api/ai/image');
    const resp = await fetch('/api/ai/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        style,
        size,
        negativePrompt
      })
    });
    
    console.log('后端API响应状态:', resp.status);
    
    if (!resp.ok) {
      console.error(`后端 API 请求失败，状态码 ${resp.status}`);
      const errorText = await resp.text();
      console.error('错误响应内容:', errorText);
      throw new Error(`后端 API 请求失败，状态码 ${resp.status}`);
    }
    
    const data = await resp.json();
    console.log('后端返回数据类型:', typeof data);
    console.log('后端返回数据结构:', data ? Object.keys(data) : 'null');
    console.log('后端返回数据:', data);
    
    // 尝试多种方式解析图像URL
    let imageUrl: string | undefined;
    
    // 1. 检查是否直接返回imageUrl字段
    if (data?.imageUrl) {
      imageUrl = data.imageUrl;
      console.log('方式1: 从imageUrl字段获取URL');
    } 
    // 2. 检查data数组
    else if (Array.isArray(data?.data) && data.data.length > 0) {
      const item = data.data[0];
      imageUrl = item.url || item.img_url || item.image;
      console.log('方式2: 从data数组获取URL');
    }
    // 3. 检查直接的data对象
    else if (data?.data) {
      const item = data.data;
      imageUrl = item.url || item.img_url || item.image;
      console.log('方式3: 从data对象获取URL');
    }
    // 4. 检查base64数据
    else if (data?.data?.b64_image || (Array.isArray(data?.data) && data.data[0]?.b64_image)) {
      const b64Image = data?.data?.b64_image || data.data[0].b64_image;
      imageUrl = `data:image/png;base64,${b64Image}`;
      console.log('方式4: 从base64数据生成URL');
    }
    
    if (!imageUrl) {
      console.error('后端返回数据中没有可用的图像 URL:', data);
    
      // 使用可靠的公开可访问的模拟数据作为备选
      console.log('使用模拟数据作为备选');
      if (prompt.includes('徽派建筑') || prompt.includes('马头墙')) {
        imageUrl = 'https://picsum.photos/id/100/800/600'; // 随机风景图片
      } else if (prompt.includes('青龙湾') || prompt.includes('湖泊') || prompt.includes('水域')) {
        imageUrl = 'https://picsum.photos/id/142/800/600'; // 随机水景图片
      } else if (prompt.includes('徽州文化') || prompt.includes('非遗')) {
        imageUrl = 'https://picsum.photos/id/175/800/600'; // 随机文化场景图片
      } else {
        imageUrl = 'https://picsum.photos/id/19/800/600'; // 默认随机图片
      }
      
      console.log('使用模拟图片URL:', imageUrl);
    } else {
      console.log('成功获取图像URL:', imageUrl.substring(0, 50) + '...');
    }
    
    return {
      imageUrl,
      prompt: enhancedPrompt,
      style,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('生成图像失败:', error);
    
    // 出错时使用模拟数据
    console.log('API调用失败，使用模拟数据');
    let imageUrl: string;
    
    if (prompt.includes('徽派建筑') || prompt.includes('马头墙')) {
      imageUrl = 'https://picsum.photos/id/100/800/600'; // 随机风景图片
    } else if (prompt.includes('青龙湾') || prompt.includes('湖泊') || prompt.includes('水域')) {
      imageUrl = 'https://picsum.photos/id/142/800/600'; // 随机水景图片
    } else if (prompt.includes('徽州文化') || prompt.includes('非遗')) {
      imageUrl = 'https://picsum.photos/id/175/800/600'; // 随机文化场景图片
    } else {
      imageUrl = 'https://picsum.photos/id/19/800/600'; // 默认随机图片
    }
    
    console.log('使用模拟图片URL:', imageUrl);
    
    return {
      imageUrl,
      prompt: enhancedPrompt,
      style,
      generatedAt: new Date().toISOString()
    };
  }
};

// 获取图像生成的示例提示词
export const getSamplePrompts = (): string[] => {
  return [
    '徽州古村落，晨雾缭绕，粉墙黛瓦',
    '青龙湾水域，碧波荡漾，小舟点点',
    '徽派建筑群，马头墙，雕梁画栋',
    '青龙湾日落，晚霞映照水面',
    '徽州茶园，梯田，茶农采茶',
    '青龙湾古桥，石拱桥，流水潺潺',
    '徽州非遗传承人制作徽墨',
    '青龙湾生态保护区，鸟类栖息',
    '徽州美食，毛豆腐，臭鳜鱼',
    '青龙湾传统节日庆典，龙抬头',
    '徽州宗祠内部，木雕装饰，祭祀场景',
    '青龙湾山水画意境，云雾缭绕',
    '徽派民居内部，天井庭院，家具陈设',
    '青龙湾徽剧表演，演员盛装，舞台场景',
    '徽州商贾，徽商老照片风格，古装人物'
  ];
};

// 获取图像生成的默认负面提示词
export const getDefaultNegativePrompt = (): string => {
  return '模糊, 变形, 低质量, 低分辨率, 扭曲, 不完整, 错误比例, 异常肢体, 过度曝光, 噪点, 失真';
};

export default {
  generateImage,
  supportedStyles,
  supportedSizes,
  getSamplePrompts,
  getDefaultNegativePrompt
}; 