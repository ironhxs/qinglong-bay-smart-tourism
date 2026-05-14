/**
 * 生态系统服务
 * 提供环境数据可视化和生态保护行动指引
 */

// 环境数据类型
export interface EnvironmentalData {
  timestamp: string;
  airQuality: {
    aqi: number;
    pm25: number;
    pm10: number;
    o3: number;
    no2: number;
    so2: number;
    co: number;
    level: 'excellent' | 'good' | 'moderate' | 'poor' | 'very_poor' | 'hazardous';
  };
  waterQuality: {
    ph: number;
    dissolvedOxygen: number; // mg/L
    turbidity: number; // NTU
    temperature: number; // °C
    conductivity: number; // μS/cm
    level: 'excellent' | 'good' | 'moderate' | 'poor' | 'very_poor';
  };
  biodiversity: {
    floraSpecies: number;
    faunaSpecies: number;
    endangeredSpecies: number;
    invasiveSpecies: number;
    conservationIndex: number; // 0-100
  };
  weather: {
    temperature: number; // °C
    humidity: number; // %
    windSpeed: number; // km/h
    windDirection: string; // N, NE, E, SE, S, SW, W, NW
    precipitation: number; // mm
    uvIndex: number; // 0-11+
  };
}

// 物种信息
export interface Species {
  id: string;
  name: string;
  scientificName: string;
  category: 'plant' | 'animal' | 'fungus' | 'microorganism';
  conservationStatus: 'least_concern' | 'near_threatened' | 'vulnerable' | 'endangered' | 'critically_endangered';
  description: string;
  habitat: string;
  imageUrl: string;
}

// 生态保护行动
export interface ConservationAction {
  id: string;
  title: string;
  description: string;
  category: 'habitat_protection' | 'species_conservation' | 'pollution_control' | 'education' | 'sustainable_development';
  difficulty: 'easy' | 'moderate' | 'challenging';
  impact: 'low' | 'medium' | 'high';
  participants: number;
  duration: string; // 例如："2小时", "1天", "持续进行"
  location: string;
  imageUrl: string;
  contactInfo?: string;
}

// 环境事件
export interface EnvironmentalEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  type: 'cleanup' | 'education' | 'planting' | 'monitoring' | 'workshop';
  organizer: string;
  contactEmail: string;
  registrationUrl?: string;
  imageUrl: string;
}

// 生成过去24小时的环境数据
export const generateHourlyEnvironmentalData = (): EnvironmentalData[] => {
  const data: EnvironmentalData[] = [];
  const now = new Date();
  
  for (let i = 0; i < 24; i++) {
    const timestamp = new Date(now);
    timestamp.setHours(now.getHours() - (23 - i));
    
    // 生成随机但合理的数据
    const hourOfDay = timestamp.getHours();
    const isDaytime = hourOfDay >= 6 && hourOfDay <= 18;
    
    // AQI通常在白天较高
    const baseAqi = isDaytime ? 50 : 35;
    const aqi = baseAqi + Math.floor(Math.random() * 20);
    
    // 水温通常在下午较高
    const baseWaterTemp = 18;
    const waterTempVariation = isDaytime ? 3 : 0;
    const waterTemperature = baseWaterTemp + Math.random() * waterTempVariation;
    
    // 空气温度变化更大
    const baseAirTemp = isDaytime ? 22 : 15;
    const airTempVariation = isDaytime ? 5 : 3;
    const airTemperature = baseAirTemp + Math.random() * airTempVariation;
    
    // 生成数据点
    data.push({
      timestamp: timestamp.toISOString(),
      airQuality: {
        aqi,
        pm25: aqi * 0.7 + Math.random() * 5,
        pm10: aqi * 1.2 + Math.random() * 8,
        o3: isDaytime ? 40 + Math.random() * 20 : 20 + Math.random() * 15,
        no2: 15 + Math.random() * 10,
        so2: 5 + Math.random() * 5,
        co: 0.5 + Math.random() * 0.3,
        level: aqi <= 50 ? 'excellent' : aqi <= 100 ? 'good' : aqi <= 150 ? 'moderate' : aqi <= 200 ? 'poor' : aqi <= 300 ? 'very_poor' : 'hazardous'
      },
      waterQuality: {
        ph: 6.5 + Math.random() * 1.5,
        dissolvedOxygen: 7 + Math.random() * 2,
        turbidity: 3 + Math.random() * 2,
        temperature: waterTemperature,
        conductivity: 300 + Math.random() * 100,
        level: Math.random() > 0.8 ? 'moderate' : Math.random() > 0.4 ? 'good' : 'excellent'
      },
      biodiversity: {
        floraSpecies: 120 + Math.floor(Math.random() * 10),
        faunaSpecies: 85 + Math.floor(Math.random() * 8),
        endangeredSpecies: 12 + Math.floor(Math.random() * 3),
        invasiveSpecies: 4 + Math.floor(Math.random() * 2),
        conservationIndex: 75 + Math.floor(Math.random() * 10)
      },
      weather: {
        temperature: airTemperature,
        humidity: 60 + Math.random() * 20,
        windSpeed: 5 + Math.random() * 10,
        windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
        precipitation: Math.random() > 0.8 ? Math.random() * 5 : 0,
        uvIndex: isDaytime ? 3 + Math.floor(Math.random() * 5) : 0
      }
    });
  }
  
  return data;
};

