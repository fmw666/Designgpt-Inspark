export interface ImageModel {
  id: string;
  name: string;
  publishDate: Date;
  description: string;
  maxImages: number;
  category: string;
  demo?: {
    prompt: string;
    images: string[];
  };
  config: {
    maxConcurrent: number;  // 最大并发数
    cooldownMs: number;  // 冷却时间
    group: string;  // 模型组, 只有同一组的模型才会共享速率限制（同一分类不一定同一组）
  };
}

export class ModelService {
  private static instance: ModelService;
  private models: ImageModel[];

  private constructor() {
    this.models = IMAGE_MODELS;
  }

  public static getInstance(): ModelService {
    if (!ModelService.instance) {
      ModelService.instance = new ModelService();
    }
    return ModelService.instance;
  }

  // 获取所有模型
  public getAllModels(): ImageModel[] {
    return this.models;
  }

  // 获取指定类别的模型
  public getModelsByCategory(category: string): ImageModel[] {
    return this.models.filter(model => model.category === category);
  }

  // 获取所有类别
  public getAllCategories(): string[] {
    return [...new Set(this.models.map(model => model.category))];
  }

  // 根据ID获取模型
  public getModelById(id: string): ImageModel | undefined {
    return this.models.find(model => model.id === id);
  }

  // 获取模型演示
  public getModelDemo(modelId: string) {
    const model = this.models.find(m => m.id === modelId);
    return model?.demo;
  }

  // 获取模型配置
  public getModelConfig(model: ImageModel) {
    return model.config;
  }

  // 更新模型配置
  public updateModelConfig(modelId: string, config: Partial<ImageModel['config']>) {
    const model = this.getModelById(modelId);
    if (model) {
      model.config = {
        ...this.getModelConfig(model),
        ...config
      };
    }
  }
}

// Demo images for testing
const demoImages = {
  sd: [
    'https://picsum.photos/seed/sd1/512/512',
    'https://picsum.photos/seed/sd2/512/512',
    'https://picsum.photos/seed/sd3/512/512',
    'https://picsum.photos/seed/sd4/512/512',
  ],
  dalle: [
    'https://picsum.photos/seed/dalle1/512/512',
    'https://picsum.photos/seed/dalle2/512/512',
    'https://picsum.photos/seed/dalle3/512/512',
    'https://picsum.photos/seed/dalle4/512/512',
  ],
  midjourney: [
    'https://picsum.photos/seed/mj1/512/512',
    'https://picsum.photos/seed/mj2/512/512',
    'https://picsum.photos/seed/mj3/512/512',
    'https://picsum.photos/seed/mj4/512/512',
  ],
};

