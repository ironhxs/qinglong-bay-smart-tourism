/**
 * 文创服务
 * 提供AI文创功能和徽友圈社区功能
 */

import aiService from './aiService';

// 创作类型
export type CreationType = 'poetry' | 'story' | 'painting';

// 创作风格
export type CreationStyle = 'traditional' | 'modern' | 'fusion';

// 创作难度
export type CreationDifficulty = 'beginner' | 'intermediate' | 'advanced';

// 创作主题
export interface CreationTheme {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  imageUrl: string;
}

// 创作作品
export interface Creation {
  id: string;
  title: string;
  type: CreationType;
  content: string;
  author: string;
  createdAt: string;
  likes: number;
  comments: Array<{
    id: string;
    author: string;
    content: string;
    createdAt: string;
  }>;
  tags: string[];
  previewImage?: string;
}

// 评论
export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  likes: number;
}

// 创作主题列表
export const creationThemes: CreationTheme[] = [
  {
    id: 'ancient-architecture',
    name: '徽州古建筑',
    description: '徽州古建筑以马头墙、雕梁画栋、天井庭院为特色，体现了徽州人的居住智慧和审美情趣。',
    keywords: ['马头墙', '徽派建筑', '雕梁画栋', '天井', '木雕', '砖雕', '石雕'],
    imageUrl: '/images/huizhou-building.jpg'
  },
  {
    id: 'natural-landscape',
    name: '青龙湾自然风光',
    description: '青龙湾自然风光秀丽，山水相依，四季分明，是徽州山水的典型代表。',
    keywords: ['青山', '绿水', '古树', '云雾', '溪流', '竹林', '梯田'],
    imageUrl: '/images/qinglong-landscape-new.jpg'
  },
  {
    id: 'folk-customs',
    name: '徽州民俗文化',
    description: '徽州民俗文化源远流长，包括婚嫁习俗、节日庆典、传统手工艺等多方面内容。',
    keywords: ['徽州婚俗', '祭祀', '徽剧', '徽菜', '徽墨', '宗祠', '祠堂'],
    imageUrl: '/images/huizhou-customs.jpg'
  }
];

// 生成AI创作
export const generateAICreation = async (
  type: CreationType,
  theme: string,
  keywords: string[]
): Promise<Creation> => {
  try {
    // 使用AI服务生成内容
    const content = await aiService.generateCreation(type, theme, keywords);
    
    // 创建创作对象
    const creation: Creation = {
      id: `creation-${Date.now()}`,
      title: theme,
      type,
      content,
      author: 'AI创作助手',
      createdAt: new Date().toLocaleDateString(),
      likes: 0,
      comments: [],
      tags: [...keywords],
      previewImage: type === 'painting' ? '/images/huizhou-building.jpg' : undefined
    };
    
    return creation;
  } catch (error) {
    console.error('生成AI创作失败:', error);
    throw error;
  }
};

// 社区帖子
export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  createdAt: string;
  imageUrl?: string;
  likes: number;
  comments: Array<{
    id: string;
    author: string;
    content: string;
    createdAt: string;
  }>;
  tags: string[];
}

// 创建社区帖子
export const createCommunityPost = (
  title: string,
  content: string,
  imageUrl: string | undefined,
  authorName: string,
  tags: string[]
): CommunityPost => {
  return {
    id: `post-${Date.now()}`,
    title,
    content,
    author: {
      name: authorName,
      avatar: '/images/avatar-new.jpg'
    },
    createdAt: new Date().toLocaleDateString(),
    imageUrl,
    likes: 0,
    comments: [],
    tags
  };
};

// 示例创作
export const sampleCreations: Creation[] = [
  {
    id: 'creation-1',
    title: '青山绿水入徽州',
    type: 'poetry',
    content: '青山如黛绕徽州，\n白墙黛瓦马头楼。\n小桥流水人家处，\n雕梁画栋显风流。\n天井深藏千年韵，\n木雕细诉旧时愁。\n但得青龙湾上望，\n云烟缭绕自悠悠。',
    author: '文心一言',
    createdAt: '2023-05-15',
    likes: 28,
    comments: [
      {
        id: 'comment-1',
        author: '文化爱好者',
        content: '诗中完美展现了徽州的自然风光和建筑特色！',
        createdAt: '2023-05-16'
      }
    ],
    tags: ['徽州', '古建筑', '诗词']
  },
  {
    id: 'creation-2',
    title: '徽州山水',
    type: 'painting',
    content: '这幅画采用传统徽派山水画法，以淡墨勾勒远山，浓墨点缀近景。画面中央是典型的徽州村落，白墙黑瓦，马头墙错落有致。溪水环绕，杨柳依依，远处云雾缭绕，体现了"山环水抱"的徽州自然风光特色。',
    author: 'AI画师',
    createdAt: '2023-05-18',
    likes: 15,
    comments: [],
    tags: ['徽派绘画', '山水画', '徽州风光'],
    previewImage: '/images/huizhou-building.jpg'
  }
];

