import { FC, useState, useEffect } from 'react';
import { FolderIcon, PhotoIcon, SparklesIcon, StarIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
  icon: typeof FolderIcon;
  count: number;
}

interface Tag {
  id: string;
  name: string;
  count: number;
}

const AssetsCategory: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // 分类数据
  const categories: Category[] = [
    { id: 'all', name: '全部', icon: FolderIcon, count: 128 },
    { id: 'text2img', name: '文生图', icon: SparklesIcon, count: 86 },
    { id: 'img2img', name: '图生图', icon: PhotoIcon, count: 42 },
    { id: 'favorites', name: '收藏夹', icon: StarIcon, count: 12 },
  ];

  // 标签数据
  const tags: Tag[] = [
    { id: 'landscape', name: '风景', count: 45 },
    { id: 'portrait', name: '人像', count: 38 },
    { id: 'anime', name: '动漫', count: 32 },
    { id: 'realistic', name: '写实', count: 28 },
    { id: 'watercolor', name: '水彩', count: 25 },
    { id: 'oil', name: '油画', count: 22 },
    { id: 'sketch', name: '素描', count: 20 },
    { id: 'digital', name: '数字艺术', count: 18 },
  ];

  // 从 URL 参数初始化选中状态
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const categoryParam = searchParams.get('_c');
    
    if (categoryParam === null) {
      setSelectedCategory('all');
    } else {
      switch (categoryParam) {
        case '1':
          setSelectedCategory('text2img');
          break;
        case '2':
          setSelectedCategory('img2img');
          break;
        case '0':
          setSelectedCategory('favorites');
          break;
        default:
          setSelectedCategory('all');
      }
    }
  }, [location.search]);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    
    // 构建新的 URL
    let newPath = '/assets';
    const searchParams = new URLSearchParams(location.search);
    
    switch (categoryId) {
      case 'text2img':
        searchParams.set('_c', '1');
        break;
      case 'img2img':
        searchParams.set('_c', '2');
        break;
      case 'favorites':
        searchParams.set('_c', '0');
        break;
      default:
        searchParams.delete('_c');
    }
    
    // 保留其他查询参数
    const newSearch = searchParams.toString();
    const newUrl = newSearch ? `${newPath}?${newSearch}` : newPath;
    
    navigate(newUrl, { replace: true });
  };

  const handleTagClick = (tagId: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      }
      return [...prev, tagId];
    });
    // TODO: 触发标签筛选事件
  };

  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Title Section */}
      <div className="px-3 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="relative">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-2xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] rounded-2xl" />
          
          {/* Content */}
          <div className="relative px-4 py-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3"
            >
              {/* Icon */}
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <PhotoIcon className="w-5 h-5 text-white" />
              </div>
              
              {/* Text */}
              <div>
                <h2 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  {t('assets.title')}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {t('assets.description')}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="px-3 py-3">
        <div className="space-y-1">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-xl transition-all duration-200 group ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20'
                }`}>
                  <category.icon className="w-4 h-4" />
                </div>
                <span className="font-medium">{category.name}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full transition-colors ${
                selectedCategory === category.id
                  ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
              }`}>
                {category.count}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="px-3 py-3 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 px-2 mb-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200 ease-in-out"
            />
          </div>
        </div>

        <motion.div 
          className="flex flex-wrap gap-2 px-2"
          layout
        >
          <AnimatePresence mode="popLayout">
            {filteredTags.map((tag) => (
              <motion.button
            key={tag.id}
                onClick={() => handleTagClick(tag.id)}
                className={`px-3 py-1.5 text-sm rounded-full transition-all duration-200 ${
                  selectedTags.includes(tag.id)
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                {tag.name}
                <span className={`ml-1 text-xs ${
                  selectedTags.includes(tag.id)
                    ? 'text-white/80'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  ({tag.count})
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredTags.length === 0 && (
          <motion.div 
            className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            未找到相关标签
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AssetsCategory;
