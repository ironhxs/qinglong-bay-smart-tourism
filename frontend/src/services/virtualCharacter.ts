/**
 * 虚拟角色互动服务
 * 实现虚拟角色对话功能，集成百度文心大模型API
 */

import aiService from './aiService';

// 虚拟角色信息
export interface VirtualCharacter {
  id: string;
  name: string;
  avatar: string;
  description: string;
  greeting: string;
}

// 小青徽虚拟角色
export const xiaoQingHui: VirtualCharacter = {
  id: 'xiaoqinghui',
  name: '小青徽',
  avatar: '/images/avatar-new.jpg',
  description: '青龙湾景区智能导游，精通徽州文化和青龙湾历史',
  greeting: '你好呀！我是小青徽，青龙湾的智能导游。很高兴为您介绍青龙湾的历史文化和自然风光。有什么我可以帮助您的吗？'
};

// 对话消息类型
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

// 预设问答对
const qaDatabase = [
  {
    keywords: ['青龙湾', '历史', '来历', '由来'],
    response: '青龙湾的历史可以追溯到明朝初期，当时这里是重要的水路交通枢纽。青龙湾因形似蜿蜒盘旋的青龙而得名，湾区水域开阔，风景秀丽，自古以来就是文人墨客吟咏的胜地。明清时期，这里商贾云集，是徽商的重要聚集地之一，为徽州文化的发展做出了重要贡献。'
  },
  {
    keywords: ['徽派', '建筑', '特色', '风格'],
    response: '徽派建筑是中国传统建筑的重要流派，以"三雕（木雕、石雕、砖雕）"、"三绝（徽墨、徽菜、徽剧）"闻名于世。徽派建筑的特点是马头墙高耸，飞檐翘角，雕梁画栋，布局严谨，讲究对称。青龙湾地区的徽派建筑保存完好，是研究徽州文化的重要实物资料。'
  },
  {
    keywords: ['生态', '环境', '自然', '动植物'],
    response: '青龙湾生态系统非常丰富，有多种珍稀动植物。湾区水质清澈，水生植物繁多，是多种鱼类和水禽的栖息地。周边山林茂密，植被覆盖率高，形成了良好的生态屏障。当地政府近年来加强了生态保护力度，实施了一系列环境治理措施，使青龙湾的生态环境得到了有效改善。'
  },
  {
    keywords: ['民俗', '文化', '传统', '习俗', '节日'],
    response: '青龙湾地区的民俗文化丰富多彩，包括徽州婚俗、祭祀礼仪、传统节庆等。当地的手工艺也非常发达，如徽墨制作、木雕、竹编等。此外，徽州菜是中国八大菜系之一，以烹饪技艺精湛、注重原料鲜活、口味醇厚著称。每年农历二月初二，当地还会举办传统的"龙抬头"民俗活动，祈求丰收和平安。'
  },
  {
    keywords: ['景点', '推荐', '游览', '参观'],
    response: '青龙湾有许多值得游览的景点。首先是青龙湾码头，这里可以乘船游览整个湾区；其次是生态观景台，可以俯瞰青龙湾全景；文化长廊展示了丰富的徽州文化；徽派建筑群保存了完好的传统民居；青龙湖水域开阔，风景秀丽；非遗展示中心可以了解当地的非物质文化遗产。建议您可以根据自己的兴趣选择游览路线。'
  },
  {
    keywords: ['美食', '特产', '徽菜', '小吃'],
    response: '青龙湾地区的美食以徽菜为主，著名菜品包括毛豆腐、臭鳜鱼、徽州烧饼、石耳炖鸡等。当地特产有徽墨、歙砚、徽茶、黄山毛峰等。如果您喜欢美食，可以去青龙湾美食街品尝正宗的徽州菜，那里有许多百年老店，传承了正宗的徽州烹饪技艺。'
  },
  {
    keywords: ['交通', '怎么去', '路线', '到达'],
    response: '前往青龙湾有多种交通方式。如果您自驾，可以导航至"青龙湾景区"；乘坐公共交通，可以在市区乘坐5路或8路公交车直达景区；也可以选择打车或参加旅行团。景区内提供电瓶车服务，方便游客游览各个景点。'
  },
  {
    keywords: ['门票', '价格', '费用', '开放时间'],
    response: '青龙湾景区门票价格为成人票80元/人，学生、老人和军人等特殊群体可享受半价优惠。景区开放时间为早上8:00至晚上17:30（冬季）或18:30（夏季）。如果您计划多次前来，也可以选择购买年票，更为经济实惠。'
  },
  {
    keywords: ['住宿', '酒店', '客栈', '民宿'],
    response: '青龙湾周边有多种住宿选择，包括星级酒店、特色民宿和传统客栈。如果您想体验徽派建筑的魅力，推荐入住景区内的徽派特色民宿；如果追求舒适便利，可以选择景区附近的现代化酒店。旺季时建议提前预订，以确保有理想的住宿条件。'
  },
  {
    keywords: ['天气', '季节', '最佳', '气候'],
    response: '青龙湾四季皆宜游览，但最佳旅游季节是春季（3-5月）和秋季（9-11月），此时气候宜人，景色优美。夏季（6-8月）气温较高但湾区水域有降温效果，冬季（12-2月）可能会下雪，别有一番风情。建议您根据自己的偏好选择合适的季节前来。'
  },
  // 新增的问答对
  {
    keywords: ['摄影', '拍照', '取景', '照片'],
    response: '青龙湾是摄影爱好者的天堂！最佳摄影点包括：高处的生态观景台，可俯瞰整个湾区；青龙古桥，尤其是晨雾缭绕时分；徽派建筑群，马头墙和雕刻艺术是绝佳素材；清晨的青龙湖，水雾升腾，景色如画。建议携带广角和长焦镜头，清晨和黄昏是光线最佳的时段。'
  },
  {
    keywords: ['AR', '增强现实', '虚拟现实', 'VR'],
    response: '青龙湾景区提供AR增强现实体验服务！您可以在游客中心下载我们的AR应用，或者使用景区内的AR设备，体验"虚实徽境"。通过AR技术，您可以看到历史上的青龙湾场景，了解徽派建筑的构造，甚至与虚拟的历史人物互动。这是一种融合科技与传统文化的全新体验方式。'
  },
  {
    keywords: ['徽墨', '制作', '工艺'],
    response: '徽墨是安徽徽州的传统特产，与"宣纸"、"端砚"、"湖笔"并称为中国"文房四宝"。青龙湾非遗展示中心有徽墨制作工艺的展示。传统徽墨主要以松烟为原料，经过选料、凝烟、调胶、和墨、压型、雕饰、装盒等复杂工序制成。徽墨不仅实用，其精美的雕饰也具有很高的艺术价值，是很好的收藏品和馈赠礼品。'
  },
  {
    keywords: ['马头墙', '火墙', '徽州建筑'],
    response: '马头墙是徽派建筑最显著的特征之一，也被称为"火墙"。它形似马头，高高耸立于屋顶两侧，不仅具有防火隔火的实用功能，还有很高的艺术价值。青龙湾的徽派建筑群中保存了众多风格各异的马头墙，有些还配有精美的砖雕和石雕装饰，展现了徽州工匠的高超技艺。导游推荐您在徽派古建筑区细细欣赏这些马头墙的造型和装饰。'
  },
  {
    keywords: ['徽剧', '表演', '戏曲', '文化'],
    response: '徽剧是安徽的地方戏曲，也是京剧的重要源头之一。在青龙湾文化广场，每天都有定时的徽剧表演。徽剧以高亢激昂的唱腔、夸张的表情和动作、精美的服饰著称。经典剧目包括《女驸马》、《打金枝》等。如果您对中国传统戏曲感兴趣，千万不要错过这场视听盛宴。表演时间可以在游客中心查询。'
  },
  {
    keywords: ['青龙湾', '名字', '得名', '为什么叫'],
    response: '青龙湾的名字有着美丽的传说。据说古时这里有一条神秘的青龙出没，它守护着湾区的平安与丰收。湾区的形状恰似一条蜿蜒盘旋的龙，从高处俯瞰，青龙湾就像是一条青龙潜伏在碧波之中。另一种说法是因为这里的水质清澈如玉，波光粼粼，在阳光照耀下泛着青色的光芒，远远看去如同一条青龙在水中游动，因此得名青龙湾。'
  },
  {
    keywords: ['徽州', '历史', '文化', '地位'],
    response: '徽州是中国历史文化名城，自古就是文化昌盛、商业发达的重要地区。明清时期，徽商足迹遍布全国，素有"无徽不成镇"之说。徽州文化以儒家思想为核心，注重教育，文人辈出，形成了独特的区域文化。徽州还是中国传统版画、徽墨、徽派建筑等艺术的发源地。青龙湾作为徽州文化的重要载体，完整保存了这一区域的历史文化精髓。'
  },
  {
    keywords: ['青龙湾', '规模', '有多大', '面积'],
    response: '青龙湾景区总面积约15平方公里，其中水域面积约5平方公里。景区内包括青龙湖、徽派建筑群、文化长廊、非遗展示中心等多个景点。步行游览主要景点需要约3-4小时，如果希望深入体验，建议安排一整天的时间。景区内提供电瓶车服务，可以节省体力，尤其适合老人和儿童。'
  },
  {
    keywords: ['智能', '科技', '设施', '现代化'],
    response: '青龙湾景区融合了传统文化与现代科技。我们提供智能导览系统，包括AR增强现实体验、智能语音导览、虚拟角色互动等。景区内设有智能信息亭，提供实时信息查询、线路规划等服务。我们还开发了"青龙湾智游"APP，提供智能行程规划、实时人流监测、电子讲解等功能，让您的游览更加便捷高效。'
  },
  {
    keywords: ['儿童', '小朋友', '亲子', '家庭'],
    response: '青龙湾非常适合家庭亲子游！景区内设有儿童互动区，包括徽州文化体验馆、生态科普馆等。在这里，孩子们可以参与徽墨制作、徽派木雕体验、生态认知等互动活动。我们还有专为儿童设计的AR互动游戏，让孩子们在玩乐中了解徽州文化。每逢节假日，景区还会举办特色活动，如古装体验、非遗手工制作等，深受家庭游客喜爱。'
  }
];

