import axios from 'axios';

// 创建axios实例，使用相对路径，配合Vite代理
const api = axios.create({
  baseURL: '/api',  // 使用相对路径，Vite会代理到后端
  timeout: 10000, // 设置超时时间为10秒
});

// 添加请求拦截器
api.interceptors.request.use(
  (config) => {
    console.log(`API请求: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API请求错误:', error);
    return Promise.reject(error);
  }
);

// 添加响应拦截器
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // 服务器返回错误状态码
      console.error(`API错误 ${error.response.status}: ${error.response.data?.message || '未知错误'}`);
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('API请求超时或无响应');
    } else {
      // 请求配置出错
      console.error('API配置错误:', error.message);
    }
    return Promise.reject(error);
  }
);

export interface Attraction {
  id?: number;
  name: string;
  description?: string;
  latitude?: number;
  longitude?: number;
}

export const getAttractions = () => api.get<Attraction[]>('/attractions').then((r) => r.data);
export const getAttraction = (id: string | number) => api.get<Attraction>(`/attractions/${id}`).then((r) => r.data);
export const createAttraction = (data: Attraction) => api.post('/attractions', data);
export const updateAttraction = (id: string | number, data: Attraction) => api.put(`/attractions/${id}`, data);
export const deleteAttraction = (id: string | number) => api.delete(`/attractions/${id}`); 