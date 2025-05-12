import { Queue } from './queueService';

export interface Task {
  id: string;
  type: string;
  data: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export class TaskQueueService {
  private queue: Queue<Task>;
  private processing: boolean;

  constructor() {
    this.queue = new Queue<Task>();
    this.processing = false;
  }

  async addTask(task: Omit<Task, 'status' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const newTask: Task = {
      ...task,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.queue.enqueue(newTask);
    return newTask;
  }

  async processNextTask(): Promise<Task | null> {
    if (this.processing || this.queue.isEmpty()) {
      return null;
    }

    this.processing = true;
    const task = this.queue.dequeue();
    
    if (!task) {
      this.processing = false;
      return null;
    }

    try {
      task.status = 'processing';
      task.updatedAt = new Date();
      
      // Process the task based on its type
      switch (task.type) {
        case 'image_processing':
          // Add image processing logic here
          break;
        case 'model_training':
          // Add model training logic here
          break;
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }

      task.status = 'completed';
      task.updatedAt = new Date();
    } catch (error) {
      task.status = 'failed';
      task.updatedAt = new Date();
      console.error(`Task ${task.id} failed:`, error);
    }

    this.processing = false;
    return task;
  }

  getQueueSize(): number {
    return this.queue.size();
  }

  isProcessing(): boolean {
    return this.processing;
  }

  clearQueue(): void {
    this.queue.clear();
  }
} 