// 默认回复
const defaultResponses = [
  '对不起，我还不太理解您的问题。您可以换个方式提问，或者询问关于青龙湾的历史、文化、景点等方面的问题。',
  '这个问题有点复杂，我需要进一步学习。您可以询问我关于青龙湾的基本信息，我会尽力回答。',
  '作为青龙湾的虚拟导游，我主要擅长回答关于青龙湾的历史、文化、景点、美食等方面的问题。请问您对哪方面感兴趣？',
  '我目前的知识有限，无法回答这个问题。您可以咨询青龙湾的工作人员获取更详细的信息。',
  '您的问题很有趣，不过有点超出我的知识范围。您可以问我关于青龙湾景区的问题，我会尽力为您解答。',
  '感谢您的提问！这个问题超出了我的知识范围，建议您向景区工作人员咨询或查阅相关资料获取准确信息。您可以继续问我关于青龙湾的其他问题。',
  '这是个好问题，但我现在还不能给您一个确切的答案。您可以尝试问我关于青龙湾景点、历史、美食或者住宿方面的问题，我会尽力提供帮助。'
];

// 获取随机默认回复
const getRandomDefaultResponse = (): string => {
  const index = Math.floor(Math.random() * defaultResponses.length);
  return defaultResponses[index];
};

// 徽州特色用语，增加回复的地方特色
const huizhouPhrases = [
  '老板娘~',
  '侬好啊！',
  '欢迎来到青龙湾，走过路过莫错过哦~',
  '不要错过哩！',
  '再说更多哩！',
  '徽州人都这么讲究的~',
  '恁是晓得的！',
  '来都来了，不看看就可惜了！',
  '这可是青龙湾的一绝哩！',
  '老味道，好滋味！'
];

