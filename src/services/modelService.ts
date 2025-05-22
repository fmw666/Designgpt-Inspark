
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
export const IMAGE_MODELS: ImageModel[] = [
  // 豆包模型
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
  },
  // {
  //   id: 'sd-v1.5',
  //   name: 'Stable Diffusion v1.5',
  //   description: 'General purpose image generation with good quality and speed',
  //   maxImages: 4,
  //   category: 'Stable Diffusion',
  //   demo: {
  //     prompt: 'A cute cat playing with a ball of yarn, soft lighting, detailed fur',
  //     images: demoImages.sd,
  //   },
  // },
  // {
  //   id: 'sd-v2.1',
  //   name: 'Stable Diffusion v2.1',
  //   description: 'Improved image quality and coherence with better prompt understanding',
  //   maxImages: 4,
  //   category: 'Stable Diffusion',
  //   demo: {
  //     prompt: 'A magical forest with glowing mushrooms and fairy lights',
  //     images: demoImages.sd,
  //   },
  // },
  // {
  //   id: 'sd-xl',
  //   name: 'Stable Diffusion XL',
  //   description: 'High-resolution image generation with enhanced details and composition',
  //   maxImages: 4,
  //   category: 'Stable Diffusion',
  //   demo: {
  //     prompt: 'A futuristic cityscape with flying cars and neon lights',
  //     images: demoImages.sd,
  //   },
  // },
  {
    id: 'gpt-4o-image',
    name: 'GPT-4o-Image',
    publishDate: new Date('2025-03-25'),
    description: 'OpenAI 的最新模型，支持高质量图像生成',
    maxImages: 4,
    category: 'OpenAI',
    demo: {
      prompt: 'A whimsical illustration of a tea party in a garden',
      images: demoImages.dalle,
    },
  },
  // {
  //   id: 'midjourney-v5',
  //   name: 'Midjourney v5',
  //   description: 'Artistic image generation with unique style and high quality',
  //   maxImages: 4,
  //   category: 'Midjourney',
  //   demo: {
  //     prompt: 'A dreamy portrait of a mermaid in an underwater palace',
  //     images: demoImages.midjourney,
  //   },
  // },
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

// 获取所有模型
export const getAllModels = (): ImageModel[] => {
  return IMAGE_MODELS;
};

// 获取指定类别的模型
export const getModelsByCategory = (category: string): ImageModel[] => {
  return IMAGE_MODELS.filter(model => model.category === category);
};

// 获取所有类别
export const getAllCategories = (): string[] => {
  return [...new Set(IMAGE_MODELS.map(model => model.category))];
};

// 根据ID获取模型
export const getModelById = (id: string): ImageModel | undefined => {
  return IMAGE_MODELS.find(model => model.id === id);
};

// 获取模型演示
export const getModelDemo = (modelId: string) => {
  const model = IMAGE_MODELS.find(m => m.id === modelId);
  return model?.demo;
};
