import { gpt4oService, GPT4oRequest,  } from './libs/gpt4oService';
import { doubaoService, DoubaoRequest, } from './libs/doubaoService';
import { StandardResponse } from './libs/baseService';

export type ServiceType = 'gpt4o' | 'doubao';

interface ServiceConfig {
  maxConcurrent: number;
  cooldownMs: number;
}

interface GenerationRequest {
  count?: number;
}

interface GPT4oServiceRequest extends GPT4oRequest {
  count?: number;
}

interface DoubaoServiceRequest extends DoubaoRequest {
  count?: number;
}

interface GenerationResponse {
  results: StandardResponse[];
  metadata?: any;
}

const DEFAULT_CONFIG: Record<ServiceType, ServiceConfig> = {
  gpt4o: {
    maxConcurrent: 2,
    cooldownMs: 1000, // 1 second cooldown between requests
  },
  doubao: {
    maxConcurrent: 1,
    cooldownMs: 2000, // 2 seconds cooldown between requests
  },
};

export class ServiceManager {
  private static instance: ServiceManager;
  private activeRequests: Map<ServiceType, number>;
  private lastRequestTime: Map<ServiceType, number>;
  private config: Record<ServiceType, ServiceConfig>;

  private constructor() {
    this.activeRequests = new Map();
    this.lastRequestTime = new Map();
    this.config = DEFAULT_CONFIG;

    // Initialize counters
    Object.keys(DEFAULT_CONFIG).forEach((service) => {
      this.activeRequests.set(service as ServiceType, 0);
      this.lastRequestTime.set(service as ServiceType, 0);
    });
  }

  public static getInstance(): ServiceManager {
    if (!ServiceManager.instance) {
      ServiceManager.instance = new ServiceManager();
    }
    return ServiceManager.instance;
  }

  private async waitForServiceAvailability(serviceType: ServiceType): Promise<void> {
    while (true) {
      const activeCount = this.activeRequests.get(serviceType) || 0;
      const lastRequest = this.lastRequestTime.get(serviceType) || 0;
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequest;

      if (activeCount < this.config[serviceType].maxConcurrent && 
          timeSinceLastRequest >= this.config[serviceType].cooldownMs) {
        break;
      }

      // Wait for a short time before checking again
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  private async executeRequest<T>(
    serviceType: ServiceType,
    requestFn: () => Promise<T>
  ): Promise<T> {
    await this.waitForServiceAvailability(serviceType);

    // Update counters
    this.activeRequests.set(serviceType, (this.activeRequests.get(serviceType) || 0) + 1);
    this.lastRequestTime.set(serviceType, Date.now());

    try {
      const result = await requestFn();
      return result;
    } finally {
      // Decrease active requests count
      this.activeRequests.set(serviceType, (this.activeRequests.get(serviceType) || 0) - 1);
    }
  }

  private async generateMultipleImages(
    serviceType: ServiceType,
    request: GPT4oServiceRequest | DoubaoServiceRequest,
    generateFn: (req: any) => Promise<any>
  ): Promise<GenerationResponse> {
    const count = request.count || 1;
    const errors: Error[] = [];
    const results: StandardResponse[] = [];

    // 串行处理同一服务的多个请求，确保遵守速率限制
    for (let i = 0; i < count; i++) {
      try {
        // 每个请求都会经过 executeRequest，它会确保遵守速率限制
        const result: StandardResponse = await this.executeRequest(serviceType, () => generateFn(request));
        results.push(result);
      } catch (error) {
        errors.push(error as Error);
        results.push({
          success: false,
          error: error instanceof Error ? error.message : '未知错误',
        });
      }
    }

    if (errors.length > 0) {
      console.warn(`Some image generations failed: ${errors.length} errors`);
    }

    return {
      results: results,
      metadata: {
        totalRequested: count,
        successful: results.filter(r => r.success).length,
        failed: errors.length
      }
    };
  }

  public async generateImageWithGPT4o(request: GPT4oServiceRequest): Promise<GenerationResponse> {
    return this.generateMultipleImages('gpt4o', request, (req) => 
      gpt4oService.generateImage({
        prompt: req.prompt,
        // Add other GPT4o specific parameters here
      })
    );
  }

  public async generateImageWithDoubao(request: DoubaoServiceRequest): Promise<GenerationResponse> {
    return this.generateMultipleImages('doubao', request, (req) => 
      doubaoService.generateImage({
        prompt: req.prompt,
        model: req.model,
        // Add other Doubao specific parameters here
      })
    );
  }

  public setConfig(serviceType: ServiceType, config: Partial<ServiceConfig>): void {
    this.config[serviceType] = {
      ...this.config[serviceType],
      ...config,
    };
  }

  public getActiveRequests(serviceType: ServiceType): number {
    return this.activeRequests.get(serviceType) || 0;
  }

  public getLastRequestTime(serviceType: ServiceType): number {
    return this.lastRequestTime.get(serviceType) || 0;
  }
}

// Export a singleton instance
export const serviceManager = ServiceManager.getInstance();
