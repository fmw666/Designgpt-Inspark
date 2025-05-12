/*
豆包AI绘图服务

参考官方文档：https://www.volcengine.com/docs/6791/1279296
核心：
  1. 接口单次调用出图1张，输出4张图的话，强烈建议通过排队，第一秒发出前2张生图请求，第二秒发出后2张生图请求，可在不增购QPS情况下更好的使用服务。
*/

import { StandardResponse } from './baseService';

export type DoubaoModel = 
  | 'high_aes_general_v21_L'  // 通用2.1-文生图
  | 'high_aes_general_v20_L'  // 通用2.0Pro-文生图
  | 'high_aes_general_v20'  // 通用2.0-文生图
  | 'high_aes_general_v14'  // 通用1.4-文生图
  | 't2i_xl_sft'  // 通用XL pro-文生图

export interface DoubaoConfig {
  apiKey: string;
  apiSecret: string;
  endpoint: string;
  region: string;
  service: string;
  defaultModel?: DoubaoModel;
  host: string;
}

export interface DoubaoRequest {
  prompt: string;
  model?: DoubaoModel;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  seed?: number;
  cfgScale?: number;
  imageUrl?: string;  // For img2img tasks
  maskUrl?: string;   // For inpainting tasks
  strength?: number;  // For img2img tasks
}

export interface DoubaoResponse {
  message: 'Success' | 'Failed';
  request_id: string;
  status: number;
  data?: {
    image_urls: string[];
  };
}

export class DoubaoService {
  private config: DoubaoConfig;
  private defaultModel: DoubaoModel;

  constructor(config: DoubaoConfig) {
    this.config = config;
    this.defaultModel = config.defaultModel || 'high_aes_general_v21_L';
  }

  private signStringEncoder(source: string): string {
    return encodeURIComponent(source).replace(/[!'()*]/g, function (c) {
      return '%' + c.charCodeAt(0).toString(16).toUpperCase();
    });
  }

  private async hashSHA256(content: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(content);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('Error in hashSHA256:', error);
      throw error;
    }
  }

  private async hmacSHA256(
    key: string | Uint8Array,
    content: string,
  ): Promise<Uint8Array> {
    const encoder = new TextEncoder();
    const keyData = key instanceof Uint8Array ? key : encoder.encode(key);
    const contentData = encoder.encode(content);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      contentData
    );

    return new Uint8Array(signature);
  }

  private async genSigningSecretKeyV4(
    secretKey: string,
    date: string,
    region: string,
    service: string,
  ): Promise<Uint8Array> {
    const kDate = await this.hmacSHA256(secretKey, date);
    const kRegion = await this.hmacSHA256(kDate, region);
    const kService = await this.hmacSHA256(kRegion, service);
    return await this.hmacSHA256(kService, 'request');
  }

  private async makeRequest(payload: any): Promise<any> {
    const method = 'POST';
    const action = 'CVProcess';
    const version = '2022-08-31';
    const url = `${this.config.endpoint}?Action=${action}&Version=${version}`;

    const body = JSON.stringify({
      ...payload,
    });
    const xContentSha256 = await this.hashSHA256(body);
    const xDate = new Date().toISOString().replace(/[-:]|\.\d{3}/g, '');
    const shortXDate = xDate.substring(0, 8);
    const credentialScope = `${shortXDate}/${this.config.region}/${this.config.service}/request`;
    const signHeader = 'host;x-date;x-content-sha256;content-type';
    const contentType = 'application/json';

    const queryString = Array.from(new Map([
      ['Action', action],
      ['Version', version],
    ]).entries())
      .map(
        ([key, value]) =>
          `${this.signStringEncoder(key)}=${this.signStringEncoder(value)}`,
      )
      .join('&');

    const canonicalString = [
      method,
      '/',
      queryString,
      `host:${this.config.host}`,
      `x-date:${xDate}`,
      `x-content-sha256:${xContentSha256}`,
      `content-type:${contentType}`,
      '',
      signHeader,
      xContentSha256,
    ].join('\n');

    const hashCanonicalString = await this.hashSHA256(canonicalString);
    const stringToSign = [
      'HMAC-SHA256',
      xDate,
      credentialScope,
      hashCanonicalString,
    ].join('\n');

    const signKey = await this.genSigningSecretKeyV4(
      this.config.apiSecret,
      shortXDate,
      this.config.region,
      this.config.service,
    );

    const signature = Array.from(await this.hmacSHA256(signKey, stringToSign))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Host': this.config.host,
          'X-Date': xDate,
          'X-Content-Sha256': xContentSha256,
          'Content-Type': contentType,
          'Authorization': `HMAC-SHA256 Credential=${this.config.apiKey}/${credentialScope}, SignedHeaders=${signHeader}, Signature=${signature}`,
        },
        body,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || 
          `Doubao API error: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      return result;
    } catch (error) {
      console.error('Doubao API request failed:', error);
      throw error;
    }
  }

  async generateImage(request: DoubaoRequest): Promise<StandardResponse> {
    const model = request.model || this.defaultModel;

    const payload = {
      req_key: model,
      prompt: request.prompt,
      // req_schedule_conf: "general_v20_9B_pe",
      // seed: -1,
      // scale: 3.5,
      // ddim_steps: 16,
      // width: 512,
      // height: 512,
      // use_sr: true,
      return_url: true,
      // logo_info: {
      //   add_logo: false,
      //   position: 0,
      //   language: 0,
      //   opacity: 0.3,
      //   logo_text_content: "这里是明水印内容"
      // }
    };

    try {
      const response: DoubaoResponse = await this.makeRequest(payload);
      
      if (response.message === 'Success' && response.data?.image_urls && response.data?.image_urls?.length > 0) {
        return {
          success: true,
          message: '图片生成成功！',
          imageUrl: response?.data?.image_urls[0], // 取第一张图片
        };
      }

      return {
        success: false,
        error: '未返回图片URL',
      };
    } catch (error) {
      console.error('Doubao API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }
}

// Create a singleton instance
export const doubaoService = new DoubaoService({
  apiKey: import.meta.env.VITE_DOUBAO_API_KEY || '',
  apiSecret: import.meta.env.VITE_DOUBAO_API_SECRET || '',
  endpoint: '/api/doubao', // 使用相对路径，通过代理访问
  defaultModel: 'high_aes_general_v21_L',
  region: 'cn-north-1',
  service: 'cv',
  host: 'visual.volcengineapi.com',
});
