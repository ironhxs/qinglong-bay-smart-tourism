/**
 * 游客行为洞察服务
 * 提供游客行为数据分析和可视化功能
 */

// 游客类型
export type VisitorType = 'family' | 'couple' | 'individual' | 'group' | 'business';

// 游客来源
export type VisitorSource = 'local' | 'domestic' | 'international';

// 年龄段
export type AgeGroup = '0-18' | '19-30' | '31-45' | '46-60' | '60+';

// 访问时段
export type TimeSlot = 'morning' | 'afternoon' | 'evening';

// 游客数据点
export interface VisitorDataPoint {
  date: string;
  count: number;
  type?: VisitorType;
  source?: VisitorSource;
  ageGroup?: AgeGroup;
  timeSlot?: TimeSlot;
}

// 景点访问数据
export interface AttractionVisit {
  attractionId: number;
  attractionName: string;
  visitCount: number;
  averageStayTime: number; // 分钟
  satisfaction: number; // 1-5
  peakHours: string[];
}

// 消费数据
export interface ConsumptionData {
  category: string;
  amount: number;
  percentage: number;
}

// 游客行为数据
export interface VisitorBehavior {
  id: string;
  visitorType: VisitorType;
  visitorSource: VisitorSource;
  ageGroup: AgeGroup;
  visitDate: string;
  stayDuration: number; // 小时
  visitedAttractions: number[];
  consumptionAmount: number;
  consumptionBreakdown: ConsumptionData[];
  feedbackRating: number; // 1-5
  feedbackComments?: string;
}

// 游客行为趋势
export interface VisitorTrend {
  timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly';
  data: {
    label: string;
    visitors: number;
    revenue: number;
    satisfaction: number;
  }[];
}

// 模拟游客数量数据（过去30天）
export const visitorCountData: VisitorDataPoint[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  
  // 生成随机数量，周末人数更多
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const baseCount = isWeekend ? 800 : 400;
  const randomFactor = Math.random() * 0.4 + 0.8; // 0.8 - 1.2
  
  return {
    date: date.toISOString().split('T')[0],
    count: Math.round(baseCount * randomFactor)
  };
});

// 游客类型分布
export const visitorTypeDistribution = [
  { type: 'family', percentage: 45 },
  { type: 'couple', percentage: 25 },
  { type: 'individual', percentage: 15 },
  { type: 'group', percentage: 10 },
  { type: 'business', percentage: 5 }
];

// 游客来源分布
export const visitorSourceDistribution = [
  { source: 'local', percentage: 30 },
  { source: 'domestic', percentage: 65 },
  { source: 'international', percentage: 5 }
];

// 年龄分布
export const ageGroupDistribution = [
  { group: '0-18', percentage: 15 },
  { group: '19-30', percentage: 30 },
  { group: '31-45', percentage: 25 },
  { group: '46-60', percentage: 20 },
  { group: '60+', percentage: 10 }
];

// 访问时段分布
export const timeSlotDistribution = [
  { slot: 'morning', percentage: 35 },
  { slot: 'afternoon', percentage: 50 },
  { slot: 'evening', percentage: 15 }
];