// 青龙湾特色物种数据
export const speciesData: Species[] = [
  {
    id: 'sp-1',
    name: '青龙湾睡莲',
    scientificName: 'Nymphaea qinglongwanensis',
    category: 'plant',
    conservationStatus: 'vulnerable',
    description: '青龙湾特有的睡莲品种，花朵呈淡青色，花期较长，是湖区重要的水生植物。',
    habitat: '青龙湾湖区浅水区域',
    imageUrl: 'https://img.zcool.cn/community/01a0a75af3dd6ca801216518714fca.jpg@1280w_1l_2o_100sh.jpg'
  },
  {
    id: 'sp-2',
    name: '徽州斑鸠',
    scientificName: 'Streptopelia chinensis huizhouensis',
    category: 'animal',
    conservationStatus: 'near_threatened',
    description: '徽州地区特有的斑鸠亚种，体型略小，羽毛带有独特的花纹，叫声清脆悦耳。',
    habitat: '青龙湾周边的林地和农田',
    imageUrl: 'https://img.zcool.cn/community/01d6f55af3dd6ca801216518a0a0d6.jpg@1280w_1l_2o_100sh.jpg'
  },
  {
    id: 'sp-3',
    name: '青龙湾鲤鱼',
    scientificName: 'Cyprinus carpio qinglongwanensis',
    category: 'animal',
    conservationStatus: 'least_concern',
    description: '青龙湾特有的鲤鱼品种，体色鲜艳，生长速度快，肉质鲜美，是当地重要的食用鱼类。',
    habitat: '青龙湾湖区中深水区域',
    imageUrl: 'https://img.zcool.cn/community/01c9f55af3dd6ca80120a895e2a1c6.jpg@1280w_1l_2o_100sh.jpg'
  },
  {
    id: 'sp-4',
    name: '徽州金线莲',
    scientificName: 'Anoectochilus huizhouensis',
    category: 'plant',
    conservationStatus: 'endangered',
    description: '徽州地区特有的兰科植物，叶面有金色脉络，具有较高的药用价值，数量稀少。',
    habitat: '青龙湾周边山区的阴湿林下',
    imageUrl: 'https://img.zcool.cn/community/0194f05e62f130a801216518a0cd65.jpg@1280w_1l_2o_100sh.jpg'
  },
  {
    id: 'sp-5',
    name: '青龙湾蜻蜓',
    scientificName: 'Orthetrum qinglongwanense',
    category: 'animal',
    conservationStatus: 'vulnerable',
    description: '青龙湾特有的蜻蜓品种，翅膀呈现淡青色，飞行敏捷，是湖区生态系统的重要成员。',
    habitat: '青龙湾湖区及周边湿地',
    imageUrl: 'https://img.zcool.cn/community/031e1b55af3c0b000001bf72b87c65.jpg@1280w_1l_2o_100sh.jpg'
  }
];

