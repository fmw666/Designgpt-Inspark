import { AuthMiddleware } from './authMiddleware';
import { StandardResponse, fcService } from './fcService';
import { ImageModel, modelService } from './modelService';

interface ServiceRequest {
  count?: number;
  prompt: string;
  model: ImageModel;
  chatId?: string;
}

interface ServiceResponse {
  results: StandardResponse[];
  metadata?: any;
}


export class ServiceManager {
  private static instance: ServiceManager;
  private activeRequests: Map<string, number>;
  private lastRequestTime: Map<string, number>;
  private authMiddleware: AuthMiddleware;

  private constructor() {
    this.activeRequests = new Map();
    this.lastRequestTime = new Map();
    this.authMiddleware = AuthMiddleware.getInstance();

    // Initialize counters
    modelService.getAllModels().forEach((model) => {
      this.activeRequests.set(model.config.group, 0);
      this.lastRequestTime.set(model.config.group, 0);
    });
  }

  public static getInstance(): ServiceManager {
    if (!ServiceManager.instance) {
      ServiceManager.instance = new ServiceManager();
    }
    return ServiceManager.instance;
  }

  private async waitForServiceAvailability(model: ImageModel): Promise<void> {

    while (true) {
      const activeCount = this.activeRequests.get(model.config.group) || 0;
      const lastRequest = this.lastRequestTime.get(model.config.group) || 0;
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequest;

      if (activeCount < model.config.maxConcurrent && 
          timeSinceLastRequest >= model.config.cooldownMs) {
        break;
      }

      // Wait for a short time before checking again
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  private async executeRequest<T>(
    model: ImageModel,
    requestFn: () => Promise<T>
  ): Promise<T> {
    // 首先进行认证检查
    const isAuthenticated = await this.authMiddleware.checkAuth();
    if (!isAuthenticated) {
      throw new Error('AUTH_REQUIRED');
    }

    await this.waitForServiceAvailability(model);

    // Update counters
    this.activeRequests.set(model.config.group, (this.activeRequests.get(model.config.group) || 0) + 1);
    this.lastRequestTime.set(model.config.group, Date.now());

    try {
      const result = await requestFn();
      return result;
    } finally {
      // Decrease active requests count
      this.activeRequests.set(model.config.group, (this.activeRequests.get(model.config.group) || 1) - 1);
    }
  }

  private async generateMultipleImages(
    model: ImageModel,
    request: ServiceRequest,
    generateFn: (req: ServiceRequest) => Promise<any>
  ): Promise<ServiceResponse> {
    const count = request.count || 1;
    const errors: Error[] = [];
    const results: StandardResponse[] = [];

    // 串行处理同一服务的多个请求，确保遵守速率限制
    for (let i = 0; i < count; i++) {
      try {
        // 每个请求都会经过 executeRequest，它会确保遵守速率限制
        const result: StandardResponse = await this.executeRequest(model, () => generateFn(request));
        results.push(result);
      } catch (error) {
        errors.push(error as Error);
        results.push({
          id: request.chatId || '',
          status: 'error',
          results: {
            id: null,
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

  public async generateImages(request: ServiceRequest): Promise<ServiceResponse> {
    return this.generateMultipleImages(request.model, request, (req) => 
      fcService.invokeFunction(JSON.stringify({
        id: req.chatId,
        model: {
          id: req.model.id,
        },
        content: req.prompt,
      }))
    );
  }
}

// Export a singleton instance
export const serviceManager = ServiceManager.getInstance();
