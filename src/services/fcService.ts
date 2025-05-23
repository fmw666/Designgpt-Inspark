
// 添加标准响应接口
export interface StandardResponse {
  id: string;
  status: 'success' | 'error';
  results: {
    url: string | null;
    text: string | null;
    error: string | null;
    errorMessage: string | null;
  }
}


export class FCService {
  private static instance: FCService;
  private apiUrl: string;

  constructor() {
    this.apiUrl = 'https://invo-one-ajzmkpolem.cn-shenzhen.fcapp.run/action';
  }

  public static getInstance(): FCService {
    if (!FCService.instance) {
      FCService.instance = new FCService();
    }
    return FCService.instance;
  }
  
  /**
   * 调用函数
   * @param params 函数调用参数
   * @returns 函数执行结果
   */
  async invokeFunction(params: any): Promise<StandardResponse> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: params,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to invoke function');
      }
      return response.json();
    } catch (error) {
      console.error('Error invoking function:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 错误处理
   */
  private handleError(error: any): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error('Unknown error occurred while calling FC');
  }
}

// 导出单例实例
export const fcService = FCService.getInstance();
