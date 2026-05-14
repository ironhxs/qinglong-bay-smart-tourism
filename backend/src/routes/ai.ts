import express from 'express';
import { generateText, generateImage } from '../services/qianfan';

const router = express.Router();

// POST /api/ai/chat
router.post('/chat', async (req, res) => {
  const { messages } = req.body as { messages: Array<{ role: string; content: string }> };
  console.log('[AI Route] 收到/chat请求，messages长度:', messages?.length);
  
  if (!messages || !Array.isArray(messages)) {
    console.error('[AI Route] 无效的请求体，缺少messages数组');
    return res.status(400).json({ error: 'messages array required' });
  }
  try {
    console.log('[AI Route] 调用generateText服务');
    const data = await generateText(messages);
    console.log('[AI Route] generateText服务返回成功:', typeof data);
    console.log('[AI Route] 返回数据结构:', Object.keys(data));
    
    // 检查响应格式并提取结果
    if (data.result) {
      console.log('[AI Route] 检测到result字段，直接返回');
      return res.json({ result: data.result });
    } else if (data.response) {
      console.log('[AI Route] 检测到response字段，作为result返回');
      return res.json({ result: data.response });
    } else if (data.choices && Array.isArray(data.choices) && data.choices.length > 0) {
      console.log('[AI Route] 检测到choices字段，提取内容');
      const content = data.choices[0]?.message?.content || data.choices[0]?.content;
      if (content) {
        console.log('[AI Route] 从choices提取到内容');
        return res.json({ result: content });
      }
    }
    
    // 如果没有识别到标准字段，返回完整响应
    console.log('[AI Route] 未识别到标准响应字段，返回完整数据');
    res.json(data);
  } catch (error: any) {
    console.error('[AI Chat] error', error?.response?.data || error.message);
    console.error('[AI Chat] 完整错误对象:', error);
    
    // 检查是否是API限流错误
    if (error.isRateLimitError || (error.response && error.response.status === 429)) {
      return res.status(429).json({ 
        error: 'rate_limit_exceeded',
        message: '文本生成请求过于频繁，请稍后再试',
        detail: error?.response?.data
      });
    }
    
    res.status(500).json({ error: 'qianfan_chat_failed', detail: error?.response?.data || error.message });
  }
});

// POST /api/ai/image
router.post('/image', async (req, res) => {
  const { prompt, style, size, negativePrompt } = req.body as { prompt: string; style?: string; size?: string; negativePrompt?: string };
  console.log('[AI Route] 收到/image请求:');
  console.log('[AI Route] - prompt:', prompt);
  console.log('[AI Route] - style:', style);
  console.log('[AI Route] - size:', size);
  
  if (!prompt) {
    console.error('[AI Route] 无效的请求体，缺少prompt');
    return res.status(400).json({ error: 'prompt required' });
  }
  
  try {
    console.log('[AI Route] 调用generateImage服务');
    const result = await generateImage(prompt, style, size);
    console.log('[AI Route] generateImage服务返回:', typeof result);

    // 尝试从不同结构中提取图像 URL
    let imageUrl: string | undefined;

    // 1. 检查直接返回的imageUrl（来自我们的服务包装）
    if (result?.imageUrl) {
      imageUrl = result.imageUrl;
      console.log('[AI Route] 直接获取到imageUrl');
    }
    // 2. 检查irag-1.0模型的标准响应格式
    // {
    //   "id": "as-p5vuu9vgsn",
    //   "created": 1735264326,
    //   "data": [
    //     {
    //       "url": "http://qianfan-modelbuilder-img-gen.bj.bcebos.com/..."
    //     }
    //   ]
    // }
    else if (result?.data?.data && Array.isArray(result.data.data) && result.data.data.length > 0) {
      imageUrl = result.data.data[0].url;
      console.log('[AI Route] 从irag-1.0标准响应获取URL');
    }
    // 3. 检查原始API响应格式
    else if (result?.data) {
      console.log('[AI Route] 尝试从原始API响应获取URL');
      
      const data = result.data;
      
      // 判断是否为标准irag-1.0响应格式
      if (data.id && data.created && data.data && Array.isArray(data.data)) {
        imageUrl = data.data[0]?.url;
        console.log('[AI Route] 从原始irag-1.0响应获取URL');
      }
      // 其他可能的响应格式
      else if (Array.isArray(data) && data.length > 0 && data[0].url) {
        imageUrl = data[0].url;
      } else if (typeof data === 'object' && data.url) {
        imageUrl = data.url;
      }
    }

    if (!imageUrl) {
      console.warn('[AI Image] 未能解析 imageUrl，返回原始数据');
      console.log('[AI Route] 返回原始数据结构:', JSON.stringify(result, null, 2));
      return res.json({ error: 'no_image_url_found', data: result });
    }

    console.log('[AI Route] 成功解析到imageUrl:', imageUrl);
    return res.json({ imageUrl });
  } catch (error: any) {
    console.error('[AI Image] error', error?.response?.data || error.message);
    console.error('[AI Image] 完整错误堆栈:', error.stack);
    console.error('[AI Image] 是否有响应对象:', !!error.response);
    if (error.response) {
      console.error('[AI Image] 响应状态:', error.response.status);
      console.error('[AI Image] 响应数据:', JSON.stringify(error.response.data));
    }
    
    // 如果是API限流错误，返回更友好的错误信息
    if (error.response && error.response.data && 
        (error.response.data.code === 'QpsLimitExceeded' || 
         error.response.data.code === 'InvalidApiKey' || 
         error.response.status === 429)) {
      return res.status(429).json({ 
        error: 'rate_limit_exceeded',
        message: '图像生成请求过于频繁，请稍后再试',
        detail: error.response.data
      });
    }
    
    res.status(500).json({ error: 'qianfan_image_failed', detail: error?.response?.data || error.message });
  }
});

export default router; 