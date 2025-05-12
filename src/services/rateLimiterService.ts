import { Queue } from './queueService';

interface RateLimiterConfig {
  maxTokens: number;
  tokensPerSecond: number;
  maxConcurrent: number;
}

type Task<T> = () => Promise<T>;

export class RateLimiter {
  private tokens: number;
  private lastRefillTime: number;
  private config: RateLimiterConfig;
  private queue: Queue<Task<any>>;
  private runningTasks: number;

  constructor(config: RateLimiterConfig) {
    this.tokens = config.maxTokens;
    this.lastRefillTime = Date.now();
    this.config = config;
    this.queue = new Queue<Task<any>>();
    this.runningTasks = 0;
  }

  private refillTokens(): void {
    const now = Date.now();
    const timePassed = (now - this.lastRefillTime) / 1000; // Convert to seconds
    const newTokens = Math.floor(timePassed * this.config.tokensPerSecond);
    
    if (newTokens > 0) {
      this.tokens = Math.min(this.config.maxTokens, this.tokens + newTokens);
      this.lastRefillTime = now;
    }
  }

  private async processQueue(): Promise<void> {
    while (!this.queue.isEmpty() && this.runningTasks < this.config.maxConcurrent) {
      const task = this.queue.dequeue();
      if (task) {
        this.runningTasks++;
        try {
          await task();
        } finally {
          this.runningTasks--;
          this.processQueue();
        }
      }
    }
  }

  async execute<T>(task: Task<T>): Promise<T> {
    this.refillTokens();

    if (this.tokens > 0 && this.runningTasks < this.config.maxConcurrent) {
      this.tokens--;
      this.runningTasks++;
      try {
        return await task();
      } finally {
        this.runningTasks--;
        this.processQueue();
      }
    } else {
      return new Promise((resolve, reject) => {
        this.queue.enqueue(async () => {
          try {
            const result = await task();
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      });
    }
  }
}

// Create a singleton instance for Doubao service
export const doubaoRateLimiter = new RateLimiter({
  maxTokens: 2,
  tokensPerSecond: 2,
  maxConcurrent: 2
});