// 景点访问数据
export const attractionVisitData: AttractionVisit[] = [
  {
    attractionId: 1,
    attractionName: '青龙湾码头',
    visitCount: 1200,
    averageStayTime: 55,
    satisfaction: 4.7,
    peakHours: ['10:00', '15:00']
  },
  {
    attractionId: 2,
    attractionName: '徽派建筑群',
    visitCount: 950,
    averageStayTime: 85,
    satisfaction: 4.8,
    peakHours: ['11:00', '14:00']
  },
  {
    attractionId: 3,
    attractionName: '青龙湾生态观景台',
    visitCount: 1050,
    averageStayTime: 40,
    satisfaction: 4.9,
    peakHours: ['9:00', '16:00']
  },
  {
    attractionId: 4,
    attractionName: '徽州文化长廊',
    visitCount: 780,
    averageStayTime: 65,
    satisfaction: 4.5,
    peakHours: ['10:30', '14:30']
  },
  {
    attractionId: 5,
    attractionName: '青龙湖',
    visitCount: 850,
    averageStayTime: 110,
    satisfaction: 4.6,
    peakHours: ['9:30', '15:30']
  },
  {
    attractionId: 6,
    attractionName: '非遗展示中心',
    visitCount: 720,
    averageStayTime: 95,
    satisfaction: 4.7,
    peakHours: ['11:30', '15:00']
  },
  {
    attractionId: 7,
    attractionName: '青龙湾美食街',
    visitCount: 1350,
    averageStayTime: 105,
    satisfaction: 4.8,
    peakHours: ['12:00', '18:00']
  },
  {
    attractionId: 8,
    attractionName: '青龙湾古戏台',
    visitCount: 580,
    averageStayTime: 75,
    satisfaction: 4.4,
    peakHours: ['14:00', '16:30']
  },
  {
    attractionId: 9,
    attractionName: '青龙湾茶园',
    visitCount: 620,
    averageStayTime: 65,
    satisfaction: 4.5,
    peakHours: ['10:00', '15:30']
  },
  {
    attractionId: 10,
    attractionName: '青龙湾手工艺坊',
    visitCount: 680,
    averageStayTime: 115,
    satisfaction: 4.6,
    peakHours: ['11:00', '16:00']
  }
];

// 消费数据
export const consumptionData: ConsumptionData[] = [
  { category: '门票', amount: 450000, percentage: 30 },
  { category: '餐饮', amount: 375000, percentage: 25 },
  { category: '购物', amount: 300000, percentage: 20 },
  { category: '体验活动', amount: 225000, percentage: 15 },
  { category: '住宿', amount: 150000, percentage: 10 }
];

// 游客行为趋势（月度）
export const monthlyTrend: VisitorTrend = {
  timeframe: 'monthly',
  data: [
    { label: '1月', visitors: 12000, revenue: 960000, satisfaction: 4.5 },
    { label: '2月', visitors: 15000, revenue: 1200000, satisfaction: 4.6 },
    { label: '3月', visitors: 18000, revenue: 1440000, satisfaction: 4.6 },
    { label: '4月', visitors: 22000, revenue: 1760000, satisfaction: 4.7 },
    { label: '5月', visitors: 25000, revenue: 2000000, satisfaction: 4.7 },
    { label: '6月', visitors: 28000, revenue: 2240000, satisfaction: 4.8 },
    { label: '7月', visitors: 32000, revenue: 2560000, satisfaction: 4.8 },
    { label: '8月', visitors: 35000, revenue: 2800000, satisfaction: 4.7 },
    { label: '9月', visitors: 30000, revenue: 2400000, satisfaction: 4.8 },
    { label: '10月', visitors: 28000, revenue: 2240000, satisfaction: 4.7 },
    { label: '11月', visitors: 20000, revenue: 1600000, satisfaction: 4.6 },
    { label: '12月', visitors: 15000, revenue: 1200000, satisfaction: 4.5 }
  ]
};

// 游客满意度因素
export const satisfactionFactors = [
  { factor: '景点环境', rating: 4.8 },
  { factor: '服务质量', rating: 4.6 },
  { factor: '交通便利', rating: 4.3 },
  { factor: '价格合理', rating: 4.2 },
  { factor: '文化体验', rating: 4.9 },
  { factor: '餐饮品质', rating: 4.7 },
  { factor: '住宿舒适', rating: 4.5 },
  { factor: '购物体验', rating: 4.4 }
];

// 游客建议词云数据
export const visitorFeedbackKeywords = [
  { text: '文化体验', value: 100 },
  { text: '自然风光', value: 85 },
  { text: '徽派建筑', value: 80 },
  { text: '美食', value: 75 },
  { text: '服务态度', value: 70 },
  { text: '交通便利', value: 65 },
  { text: '价格', value: 60 },
  { text: '非遗', value: 55 },
  { text: '导游讲解', value: 50 },
  { text: '住宿', value: 45 },
  { text: '购物', value: 40 },
  { text: '停车', value: 35 },
  { text: '厕所', value: 30 },
  { text: '标识', value: 25 },
  { text: '休息区', value: 20 }
];