// 生态保护行动数据
export const conservationActions: ConservationAction[] = [
  {
    id: 'action-1',
    title: '青龙湾湖区清洁行动',
    description: '组织志愿者清理湖区垃圾，保护水质和水生生物栖息环境。',
    category: 'pollution_control',
    difficulty: 'easy',
    impact: 'medium',
    participants: 50,
    duration: '3小时',
    location: '青龙湾码头集合',
    imageUrl: 'https://img.zcool.cn/community/01a0a75af3dd6ca801216518714fca.jpg@1280w_1l_2o_100sh.jpg',
    contactInfo: 'conservation@qinglongwan.org'
  },
  {
    id: 'action-2',
    title: '徽州金线莲保护计划',
    description: '在适宜区域种植徽州金线莲，建立保护区，监测生长情况。',
    category: 'species_conservation',
    difficulty: 'challenging',
    impact: 'high',
    participants: 20,
    duration: '长期项目',
    location: '青龙湾周边山区',
    imageUrl: 'https://img.zcool.cn/community/0194f05e62f130a801216518a0cd65.jpg@1280w_1l_2o_100sh.jpg',
    contactInfo: 'plants@qinglongwan.org'
  },
  {
    id: 'action-3',
    title: '青龙湾生态监测志愿者计划',
    description: '招募志愿者定期监测湖区水质、空气质量和生物多样性变化。',
    category: 'education',
    difficulty: 'moderate',
    impact: 'medium',
    participants: 30,
    duration: '每月一次',
    location: '青龙湾生态站',
    imageUrl: 'https://img.zcool.cn/community/031e1b55af3c0b000001bf72b87c65.jpg@1280w_1l_2o_100sh.jpg',
    contactInfo: 'volunteer@qinglongwan.org'
  },
  {
    id: 'action-4',
    title: '可持续旅游发展研讨会',
    description: '探讨如何在发展旅游业的同时保护青龙湾的自然环境和生态系统。',
    category: 'sustainable_development',
    difficulty: 'moderate',
    impact: 'high',
    participants: 100,
    duration: '1天',
    location: '青龙湾游客中心',
    imageUrl: 'https://img.zcool.cn/community/01d9a55af3dd6ca801216518b6b7d4.jpg@1280w_1l_2o_100sh.jpg',
    contactInfo: 'tourism@qinglongwan.org'
  },
  {
    id: 'action-5',
    title: '青龙湾周边植树活动',
    description: '在湖区周边种植本地树种，改善生态环境，防止水土流失。',
    category: 'habitat_protection',
    difficulty: 'easy',
    impact: 'high',
    participants: 200,
    duration: '1天',
    location: '青龙湾北岸',
    imageUrl: 'https://img.zcool.cn/community/01d6f55af3dd6ca801216518a0a0d6.jpg@1280w_1l_2o_100sh.jpg',
    contactInfo: 'planting@qinglongwan.org'
  }
];

// 环境事件数据
export const environmentalEvents: EnvironmentalEvent[] = [
  {
    id: 'event-1',
    title: '2023青龙湾生态日',
    description: '通过各种活动和展览，提高公众对青龙湾生态系统的认识和保护意识。',
    date: '2023-10-22',
    location: '青龙湾游客中心',
    type: 'education',
    organizer: '青龙湾管理委员会',
    contactEmail: 'events@qinglongwan.org',
    registrationUrl: 'https://qinglongwan.org/events/eco-day-2023',
    imageUrl: 'https://img.zcool.cn/community/01a0a75af3dd6ca801216518714fca.jpg@1280w_1l_2o_100sh.jpg'
  },
  {
    id: 'event-2',
    title: '徽州植物调查工作坊',
    description: '学习识别徽州地区的特有植物，参与植物多样性调查。',
    date: '2023-11-05',
    location: '青龙湾生态站',
    type: 'workshop',
    organizer: '徽州植物学会',
    contactEmail: 'workshop@huizhouplants.org',
    registrationUrl: 'https://huizhouplants.org/workshops/2023',
    imageUrl: 'https://img.zcool.cn/community/0194f05e62f130a801216518a0cd65.jpg@1280w_1l_2o_100sh.jpg'
  },
  {
    id: 'event-3',
    title: '青龙湾湖区清洁日',
    description: '组织志愿者清理湖区垃圾，保护水质和水生生物栖息环境。',
    date: '2023-11-12',
    location: '青龙湾码头集合',
    type: 'cleanup',
    organizer: '青龙湾环保志愿者协会',
    contactEmail: 'cleanup@qinglongwan.org',
    registrationUrl: 'https://qinglongwan.org/events/cleanup-2023',
    imageUrl: 'https://img.zcool.cn/community/01d6f55af3dd6ca801216518a0a0d6.jpg@1280w_1l_2o_100sh.jpg'
  },
  {
    id: 'event-4',
    title: '青龙湾周边植树活动',
    description: '在湖区周边种植本地树种，改善生态环境，防止水土流失。',
    date: '2023-11-19',
    location: '青龙湾北岸',
    type: 'planting',
    organizer: '青龙湾管理委员会',
    contactEmail: 'planting@qinglongwan.org',
    registrationUrl: 'https://qinglongwan.org/events/planting-2023',
    imageUrl: 'https://img.zcool.cn/community/031e1b55af3c0b000001bf72b87c65.jpg@1280w_1l_2o_100sh.jpg'
  },
  {
    id: 'event-5',
    title: '青龙湾水质监测培训',
    description: '学习水质监测的基本方法和技术，参与青龙湾水质监测项目。',
    date: '2023-12-03',
    location: '青龙湾生态站',
    type: 'monitoring',
    organizer: '青龙湾环境研究中心',
    contactEmail: 'training@qinglongwan.org',
    registrationUrl: 'https://qinglongwan.org/events/water-monitoring-2023',
    imageUrl: 'https://img.zcool.cn/community/01c9f55af3dd6ca80120a895e2a1c6.jpg@1280w_1l_2o_100sh.jpg'
  }
];