// 随机获取徽州特色用语
const getRandomHuizhouPhrase = (): string => {
  const index = Math.floor(Math.random() * huizhouPhrases.length);
  return huizhouPhrases[index];
};

// 根据用户输入生成回复（本地逻辑，作为API调用失败的备选方案）
const generateLocalResponse = (userInput: string): string => {
  // 转换为小写以便匹配
  const input = userInput.toLowerCase();
  
  // 检查是否包含问候语
  if (input.includes('你好') || input.includes('您好') || input.includes('早上好') || 
      input.includes('下午好') || input.includes('晚上好') || input.includes('hi') || 
      input.includes('hello')) {
    // 50%概率添加徽州特色用语
    return Math.random() > 0.5 
      ? `${getRandomHuizhouPhrase()} 你好！很高兴为您服务。请问有什么可以帮助您的吗？`
      : '你好！很高兴为您服务。请问有什么可以帮助您的吗？';
  }
  
  // 检查是否询问虚拟角色信息
  if (input.includes('你是谁') || input.includes('你叫什么') || input.includes('你的名字')) {
    return `我是${xiaoQingHui.name}，${xiaoQingHui.description}。很高兴认识您！`;
  }
  
  // 检查是否是感谢
  if (input.includes('谢谢') || input.includes('感谢')) {
    return Math.random() > 0.5
      ? `不客气！${getRandomHuizhouPhrase()} 为您服务是我的荣幸。还有其他问题吗？`
      : '不客气！为您服务是我的荣幸。还有其他问题吗？';
  }
  
  // 检查是否是告别
  if (input.includes('再见') || input.includes('拜拜') || input.includes('goodbye') || 
      input.includes('bye')) {
    return Math.random() > 0.5
      ? `再见！${getRandomHuizhouPhrase()} 祝您在青龙湾玩得愉快！欢迎随时向我咨询。`
      : '再见！祝您在青龙湾玩得愉快！欢迎随时向我咨询。';
  }
  
  // 匹配预设问答
  for (const qa of qaDatabase) {
    // 检查是否包含关键词
    if (qa.keywords.some(keyword => input.includes(keyword))) {
      // 30%概率在回答末尾添加徽州特色用语
      return Math.random() > 0.7
        ? `${qa.response} ${getRandomHuizhouPhrase()}`
        : qa.response;
    }
  }
  
  // 如果没有匹配到，返回默认回复
  return getRandomDefaultResponse();
};