// 获取游客数量趋势
export const getVisitorTrend = (days: number = 30): VisitorDataPoint[] => {
  return visitorCountData.slice(-days);
};

// 获取景点受欢迎度排名
export const getAttractionRanking = (): AttractionVisit[] => {
  return [...attractionVisitData].sort((a, b) => b.visitCount - a.visitCount);
};

// 获取游客满意度最高的景点
export const getHighestSatisfactionAttractions = (limit: number = 3): AttractionVisit[] => {
  return [...attractionVisitData]
    .sort((a, b) => b.satisfaction - a.satisfaction)
    .slice(0, limit);
};

// 获取平均停留时间最长的景点
export const getLongestStayAttractions = (limit: number = 3): AttractionVisit[] => {
  return [...attractionVisitData]
    .sort((a, b) => b.averageStayTime - a.averageStayTime)
    .slice(0, limit);
};

// 生成洞察报告
export const generateInsightsReport = (): string => {
  // 获取数据
  const visitorRanking = getAttractionRanking();
  const topAttraction = visitorRanking[0];
  const satisfactionAttractions = getHighestSatisfactionAttractions(1)[0];
  const longestStayAttractions = getLongestStayAttractions(1)[0];
  
  // 计算总游客数
  const totalVisitors = visitorCountData.reduce((sum, item) => sum + item.count, 0);
  
  // 计算平均满意度
  const avgSatisfaction = attractionVisitData.reduce((sum, item) => sum + item.satisfaction, 0) / attractionVisitData.length;
  
  // 生成报告（HTML格式）
  return `
<h1>青龙湾游客行为洞察报告</h1>

<h2>游客概况</h2>
<p>过去30天总游客量：${totalVisitors.toLocaleString()} 人次<br>
主要游客类型：家庭游客 (${visitorTypeDistribution[0].percentage}%)<br>
主要游客来源：国内游客 (${visitorSourceDistribution[1].percentage}%)<br>
主要年龄段：19-30岁 (${ageGroupDistribution[1].percentage}%)</p>

<h2>热门景点分析</h2>
<p>最受欢迎景点：${topAttraction.attractionName}（${topAttraction.visitCount.toLocaleString()}人次）<br>
满意度最高景点：${satisfactionAttractions.attractionName}（${satisfactionAttractions.satisfaction}分）<br>
平均停留时间最长景点：${longestStayAttractions.attractionName}（${longestStayAttractions.averageStayTime}分钟）</p>

<h2>消费行为分析</h2>
<p>人均消费：约320元<br>
主要消费项目：${consumptionData[0].category}（${consumptionData[0].percentage}%）</p>

<h2>满意度分析</h2>
<p>整体满意度：${avgSatisfaction.toFixed(1)}分（满分5分）<br>
最受好评方面：${satisfactionFactors[0].factor}（${satisfactionFactors[0].rating}分）<br>
需改进方面：${satisfactionFactors.sort((a, b) => a.rating - b.rating)[0].factor}（${satisfactionFactors.sort((a, b) => a.rating - b.rating)[0].rating}分）</p>

<h2>建议与展望</h2>
<ol>
  <li>针对${visitorTypeDistribution[0].type === 'family' ? '家庭游客' : '其他游客'}设计更多互动体验活动</li>
  <li>增加${satisfactionFactors.sort((a, b) => a.rating - b.rating)[0].factor}相关设施与服务</li>
  <li>优化${topAttraction.attractionName}的游览路线，缓解高峰期拥堵情况</li>
  <li>开发更多${ageGroupDistribution[1].group}年龄段喜爱的文创产品和体验活动</li>
</ol>
  `;
}; 