// 示例社区帖子
export const communitySamplePosts: CommunityPost[] = [
  {
    id: 'post-1',
    title: '青龙湾一日游记',
    content: '今天游览了青龙湾景区，徽派建筑的精美让人叹为观止，特别是那些精致的木雕和砖雕，处处体现着徽州工匠的智慧和艺术追求。下午参加了当地的茶艺表演，品尝了正宗的徽州毛峰，回味无穷。',
    author: {
      name: '旅行爱好者',
      avatar: '/images/avatar-new.jpg'
    },
    createdAt: '2023-05-20',
    imageUrl: '/images/qinglong-landscape-new.jpg',
    likes: 42,
    comments: [
      {
        id: 'comment-1',
        author: '茶文化专家',
        content: '徽州毛峰确实是不可错过的体验，下次可以去看看当地的茶园。',
        createdAt: '2023-05-21'
      }
    ],
    tags: ['青龙湾', '徽派建筑', '茶文化']
  }
];

// 徽州文化元素库
export const culturalElements = {
  symbols: ['马头墙', '砖雕', '木雕', '石雕', '徽墨', '宣纸', '歙砚', '徽茶'],
  historical: ['明清时期', '徽商', '盐业', '茶叶贸易', '晚清', '民国时期'],
  natural: ['青龙湾', '山水', '竹林', '茶园', '溪流', '古树'],
  architectural: ['飞檐', '翘角', '雕花窗', '天井', '廊桥', '牌坊'],
  customs: ['徽州婚俗', '祭祀礼仪', '传统节日', '民间习俗']
};

// AI诗词生成模板
const poetryTemplates = [
  {
    title: '${theme}吟',
    content: `${culturalElements.natural[0]}${culturalElements.natural[1]}映眼前，
${culturalElements.architectural[0]}${culturalElements.architectural[1]}话悠远。
${culturalElements.historical[0]}风华再现，
${culturalElements.symbols[0]}${culturalElements.symbols[1]}展新颜。

晨光微露照山川，
游人如织赏${culturalElements.natural[2]}。
${culturalElements.customs[0]}今犹在，
文化瑰宝永流传。`
  },
  {
    title: '${theme}咏怀',
    content: `青山绿水${culturalElements.natural[0]}，
${culturalElements.architectural[2]}${culturalElements.architectural[3]}古风传。
${culturalElements.historical[1]}足迹遍天下，
${culturalElements.symbols[2]}${culturalElements.symbols[3]}誉满园。

岁月流转几百年，
${culturalElements.customs[1]}不曾变。
${culturalElements.natural[3]}${culturalElements.natural[4]}环绕处，
徽州文化永绵延。`
  }
];

// AI故事生成模板
const storyTemplates = [
  {
    title: '${theme}的故事',
    content: `在${culturalElements.historical[0]}的${culturalElements.natural[0]}，有一座以${culturalElements.architectural[0]}和${culturalElements.architectural[1]}闻名的徽派老宅。这座老宅属于一位${culturalElements.historical[1]}，他靠经营${culturalElements.historical[2]}和${culturalElements.historical[3]}致富。

老宅中最引人注目的是精美的${culturalElements.symbols[0]}和${culturalElements.symbols[1]}，每一处细节都彰显着徽州工匠的智慧和匠心。主人特别珍视一方${culturalElements.symbols[3]}，据说是祖上传下来的宝物。

每逢${culturalElements.customs[1]}和${culturalElements.customs[2]}，全家人都会聚在一起，遵循古老的习俗，祈求平安和幸福。

岁月流转，沧海桑田，如今的${culturalElements.natural[0]}已经成为了著名的文化旅游景点，而那座老宅也被列为文物保护单位，向人们诉说着徽州的历史和文化。`
  }
]; 