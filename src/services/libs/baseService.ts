
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
