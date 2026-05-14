/**
 * 智能行程规划服务
 * 提供AI智能行程规划和一键寻徽功能
 */

// 景点类型
export interface Attraction {
  id: number;
  name: string;
  description: string;
  type: string;
  image: string;
  duration: number; // 参观时长（分钟）
  popularity: number; // 热门程度 1-5
  crowdLevel: number; // 拥挤程度 1-5
  tags: string[];
  location: {
    lat: number;
    lng: number;
  };
}

// 景点数据
export const attractions: Attraction[] = [
  {
    id: 1,
    name: '青龙湾码头',
    description: '青龙湾的核心景点，可以乘船游览整个湾区，欣赏两岸风光。',
    type: '自然景观',
    image: 'https://img.zcool.cn/community/01a0a75af3dd6ca801216518714fca.jpg@1280w_1l_2o_100sh.jpg',
    duration: 60,
    popularity: 5,
    crowdLevel: 4,
    tags: ['水域', '游船', '摄影', '休闲'],
    location: {
      lat: 30.2743,
      lng: 118.3342
    }
  },
  {
    id: 2,
    name: '徽派建筑群',
    description: '保存完好的传统徽派民居建筑群，展示了徽州建筑的独特风格。',
    type: '人文景观',
    image: 'https://img.zcool.cn/community/0194f05e62f130a801216518a0cd65.jpg@1280w_1l_2o_100sh.jpg',
    duration: 90,
    popularity: 4,
    crowdLevel: 3,
    tags: ['建筑', '历史', '文化', '摄影'],
    location: {
      lat: 30.2712,
      lng: 118.3367
    }
  },
  {
    id: 3,
    name: '青龙湾生态观景台',
    description: '位于山顶的观景平台，可以俯瞰整个青龙湾全景。',
    type: '自然景观',
    image: 'https://img.zcool.cn/community/031e1b55af3c0b000001bf72b87c65.jpg@1280w_1l_2o_100sh.jpg',
    duration: 45,
    popularity: 5,
    crowdLevel: 3,
    tags: ['观景', '摄影', '自然', '徒步'],
    location: {
      lat: 30.2798,
      lng: 118.3376
    }
  },
  {
    id: 4,
    name: '徽州文化长廊',
    description: '展示徽州文化历史的长廊，包含大量历史文物和图文资料。',
    type: '人文景观',
    image: 'https://img.zcool.cn/community/01f9c65e71b757a8012165188aa07e.jpg@1280w_1l_2o_100sh.jpg',
    duration: 60,
    popularity: 3,
    crowdLevel: 2,
    tags: ['文化', '历史', '教育', '室内'],
    location: {
      lat: 30.2756,
      lng: 118.3389
    }
  },
  {
    id: 5,
    name: '青龙湖',
    description: '湖水清澈，环境优美，是野生水鸟的栖息地，也是垂钓和划船的好去处。',
    type: '自然景观',
    image: 'https://img.zcool.cn/community/01d6f55af3dd6ca801216518a0a0d6.jpg@1280w_1l_2o_100sh.jpg',
    duration: 120,
    popularity: 4,
    crowdLevel: 3,
    tags: ['湖泊', '垂钓', '划船', '野生动物'],
    location: {
      lat: 30.2823,
      lng: 118.3412
    }
  },
  {
    id: 6,
    name: '非遗展示中心',
    description: '展示徽州非物质文化遗产，如徽墨制作、木雕、竹编等传统工艺。',
    type: '人文景观',
    image: 'https://img.zcool.cn/community/01d9a55af3dd6ca801216518b6b7d4.jpg@1280w_1l_2o_100sh.jpg',
    duration: 90,
    popularity: 4,
    crowdLevel: 2,
    tags: ['非遗', '工艺', '文化', '体验'],
    location: {
      lat: 30.2734,
      lng: 118.3401
    }
  },
  {
    id: 7,
    name: '青龙湾美食街',
    description: '汇集各种徽菜美食和特色小吃的美食街，有多家百年老店。',
    type: '美食',
    image: 'https://img.zcool.cn/community/0158fd5af3dd6ca80120a895a7b2a0.jpg@1280w_1l_2o_100sh.jpg',
    duration: 120,
    popularity: 5,
    crowdLevel: 5,
    tags: ['美食', '徽菜', '小吃', '购物'],
    location: {
      lat: 30.2767,
      lng: 118.3356
    }
  },
  {
    id: 8,
    name: '青龙湾古戏台',
    description: '保存完好的古代戏台，定期有徽剧表演，展示传统戏曲艺术。',
    type: '人文景观',
    image: 'https://img.zcool.cn/community/01c9f55af3dd6ca80120a895e2a1c6.jpg@1280w_1l_2o_100sh.jpg',
    duration: 90,
    popularity: 3,
    crowdLevel: 4,
    tags: ['戏曲', '表演', '文化', '历史'],
    location: {
      lat: 30.2745,
      lng: 118.3378
    }
  },
  {
    id: 9,
    name: '青龙湾茶园',
    description: '山间茶园，可以参观茶叶种植和制作过程，品尝新鲜茶叶。',
    type: '自然景观',
    image: 'https://img.zcool.cn/community/01d9a55af3dd6ca801216518b6b7d4.jpg@1280w_1l_2o_100sh.jpg',
    duration: 60,
    popularity: 3,
    crowdLevel: 2,
    tags: ['茶园', '品茶', '自然', '体验'],
    location: {
      lat: 30.2812,
      lng: 118.3456
    }
  },
  {
    id: 10,
    name: '青龙湾手工艺坊',
    description: '可以参观和体验徽州传统手工艺制作，如木雕、竹编、徽墨等。',
    type: '人文景观',
    image: 'https://img.zcool.cn/community/01c9f55af3dd6ca80120a895e2a1c6.jpg@1280w_1l_2o_100sh.jpg',
    duration: 120,
    popularity: 4,
    crowdLevel: 3,
    tags: ['手工艺', '体验', '文化', '购物'],
    location: {
      lat: 30.2721,
      lng: 118.3398
    }
  }
];