// 模型列表
const IMAGE_MODELS: ImageModel[] = [
  // 豆包模型
  {
    id: 'doubao-seedream-3-0-t2i-250415',
    name: '豆包通用3.0',
    publishDate: new Date('2025-04-15'),
    description: '最新的通用文生图模型，支持高质量图像生成',
    maxImages: 1,
    category: '豆包',
    demo: {
      prompt: '一只可爱的熊猫在竹林中玩耍，水彩风格',
      images: ['https://picsum.photos/seed/doubao-general-2.1/512/512'],
    },
    config: {
      maxConcurrent: 2,
      cooldownMs: 1000,
      group: 'doubao',
    },
  },
  {
    id: 'high_aes_general_v21_L',
    name: '豆包通用2.1',
    publishDate: new Date('2024-11-11'),
    description: '最新的通用文生图模型，支持高质量图像生成',
    maxImages: 1,
    category: '豆包',
    demo: {
      prompt: '一只可爱的熊猫在竹林中玩耍，水彩风格',
      images: ['https://picsum.photos/seed/doubao-general-2.1/512/512'],
    },
    config: {
      maxConcurrent: 2,
      cooldownMs: 1000,
      group: 'doubao',
    },
  },
  {
    id: 'high_aes_general_v20_L',
    name: '豆包通用2.0Pro',
    publishDate: new Date('2024-09-10'),
    description: '高级通用文生图模型，支持更精细的控制',
    maxImages: 1,
    category: '豆包',
    demo: {
      prompt: '一幅山水画，国画风格，云雾缭绕',
      images: ['https://picsum.photos/seed/doubao-general-2.0-pro/512/512'],
    },
    config: {
      maxConcurrent: 2,
      cooldownMs: 1000,
      group: 'doubao',
    },
  },
  {
    id: 'high_aes_general_v20',
    name: '豆包通用2.0',
    publishDate: new Date('2024-08-19'),
    description: '通用文生图模型，适合日常创作',
    maxImages: 1,
    category: '豆包',
    demo: {
      prompt: '一片樱花林，水彩风格，柔和的粉色和白色',
      images: ['https://picsum.photos/seed/doubao-general-2.0/512/512'],
    },
    config: {
      maxConcurrent: 2,
      cooldownMs: 1000,
      group: 'doubao',
    },
  },
  {
    id: 'high_aes_general_v14',
    name: '豆包通用1.4',
    publishDate: new Date('2024-06-13'),
    description: '经典通用文生图模型，稳定性好',
    maxImages: 1,
    category: '豆包',
    demo: {
      prompt: '一只可爱的猫咪，写实风格',
      images: ['https://picsum.photos/seed/doubao-general-1.4/512/512'],
    },
    config: {
      maxConcurrent: 2,
      cooldownMs: 1000,
      group: 'doubao',
    },
  },
  {
    id: 't2i_xl_sft',
    name: '豆包通用XL Pro',
    publishDate: new Date('2024-08-12'),
    description: '超大模型，支持超高分辨率图像生成',
    maxImages: 1,
    category: '豆包',
    demo: {
      prompt: '一幅宏伟的宫殿，写实风格',
      images: ['https://picsum.photos/seed/doubao-general-xl-pro/512/512'],
    },
    config: {
      maxConcurrent: 2,
      cooldownMs: 1000,
      group: 'doubao',
    },
  },
  {
    id: 'gpt_4o',
    name: 'GPT-4o-Image',
    publishDate: new Date('2025-03-25'),
    description: 'OpenAI 的最新模型，支持高质量图像生成',
    maxImages: 4,
    category: 'OpenAI',
    demo: {
      prompt: 'A whimsical illustration of a tea party in a garden',
      images: demoImages.dalle,
    },
    config: {
      maxConcurrent: 2,
      cooldownMs: 1000,
      group: 'openai',
    },
  },
  {
    id: 'cogView-4-250304',
    name: 'CogView-4',
    publishDate: new Date('2025-03-04'),
    description: '智谱推出的首个支持生成汉字的开源文生图模型，专注于将文本描述转化为高质量图像',
    maxImages: 4,
    category: '智谱',
    demo: {
      prompt: 'A dreamy portrait of a mermaid in an underwater palace',
      images: demoImages.midjourney,
    },
    config: {
      maxConcurrent: 2,
      cooldownMs: 1000,
      group: 'cogview',
    },
  },
  // {
  //   id: 'irag-1.0',
  //   name: 'IRAG-1.0',
  //   publishDate: new Date('2024-11-12'),
  //   description: '百度自研的 iRAG（image based RAG），检索增强的文生图技术，将百度搜索的亿级图片资源跟强大的基础模型能力相结合，就可以生成各种超真实的图片',
  //   maxImages: 4,
  //   category: '文心一言',
  //   demo: {
  //     prompt: 'A dreamy portrait of a mermaid in an underwater palace',
  //     images: demoImages.midjourney,
  //   },
  //   config: {
  //     maxConcurrent: 2,
  //     cooldownMs: 1000,
  //     group: 'wenxin',
  //   },
  // },
  {
    id: 'wanx2.0-t2i-turbo',
    name: '通义万相2.0-文生图-Turbo',
    publishDate: new Date('2025-01-17'),
    description: '通义万相 2.0-T2I-Turbo 是通义万相 2.0 的升级版本，支持更高分辨率、更高质量的图像生成',
    maxImages: 4,
    category: '通义万相',
    demo: {
      prompt: 'A dreamy portrait of a mermaid in an underwater palace',
      images: demoImages.midjourney,
    },
    config: {
      maxConcurrent: 2,
      cooldownMs: 1000,
      group: 'wanxiang',
    },
  },
  {
    id: 'wanx2.1-t2i-turbo',
    name: '通义万相2.1-文生图-Turbo',
    publishDate: new Date('2025-01-08'),
    description: '通义万相 2.1-T2I-Turbo 是通义万相 2.1 的升级版本，支持更高分辨率、更高质量的图像生成',
    maxImages: 4,
    category: '通义万相',
    demo: {
      prompt: 'A dreamy portrait of a mermaid in an underwater palace',
      images: demoImages.midjourney,
    },
    config: {
      maxConcurrent: 2,
      cooldownMs: 1000,
      group: 'wanxiang',
    },
  },
  {
    id: 'wanx2.1-t2i-plus',
    name: '通义万相2.1-文生图-Plus',
    publishDate: new Date('2025-01-08'),
    description: '通义万相 2.1-T2I-Plus 是通义万相 2.1 的升级版本，支持更高分辨率、更高质量的图像生成',
    maxImages: 4,
    category: '通义万相',
    demo: {
      prompt: 'A dreamy portrait of a mermaid in an underwater palace',
      images: demoImages.midjourney,
    },
    config: {
      maxConcurrent: 2,
      cooldownMs: 1000,
      group: 'wanxiang',
    },
  },
  {
    id: 'jimeng_high_aes_general_v21_L',
    name: '即梦文生图2.1',
    publishDate: new Date('2024-12-18'),
    description: '字节跳动旗下的即梦AI 推出的图片模型2.1版本，声称能够通过简单的指令，用户只需一句话即可定制个性化的海报',
    maxImages: 4,
    category: '即梦',
    demo: {
      prompt: 'A dreamy portrait of a mermaid in an underwater palace',
      images: demoImages.midjourney,
    },
    config: {
      maxConcurrent: 2,
      cooldownMs: 1000,
      group: 'jimeng',
    },
  },
  // {
  //   id: 'midjourney-v6',
  //   name: 'Midjourney v6',
  //   description: 'Latest version with improved realism and artistic capabilities',
  //   maxImages: 4,
  //   category: 'Midjourney',
  //   demo: {
  //     prompt: 'A cinematic scene of a dragon flying over mountains at sunset',
  //     images: demoImages.midjourney,
  //   },
  // },
];

// 导出单例实例
export const modelService = ModelService.getInstance();
