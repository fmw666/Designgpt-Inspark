import { ImageModel } from '@/services/modelService';

/**
 * 获取每个类别的最新模型
 * @param models 所有可用模型列表
 * @returns 按类别分组的最新模型映射
 */
export const getLatestModelsByCategory = (models: ImageModel[]): Record<string, ImageModel> => {
  const latestModels: Record<string, ImageModel> = {};
  
  // 按类别分组
  const modelsByCategory = models.reduce((acc, model) => {
    const category = model.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(model);
    return acc;
  }, {} as Record<string, ImageModel[]>);

  // 获取每个类别的最新模型（按发布日期）
  Object.entries(modelsByCategory).forEach(([category, categoryModels]) => {
    // 按发布日期排序
    const sortedModels = categoryModels.sort((a, b) => {
      const dateA = new Date(a.publishDate || 0);
      const dateB = new Date(b.publishDate || 0);
      return dateB.getTime() - dateA.getTime();
    });

    if (sortedModels.length > 0) {
      latestModels[category] = sortedModels[0];
    }
  });

  return latestModels;
};

/**
 * 获取默认选中的模型列表
 * @param models 所有可用模型列表
 * @returns 默认选中的模型列表
 */
export const getDefaultSelectedModels = (models: ImageModel[]): { id: string; count: number; category: string, name: string }[] => {
  const latestModels = getLatestModelsByCategory(models);
  return Object.values(latestModels).map(model => ({
    id: model.id,
    count: model.category === '豆包' ? 3 : model.category === 'OpenAI' ? 2 : 1,
    category: model.category,
    name: model.name
  }));
};
