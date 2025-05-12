import { useState, useEffect, useRef } from 'react';
import { ChevronUpIcon, ChevronDownIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { getAllModels, ImageModel } from '@/services/modelService';
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
}

export const ModelDrawer: React.FC<ModelDrawerProps> = ({
  selectedModels,
  onModelChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [models, setModels] = useState<ImageModel[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const drawerRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    const allModels = getAllModels();
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
    <div className="relative" ref={drawerRef}>
      {/* 触发条 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-t-lg hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">选择模型</span>
          <span className="text-xs text-gray-500">
            {selectedModels.length > 0
              ? `已选择 ${selectedModels.length} 个模型`
              : '未选择'}
          </span>
        </div>
        {isOpen ? (
          <ChevronUpIcon className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-gray-500" />
        )}
      </button>

      {/* 已选模型标签 */}
      {selectedModels.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedModels.map(({ id, count }) => {
            const model = models.find(m => m.id === id);
            return (
              <div
                key={id}
                className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm"
              >
                <span>{model?.name}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCountChange(id, count - 1)}
                    className="w-5 h-5 flex items-center justify-center rounded-full bg-indigo-100 hover:bg-indigo-200"
                  >
                    -
                  </button>
                  <span className="text-xs font-medium">{count}</span>
                  <button
                    onClick={() => handleCountChange(id, count + 1)}
                    className="w-5 h-5 flex items-center justify-center rounded-full bg-indigo-100 hover:bg-indigo-200"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => handleRemoveModel(id)}
                  className="ml-1 text-indigo-400 hover:text-indigo-600"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 模型选择面板 */}
      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mb-2 flex flex-col max-h-[60vh]">
          {/* 可滚动的模型列表区域 */}
          <div className="overflow-y-auto p-4 flex-1">
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
                        ? 'bg-indigo-50 border-indigo-200'
                        : 'hover:bg-gray-50 border-transparent'
                    } border`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{model.name}</h3>
                        <p className="text-sm text-gray-500">{model.description}</p>
                        {model.publishDate && (
                          <p className="text-xs text-gray-400 mt-1">
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
                            className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                          >
                            -
                          </button>
                          <span className="text-sm font-medium">{selectedCount}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCountChange(model.id, selectedCount + 1);
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
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
          </div>

          {/* 固定底部区域 */}
          <div className="p-4 border-t border-gray-200 bg-white">
            {/* 类别选择 */}
            <div className="flex gap-2 overflow-x-auto pb-4">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 