import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { eventBus } from '@/utils/eventBus';

const baseURL = 'http://127.0.0.1:8000/api/v1';

const axiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// standard response
export interface StandardResponse<T> {
  code: number;
  message: string;
  data: T;
}

// pagination response
export interface PaginationResponse<T> {
  items: T[];
  count: number;
  total: number;
  page: number;
  size: number | null;
}

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  <T>(response: AxiosResponse<StandardResponse<T>>) => {
    // 如果 http 响应为 401，则触发未认证事件
    if (response.status === 401) {
      eventBus.emit('unauthenticated');
    }
    // 处理 http 响应
    const { code, message, data } = response.data;
    if (code === 0) {
      return data;
    }
    return Promise.reject(new Error(message || 'Request failed'));
  },
  (error: AxiosError) => {
    // 如果是 401 错误，触发未认证事件
    if (error.response?.status === 401) {
      eventBus.emit('unauthenticated');
    }
    return Promise.reject(error);
  }
);

// 扩展 axios 实例类型
declare module 'axios' {
  interface AxiosInstance {
    get<T = any>(url: string, config?: any): Promise<T>;
    post<T = any>(url: string, data?: any, config?: any): Promise<T>;
    put<T = any>(url: string, data?: any, config?: any): Promise<T>;
    delete<T = any>(url: string, config?: any): Promise<T>;
  }
}

// SSE 请求处理函数
export const createSSERequest = async <TMessage, TStatus>(
  url: string,
  data: any,
  onMessage: (message: TMessage) => void,
  onStatus: (status: TStatus) => void,
  onComplete: () => void,
  onError: (error: Error) => void
) => {
  try {
    const baseURL = axiosInstance.defaults.baseURL || '';
    const headers: Record<string, string> = {
      'Accept': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json',
    };

    // 添加认证头
    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${baseURL}${url}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        if (line.startsWith('event: ')) {
          const eventType = line.slice(7);
          const dataLine = lines[i + 1];
          
          if (dataLine && dataLine.startsWith('data: ')) {
            try {
              const data = JSON.parse(dataLine.slice(6));
              switch (eventType) {
                case 'message':
                  onMessage(data as TMessage);
                  break;
                case 'status':
                  onStatus(data as TStatus);
                  break;
                case 'error':
                  onError(new Error(data.message || 'Unknown error occurred'));
                  return;
                case 'complete':
                  onComplete();
                  return;
                default:
                  console.warn('Unknown event type:', eventType);
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
              onError(new Error('Failed to parse server response'));
              return;
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in SSE request:', error);
    onError(error instanceof Error ? error : new Error('Unknown error occurred'));
  }
};

export default axiosInstance;
