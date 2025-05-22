import { StandardResponse } from './libs/baseService';
import { AuthMiddleware } from './authMiddleware';
import { fcService } from './fcService';

export type ServiceType = 'gpt4o' | 'doubao';

interface ServiceConfig {
  maxConcurrent: number;
  cooldownMs: number;
}

interface ServiceRequest {
  count?: number;
  prompt: string;
  model?: string;
  chatId?: string;
}

interface ServiceResponse {
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
  private authMiddleware: AuthMiddleware;

  private constructor() {
    this.activeRequests = new Map();
    this.lastRequestTime = new Map();
    this.config = DEFAULT_CONFIG;
    this.authMiddleware = AuthMiddleware.getInstance();

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
    // 首先进行认证检查
    const isAuthenticated = await this.authMiddleware.checkAuth();
    if (!isAuthenticated) {
      throw new Error('AUTH_REQUIRED');
    }

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
    request: ServiceRequest,
    generateFn: (req: any) => Promise<any>
  ): Promise<ServiceResponse> {
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
          id: request.chatId || '',
          status: 'error',
          results: {
            url: null,
            text: null,
            error: error instanceof Error ? error.message : '未知错误',
            errorMessage: error instanceof Error ? error.message : '未知错误',
          }
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
        successful: results.filter(r => r.status === 'success').length,
        failed: errors.length
      }
    };
  }

  public async generateImageWithGPT4o(request: ServiceRequest): Promise<ServiceResponse> {
    return this.generateMultipleImages('gpt4o', request, (req) => 
      fcService.invokeFunction(JSON.stringify({
        id: req.chatId,
        model: {
          // id: req.model,
          id: 'gpt_4o',
        },
        content: req.prompt,
      }))
    );
  }

  public async generateImageWithDoubao(request: ServiceRequest): Promise<ServiceResponse> {
    return this.generateMultipleImages('doubao', request, (req) =>
      fcService.invokeFunction(JSON.stringify({
        id: req.chatId,
        model: {
          id: req.model,
        },
        content: req.prompt,
      }))
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