// 根据用户输入生成回复（使用AI API）
export const generateResponse = async (userInput: string, chatHistory: Message[] = []): Promise<string> => {
  try {
    // 尝试使用AI服务生成回复
    const aiMessages = chatHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.content
    }));
    
    const response = await aiService.chatWithVirtualGuide(userInput, aiMessages);
    return response;
  } catch (error) {
    console.error('AI服务生成回复失败，使用本地逻辑回退:', error);
    // 如果API调用失败，回退到本地逻辑
    return generateLocalResponse(userInput);
  }
};

// 创建新的对话
export const createConversation = (): Message[] => {
  return [
    {
      role: 'assistant',
      content: xiaoQingHui.greeting,
      timestamp: Date.now()
    }
  ];
};

// 添加用户消息并获取回复
export const sendMessage = async (conversation: Message[], userMessage: string): Promise<Message[]> => {
  // 添加用户消息
  const updatedConversation: Message[] = [
    ...conversation,
    {
      role: 'user' as const,
      content: userMessage,
      timestamp: Date.now()
    }
  ];
  
  try {
    // 生成回复
    const response = await generateResponse(userMessage, updatedConversation);
    
    // 添加虚拟角色回复
    updatedConversation.push({
      role: 'assistant' as const,
      content: response,
      timestamp: Date.now()
    });
    
    return updatedConversation;
  } catch (error) {
    console.error('生成回复失败:', error);
    
    // 如果失败，添加一个友好的错误消息
    updatedConversation.push({
      role: 'assistant' as const,
      content: '抱歉，我暂时遇到了一些问题，无法正常回复。请稍后再试或者咨询景区工作人员。',
      timestamp: Date.now()
    });
    
    return updatedConversation;
  }
}; 