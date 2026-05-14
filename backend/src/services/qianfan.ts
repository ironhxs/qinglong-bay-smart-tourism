import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.QIANFAN_API_KEY;

if (!API_KEY) {
  console.warn('[Qianfan] QIANFAN_API_KEY 未配置，所有请求将失败');
}

// 请求公共头 - 使用Bearer Token认证方式
const authHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_KEY}`
};

/** 调用文本生成（小青徽虚拟角色互动，使用ERNIE-4.5-0.3b模型） */
export async function generateText(messages: Array<{ role: string; content: string }>) {
  // 使用API端点
  const url = 'https://qianfan.baidubce.com/v2/chat/completions';

  console.log('[Qianfan] 调用文本生成API, URL:', url);
  console.log('[Qianfan] 请求消息数量:', messages.length);

  try {
    // 完全按照示例代码的格式构建请求
    const requestBody = {
      model: 'ernie-4.5-0.3b',
      messages,
      stream: false
    };

    console.log('[Qianfan] 请求头:', JSON.stringify({ ...authHeaders, 'appid': '', 'Authorization': '***' }));

    const response = await axios({
      method: 'POST',
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'appid': ''  // 添加空appid字段，按照示例代码要求
      },
      data: JSON.stringify(requestBody)
    });

    console.log('[Qianfan] 响应状态:', response.status);
    console.log('[Qianfan] 响应数据类型:', typeof response.data);
    console.log('[Qianfan] 响应数据结构:', Object.keys(response.data));

    const data = response.data;
    
    // 提取文本内容
    if (data.result) {
      console.log('[Qianfan] 成功提取result字段:', data.result.substring(0, 50) + '...');
      return { result: data.result };
    } else if (data.response) {
      console.log('[Qianfan] 成功提取response字段:', data.response.substring(0, 50) + '...');
      return { result: data.response };
    } else if (data.choices && Array.isArray(data.choices) && data.choices.length > 0) {
      const content = data.choices[0]?.message?.content || data.choices[0]?.content;
      if (content) {
        console.log('[Qianfan] 成功提取choices中的content字段:', content.substring(0, 50) + '...');
        return { result: content };
      }
    }
    
    // 如果无法提取特定字段，返回整个响应
    console.warn('[Qianfan] 无法从响应中提取文本内容，返回完整响应');
    return data;
  } catch (error: any) {
    console.error('[Qianfan] 文本生成失败:', error.message);
    if (error.response) {
      console.error('[Qianfan] 响应状态:', error.response.status);
      console.error('[Qianfan] 响应数据:', JSON.stringify(error.response.data));
      console.error('[Qianfan] 响应头:', JSON.stringify(error.response.headers));
      
      // 检查是否是API限流错误
      if (error.response.status === 429) {
        console.error('[Qianfan] API请求频率超限');
        error.isRateLimitError = true;
      }
    } else if (error.request) {
      console.error('[Qianfan] 请求已发送但无响应');
    }
    throw error;
  }
}

/** 调用图像生成（文心一格 ERNIE-iRAG） */
export async function generateImage(prompt: string, style = 'realistic', size = '1024x1024') {
  // 使用正确的API端点
  const url = 'https://qianfan.baidubce.com/v2/images/generations';
  
  console.log('[Qianfan] 请求图像生成, prompt:', prompt);
  console.log('[Qianfan] 请求参数:', { style, size });
  
  // 按照官方文档格式构造请求参数
  const requestParams = {
    prompt,
    model: 'irag-1.0'  // 更新为ERNIE-iRAG-1.0模型
  };
  
  console.log('[Qianfan] 请求URL:', url);
  console.log('[Qianfan] API_KEY是否存在:', !!API_KEY);
  console.log('[Qianfan] 请求头:', JSON.stringify({...authHeaders, 'Authorization': API_KEY ? 'Bearer ***' : 'undefined'}));

  try {
    console.log('[Qianfan] 开始发送API请求...');
    const response = await axios.post(
      url,
      requestParams,
      { headers: authHeaders }
    );
    
    console.log('[Qianfan] 响应状态码:', response.status);
    console.log('[Qianfan] 响应头:', JSON.stringify(response.headers));
    console.log('[Qianfan] 原始响应数据类型:', typeof response.data);
    console.log('[Qianfan] 原始响应数据结构:', Object.keys(response.data));
    
    // 响应格式根据API文档
    // {
    //   "id": "as-p5vuu9vgsn",
    //   "created": 1735264326,
    //   "data": [
    //     {
    //       "url": "http://qianfan-modelbuilder-img-gen.bj.bcebos.com/..."
    //     }
    //   ]
    // }
    const data = response.data;
    
    // 检查是否返回了图像URL
    if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
      const imageUrl = data.data[0]?.url;
      console.log('[Qianfan] 找到图像URL:', !!imageUrl);
      console.log('[Qianfan] 图像URL:', imageUrl ? imageUrl.substring(0, 50) + '...' : 'undefined');
      if (imageUrl) return { imageUrl, data: data.data[0] };
    }

    // 如果没有返回URL或数据结构不符合预期，返回整个响应数据
    console.warn('[Qianfan] 未能解析到imageUrl，返回原始响应数据');
    return { data, imageUrl: undefined };
  } catch (err: any) {
    console.error('[Qianfan] 图像生成请求失败:', err.message);
    if (err.response) {
      console.error('[Qianfan] 错误响应状态码:', err.response.status);
      console.error('[Qianfan] 错误响应数据:', JSON.stringify(err.response.data));
    } else if (err.request) {
      console.error('[Qianfan] 请求已发送但无响应');
    } else {
      console.error('[Qianfan] 发送请求前出错:', err);
    }
    throw err; // 继续抛出错误，让调用者处理
  }
} 