// 用户偏好类型
export interface UserPreference {
  duration: number; // 总游览时间（小时）
  startTime: string; // 开始时间
  interests: string[]; // 兴趣标签
  avoidCrowds: boolean; // 是否避开人群
  includeFood: boolean; // 是否包含美食
  pace: 'relaxed' | 'moderate' | 'intensive'; // 游览节奏
  transportMode: 'walking' | 'cycling' | 'driving'; // 交通方式
}

// 行程项目类型
export interface ItineraryItem {
  time: string;
  attraction: Attraction;
  duration: number; // 分钟
  activity: string;
}

// 行程类型
export interface Itinerary {
  id: string;
  name: string;
  date: string;
  items: ItineraryItem[];
  totalDuration: number; // 总时长（分钟）
  distance: number; // 总距离（公里）
}

// 根据用户偏好生成行程
export const generateItinerary = (preferences: UserPreference): Itinerary => {
  // 根据用户兴趣筛选景点
  let filteredAttractions = [...attractions];
  
  // 如果用户有特定兴趣，按兴趣筛选
  if (preferences.interests.length > 0) {
    filteredAttractions = filteredAttractions.filter(attraction => 
      attraction.tags.some(tag => preferences.interests.includes(tag))
    );
  }
  
  // 如果用户想避开人群，优先选择人少的地方
  if (preferences.avoidCrowds) {
    filteredAttractions.sort((a, b) => a.crowdLevel - b.crowdLevel);
  } else {
    // 否则按受欢迎程度排序
    filteredAttractions.sort((a, b) => b.popularity - a.popularity);
  }
  
  // 如果用户想包含美食，确保美食街在列表中
  if (preferences.includeFood && !filteredAttractions.some(a => a.type === '美食')) {
    const foodSpot = attractions.find(a => a.type === '美食');
    if (foodSpot) {
      filteredAttractions.push(foodSpot);
    }
  }
  
  // 根据游览节奏调整每个景点的游览时间
  const paceFactor = preferences.pace === 'relaxed' ? 1.2 : 
                    preferences.pace === 'intensive' ? 0.8 : 1;
  
  // 计算可用的总时间（分钟）
  const totalAvailableMinutes = preferences.duration * 60;
  
  // 创建行程项目
  const items: ItineraryItem[] = [];
  let currentTime = new Date(`2023-01-01T${preferences.startTime}:00`);
  let remainingTime = totalAvailableMinutes;
  let totalDistance = 0;
  
  // 添加景点直到填满时间
  for (const attraction of filteredAttractions) {
    // 计算调整后的游览时间
    const adjustedDuration = Math.round(attraction.duration * paceFactor);
    
    // 如果剩余时间不足，跳过此景点
    if (remainingTime < adjustedDuration) {
      continue;
    }
    
    // 添加到行程
    items.push({
      time: currentTime.toTimeString().substring(0, 5),
      attraction,
      duration: adjustedDuration,
      activity: `游览${attraction.name}`
    });
    
    // 更新剩余时间和当前时间
    remainingTime -= adjustedDuration;
    currentTime = new Date(currentTime.getTime() + adjustedDuration * 60000);
    
    // 如果这不是最后一个景点，添加交通时间
    if (remainingTime > 0 && items.length > 0 && items.length < filteredAttractions.length) {
      // 模拟计算到下一个景点的距离和时间
      const travelTime = 15; // 假设平均15分钟
      const travelDistance = 1.2; // 假设平均1.2公里
      
      // 如果剩余时间不足以前往下一个景点，结束行程
      if (remainingTime < travelTime) {
        break;
      }
      
      // 添加交通时间
      remainingTime -= travelTime;
      currentTime = new Date(currentTime.getTime() + travelTime * 60000);
      totalDistance += travelDistance;
    }
    
    // 如果剩余时间不多，结束行程
    if (remainingTime < 30) {
      break;
    }
  }
  
  // 创建行程
  return {
    id: `itin-${Date.now()}`,
    name: `青龙湾${preferences.duration}小时游`,
    date: new Date().toISOString().split('T')[0],
    items,
    totalDuration: totalAvailableMinutes - remainingTime,
    distance: parseFloat(totalDistance.toFixed(1))
  };
};

