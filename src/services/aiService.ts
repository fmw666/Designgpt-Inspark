import { createSSERequest } from './axios';
import { Message } from './chatService';

export interface Text2ImgRequest {
  conversation_id: string;
  content: string;
  model_group_id: string;
}

export interface ImageResult {
  uuid: string;
  url: string;
  text: string | null;
  error: string | null;
  errorMessage: string | null;
  isGenerating: boolean;
}

export interface StatusData {
  status: {
    total: number;
    success: number;
    failed: number;
    generating: number;
  };
  images: {
    [key: string]: ImageResult[];
  };
}

export interface StreamResponse {
  type: 'message' | 'status' | 'error' | 'complete';
  data: Message | StatusData | { message: string };
}

export class AIService {
  private static instance: AIService;

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async text2img(
    request: Text2ImgRequest,
    onMessage: (message: Message) => void,
    onStatus: (status: StatusData) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      await createSSERequest<Message, StatusData>(
        '/ai/text2img',
        request,
        onMessage,
        onStatus,
        onComplete,
        onError
      );
    } catch (error) {
      console.error('Error in text2img:', error);
      onError(error instanceof Error ? error : new Error('Unknown error occurred'));
    }
  }
}

export const aiService = AIService.getInstance();