// 获取最新的环境数据
export const getLatestEnvironmentalData = (): EnvironmentalData => {
  const data = generateHourlyEnvironmentalData();
  return data[data.length - 1];
};

// 获取环境质量等级描述
export const getAirQualityDescription = (level: string): string => {
  switch (level) {
    case 'excellent':
      return '空气质量优，适合所有户外活动。';
    case 'good':
      return '空气质量良好，适合大多数户外活动。';
    case 'moderate':
      return '空气质量中等，敏感人群应减少户外活动。';
    case 'poor':
      return '空气质量较差，建议减少户外活动。';
    case 'very_poor':
      return '空气质量很差，建议避免户外活动。';
    case 'hazardous':
      return '空气质量有害，应避免所有户外活动。';
    default:
      return '数据不可用';
  }
};

// 获取水质等级描述
export const getWaterQualityDescription = (level: string): string => {
  switch (level) {
    case 'excellent':
      return '水质优良，适合各类水生生物生存，可直接用于饮用水源。';
    case 'good':
      return '水质良好，适合大多数水生生物生存，经处理后可用于饮用水源。';
    case 'moderate':
      return '水质中等，部分敏感水生生物可能受影响，需经严格处理后才可用于饮用水源。';
    case 'poor':
      return '水质较差，大多数水生生物难以生存，不宜用于饮用水源。';
    case 'very_poor':
      return '水质很差，几乎所有水生生物都无法生存，不可用于任何与人体接触的用途。';
    default:
      return '数据不可用';
  }
};

// 获取生物多样性状态描述
export const getBiodiversityStatusDescription = (conservationIndex: number): string => {
  if (conservationIndex >= 90) {
    return '生物多样性状态极佳，生态系统健康稳定。';
  } else if (conservationIndex >= 80) {
    return '生物多样性状态良好，生态系统基本稳定。';
  } else if (conservationIndex >= 70) {
    return '生物多样性状态中等，生态系统有一定压力。';
  } else if (conservationIndex >= 60) {
    return '生物多样性状态一般，生态系统面临较大压力。';
  } else {
    return '生物多样性状态较差，生态系统面临严重威胁。';
  }
};

// 获取天气状况描述
export const getWeatherDescription = (weather: EnvironmentalData['weather']): string => {
  let description = `温度${weather.temperature.toFixed(1)}°C，湿度${weather.humidity.toFixed(0)}%，风速${weather.windSpeed.toFixed(1)}km/h（${weather.windDirection}）`;
  
  if (weather.precipitation > 0) {
    description += `，降水量${weather.precipitation.toFixed(1)}mm`;
  }
  
  if (weather.uvIndex > 0) {
    const uvLevel = weather.uvIndex <= 2 ? '低' : 
                   weather.uvIndex <= 5 ? '中等' : 
                   weather.uvIndex <= 7 ? '高' : 
                   weather.uvIndex <= 10 ? '很高' : '极高';
    description += `，紫外线指数${weather.uvIndex}（${uvLevel}）`;
  }
  
  return description;
};

// 获取环境状况摘要
export const getEnvironmentalSummary = (): string => {
  const latestData = getLatestEnvironmentalData();
  
  return `
# 青龙湾环境状况摘要

## 空气质量
${getAirQualityDescription(latestData.airQuality.level)}
AQI: ${latestData.airQuality.aqi}
PM2.5: ${latestData.airQuality.pm25.toFixed(1)} μg/m³
PM10: ${latestData.airQuality.pm10.toFixed(1)} μg/m³

## 水质
${getWaterQualityDescription(latestData.waterQuality.level)}
pH值: ${latestData.waterQuality.ph.toFixed(1)}
溶解氧: ${latestData.waterQuality.dissolvedOxygen.toFixed(1)} mg/L
水温: ${latestData.waterQuality.temperature.toFixed(1)} °C

## 生物多样性
${getBiodiversityStatusDescription(latestData.biodiversity.conservationIndex)}
植物种类: ${latestData.biodiversity.floraSpecies} 种
动物种类: ${latestData.biodiversity.faunaSpecies} 种
濒危物种: ${latestData.biodiversity.endangeredSpecies} 种

## 天气状况
${getWeatherDescription(latestData.weather)}

## 环保建议
1. 参与青龙湾湖区清洁行动，保护水质环境
2. 减少使用一次性塑料制品，降低对环境的影响
3. 参观时请勿干扰野生动植物，保持安静
4. 垃圾请分类投放到指定区域
  `;
}; 