// 一键寻徽功能 - 根据关键词匹配景点
export const findAttractionsByKeywords = (keywords: string[]): Attraction[] => {
  if (!keywords || keywords.length === 0) {
    return [];
  }
  
  // 将关键词转为小写
  const lowerKeywords = keywords.map(k => k.toLowerCase());
  
  // 匹配景点
  return attractions.filter(attraction => {
    // 检查名称、描述、类型和标签是否包含关键词
    return lowerKeywords.some(keyword => 
      attraction.name.toLowerCase().includes(keyword) ||
      attraction.description.toLowerCase().includes(keyword) ||
      attraction.type.toLowerCase().includes(keyword) ||
      attraction.tags.some(tag => tag.toLowerCase().includes(keyword))
    );
  });
};

// 推荐景点组合
export interface AttractionGroup {
  id: string;
  name: string;
  description: string;
  attractions: Attraction[];
  totalDuration: number; // 分钟
  tags: string[];
}

// 预定义的景点组合
export const attractionGroups: AttractionGroup[] = [
  {
    id: 'group-1',
    name: '徽州文化深度游',
    description: '深入了解徽州文化的精髓，体验传统徽派建筑和非物质文化遗产。',
    attractions: [
      attractions.find(a => a.id === 2)!,
      attractions.find(a => a.id === 4)!,
      attractions.find(a => a.id === 6)!,
      attractions.find(a => a.id === 8)!
    ],
    totalDuration: 330, // 5.5小时
    tags: ['文化', '历史', '建筑', '非遗']
  },
  {
    id: 'group-2',
    name: '青龙湾自然风光游',
    description: '欣赏青龙湾的自然美景，体验湖光山色和生态环境。',
    attractions: [
      attractions.find(a => a.id === 1)!,
      attractions.find(a => a.id === 3)!,
      attractions.find(a => a.id === 5)!,
      attractions.find(a => a.id === 9)!
    ],
    totalDuration: 285, // 4.75小时
    tags: ['自然', '风景', '湖泊', '摄影']
  },
  {
    id: 'group-3',
    name: '亲子互动体验游',
    description: '适合家庭出游，包含互动体验和亲子活动。',
    attractions: [
      attractions.find(a => a.id === 5)!,
      attractions.find(a => a.id === 6)!,
      attractions.find(a => a.id === 10)!,
      attractions.find(a => a.id === 7)!
    ],
    totalDuration: 390, // 6.5小时
    tags: ['亲子', '体验', '互动', '美食']
  },
  {
    id: 'group-4',
    name: '徽州美食文化游',
    description: '品尝正宗徽州美食，了解徽菜文化和饮食习俗。',
    attractions: [
      attractions.find(a => a.id === 7)!,
      attractions.find(a => a.id === 4)!,
      attractions.find(a => a.id === 9)!
    ],
    totalDuration: 240, // 4小时
    tags: ['美食', '文化', '品茶', '休闲']
  },
  {
    id: 'group-5',
    name: '青龙湾摄影精选游',
    description: '精选青龙湾最佳摄影点，捕捉最美徽州风光。',
    attractions: [
      attractions.find(a => a.id === 3)!,
      attractions.find(a => a.id === 1)!,
      attractions.find(a => a.id === 2)!,
      attractions.find(a => a.id === 5)!
    ],
    totalDuration: 315, // 5.25小时
    tags: ['摄影', '风景', '建筑', '自然']
  }
];

// 根据标签查找景点组合
export const findAttractionGroupsByTags = (tags: string[]): AttractionGroup[] => {
  if (!tags || tags.length === 0) {
    return attractionGroups;
  }
  
  // 将标签转为小写
  const lowerTags = tags.map(t => t.toLowerCase());
  
  // 匹配景点组合
  return attractionGroups.filter(group => {
    return lowerTags.some(tag => 
      group.tags.some(groupTag => groupTag.toLowerCase().includes(tag))
    );
  });
}; 