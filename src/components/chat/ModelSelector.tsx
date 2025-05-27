import { FC, useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, SparklesIcon } from '@heroicons/react/24/outline';
import CuteTooltip from '../common/CuteTooltip';
import LoadingSpinner from '../common/LoadingSpinner';

interface ImageModel {
  id: string;
  name: string;
  description: string;
  maxImages: number;
  category?: string;
  demo?: {
    prompt: string;
    images: string[];
  };
}

interface ModelSelectorProps {
  models: ImageModel[];
  selectedModels: { [key: string]: number };
  onChange: (selected: { [key: string]: number }) => void;
}

const ModelSelector: FC<ModelSelectorProps> = ({
  models,
  selectedModels,
  onChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, ] = useState(false);

  // Group models by category
  const groupedModels = models.reduce((acc, model) => {
    const category = model.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(model);
    return acc;
  }, {} as { [key: string]: ImageModel[] });

  const handleModelToggle = (modelId: string) => {
    const newSelected = { ...selectedModels };
    if (modelId in newSelected) {
      delete newSelected[modelId];
    } else {
      newSelected[modelId] = 1;
    }
    onChange(newSelected);
  };

  const handleImageCountChange = (modelId: string, count: number) => {
    if (count < 1 || count > models.find(m => m.id === modelId)?.maxImages!) return;
    onChange({
      ...selectedModels,
      [modelId]: count,
    });
  };

  const filteredModels = Object.entries(groupedModels).filter(([_, models]) => {
    if (!searchTerm) return true;
    return models.some(model => 
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-primary-500" />
          <h3 className="text-sm font-medium text-primary-700">Select Models</h3>
        </div>
        <CuteTooltip content="Click to show/hide model options">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary-500 hover:text-primary-600 transition-colors"
          >
            {isExpanded ? (
              <ChevronUpIcon className="h-5 w-5" />
            ) : (
              <ChevronDownIcon className="h-5 w-5" />
            )}
          </button>
        </CuteTooltip>
      </div>

      {isExpanded && (
        <>
          <div className="relative">
            <input
              type="text"
              placeholder="Search models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm"
            />
            {isLoading && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <LoadingSpinner size="sm" />
              </div>
            )}
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredModels.map(([category, models]) => (
              <div key={category} className="space-y-2">
                <h4 className="text-xs font-medium text-primary-500 uppercase tracking-wider">
                  {category}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {models.map((model) => (
                    <div
                      key={model.id}
                      className={`relative rounded-lg border p-3 cursor-pointer transition-all ${
                        model.id in selectedModels
                          ? 'border-primary-500 bg-primary-50 shadow-sm'
                          : 'border-primary-200 hover:border-primary-300 hover:bg-primary-50/50'
                      }`}
                      onClick={() => handleModelToggle(model.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-medium text-primary-900">
                            {model.name}
                          </h4>
                          <p className="text-xs text-primary-500 mt-1 line-clamp-2">
                            {model.description}
                          </p>
                          {model.demo && (
                            <CuteTooltip
                              content={
                                <div className="space-y-2">
                                  <p className="font-medium">Demo Prompt:</p>
                                  <p className="text-xs">{model.demo.prompt}</p>
                                </div>
                              }
                              position="right"
                            >
                              <span className="text-xs text-primary-400 hover:text-primary-500 cursor-help">
                                View demo
                              </span>
                            </CuteTooltip>
                          )}
                        </div>
                        {model.id in selectedModels && (
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              className="text-primary-600 hover:text-primary-700 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleImageCountChange(
                                  model.id,
                                  selectedModels[model.id] - 1
                                );
                              }}
                            >
                              -
                            </button>
                            <span className="text-sm text-primary-700">
                              {selectedModels[model.id]}
                            </span>
                            <button
                              type="button"
                              className="text-primary-600 hover:text-primary-700 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleImageCountChange(
                                  model.id,
                                  selectedModels[model.id] + 1
                                );
                              }}
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ModelSelector; 