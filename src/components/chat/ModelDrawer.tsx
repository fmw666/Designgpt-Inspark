import { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { ImageModel, modelService } from '@/services/modelService';
import { getDefaultSelectedModels } from '@/utils/modelUtils';

interface SelectedModel {
  id: string;
  count: number;
  name: string;
  category: string;
}

interface ModelDrawerProps {
  selectedModels: SelectedModel[];
  onModelChange: (models: SelectedModel[]) => void;
  disabled?: boolean;
}

export const ModelDrawer: React.FC<ModelDrawerProps> = ({
  selectedModels,
  onModelChange,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [models, setModels] = useState<ImageModel[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const drawerRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    const allModels = modelService.getAllModels();
    // 按发布日期排序
    const sortedModels = [...allModels].sort((a, b) => {
      const dateA = new Date(a.publishDate || 0);
      const dateB = new Date(b.publishDate || 0);
      return dateB.getTime() - dateA.getTime();
    });
    const allCategories = ['all', ...new Set(sortedModels.map(model => model.category))];
    setModels(sortedModels);
    setCategories(allCategories);

    // 只在组件首次加载时设置默认模型
    if (isInitialMount.current) {
      const defaultModels = getDefaultSelectedModels(sortedModels);
      onModelChange(defaultModels);
      isInitialMount.current = false;
    }
  }, [onModelChange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredModels = models.filter(model => {
    const matchesCategory = selectedCategory === 'all' || model.category === selectedCategory;
    const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         model.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleModelSelect = (modelId: string) => {
    const isSelected = selectedModels.some(m => m.id === modelId);
    if (isSelected) {
      onModelChange(selectedModels.filter(m => m.id !== modelId));
    } else {
      onModelChange([...selectedModels, { id: modelId, count: 1, category: models.find(m => m.id === modelId)?.category || '', name: models.find(m => m.id === modelId)?.name || '' }]);
    }
  };

  const handleCountChange = (modelId: string, newCount: number) => {
    const validCount = Math.max(1, Math.min(4, newCount));
    onModelChange(
      selectedModels.map(m => 
        m.id === modelId ? { ...m, count: validCount } : m
      )
    );
  };

  const handleRemoveModel = (modelId: string) => {
    onModelChange(selectedModels.filter(m => m.id !== modelId));
  };

  const formatDate = (date: string | number | Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={`relative ${disabled ? 'opacity-50 pointer-events-none' : ''}`} ref={drawerRef}>
      {/* 已选模型标签和添加按钮 */}
      <div className="flex flex-wrap items-center gap-2">
        {selectedModels.length > 0 && (
          <>
            {selectedModels.map(({ id, count }) => {
              const model = models.find(m => m.id === id);
              return (
                <div
                  key={id}
                  className="flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full text-sm"
                >
                  <span>{model?.name}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCountChange(id, count - 1)}
                      className="w-5 h-5 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500 hover:bg-indigo-200 dark:hover:bg-indigo-600"
                    >
                      -
                    </button>
                    <span className="text-xs font-medium">{count}</span>
                    <button
                      onClick={() => handleCountChange(id, count + 1)}
                      className="w-5 h-5 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500 hover:bg-indigo-200 dark:hover:bg-indigo-600"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemoveModel(id)}
                    className="ml-1 text-indigo-400 dark:text-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </>
        )}
        
        {/* 添加模型按钮 */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 px-3 py-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          <span>添加模型</span>
        </button>
      </div>

      {/* 模型选择面板 */}
      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg mb-2 flex flex-col max-h-[60vh]">
          {/* 可滚动的模型列表区域 */}
          <div className="overflow-y-auto p-4 flex-1">
            {filteredModels.length > 0 ? (
              <div className="space-y-2">
                {filteredModels.map((model) => {
                  const isSelected = selectedModels.some(m => m.id === model.id);
                  const selectedCount = selectedModels.find(m => m.id === model.id)?.count || 1;
                  return (
                    <div
                      key={model.id}
                      onClick={() => handleModelSelect(model.id)}
                      className={`w-full p-3 rounded-lg text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-900 border-indigo-200 dark:border-indigo-800'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-transparent'
                      } border`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">{model.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{model.description}</p>
                          {model.publishDate && (
                            <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                              发布日期: {formatDate(model.publishDate)}
                            </p>
                          )}
                        </div>
                        {isSelected && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCountChange(model.id, selectedCount - 1);
                              }}
                              className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                              -
                            </button>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedCount}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCountChange(model.id, selectedCount + 1);
                              }}
                              className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600">
                  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">未找到相关模型</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {searchQuery ? (
                    <>
                      没有找到与 "<span className="text-gray-700 dark:text-gray-300 font-medium">{searchQuery}</span>" 相关的模型
                    </>
                  ) : (
                    "当前分类下暂无可用模型"
                  )}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    className="mt-4 px-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900 rounded-lg transition-colors"
                  >
                    清除搜索条件
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 固定底部区域 */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            {/* 类别选择 */}
            <div className="flex gap-2 overflow-x-auto pb-4">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {category === 'all' ? '全部' : category}
                </button>
              ))}
            </div>

            {/* 搜索框 */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索模型..."
                className="w-full pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 ease-in-out"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-600" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 