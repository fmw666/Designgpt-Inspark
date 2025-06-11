import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import { PhotoIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { ImagePreview } from '@/components/common/ImagePreview';

interface Asset {
  id: string;
  url: string;
  title: string;
  tags: string[];
  createdAt: string;
  width: number;
  height: number;
}

const AssetsInterface: FC = () => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<Asset | null>(null);

  // 模拟数据
  const assets: Asset[] = [
    {
      id: '1',
      url: 'https://picsum.photos/seed/landscape1/400/600',
      title: '山水画卷',
      tags: ['风景', '国画'],
      createdAt: '2024-03-20',
      width: 400,
      height: 600,
    },
    {
      id: '2',
      url: 'https://picsum.photos/seed/portrait1/400/500',
      title: '写实人像',
      tags: ['人像', '写实'],
      createdAt: '2024-03-19',
      width: 400,
      height: 500,
    },
    {
      id: '3',
      url: 'https://picsum.photos/seed/anime1/400/400',
      title: '动漫风格',
      tags: ['动漫', '插画'],
      createdAt: '2024-03-18',
      width: 400,
      height: 400,
    },
    {
      id: '4',
      url: 'https://picsum.photos/seed/watercolor1/400/550',
      title: '水彩风景',
      tags: ['水彩', '风景'],
      createdAt: '2024-03-17',
      width: 400,
      height: 550,
    },
    {
      id: '5',
      url: 'https://picsum.photos/seed/digital1/400/450',
      title: '数字艺术',
      tags: ['数字艺术', '现代'],
      createdAt: '2024-03-16',
      width: 400,
      height: 450,
    },
    {
      id: '6',
      url: 'https://picsum.photos/seed/oil1/400/600',
      title: '油画创作',
      tags: ['油画', '艺术'],
      createdAt: '2024-03-15',
      width: 400,
      height: 600,
    },
    {
      id: '7',
      url: 'https://picsum.photos/seed/sketch1/400/500',
      title: '素描作品',
      tags: ['素描', '写生'],
      createdAt: '2024-03-14',
      width: 400,
      height: 500,
    },
    {
      id: '8',
      url: 'https://picsum.photos/seed/abstract1/400/400',
      title: '抽象艺术',
      tags: ['抽象', '现代'],
      createdAt: '2024-03-13',
      width: 400,
      height: 400,
    },
    {
      id: '9',
      url: 'https://picsum.photos/seed/landscape2/400/550',
      title: '自然风光',
      tags: ['风景', '自然'],
      createdAt: '2024-03-12',
      width: 400,
      height: 550,
    },
    {
      id: '10',
      url: 'https://picsum.photos/seed/portrait2/400/450',
      title: '人物肖像',
      tags: ['人像', '写实'],
      createdAt: '2024-03-11',
      width: 400,
      height: 450,
    },
    {
      id: '11',
      url: 'https://picsum.photos/seed/anime2/400/600',
      title: '二次元风格',
      tags: ['动漫', '二次元'],
      createdAt: '2024-03-10',
      width: 400,
      height: 600,
    },
    {
      id: '12',
      url: 'https://picsum.photos/seed/watercolor2/400/500',
      title: '水彩插画',
      tags: ['水彩', '插画'],
      createdAt: '2024-03-09',
      width: 400,
      height: 500,
    },
    {
      id: '13',
      url: 'https://picsum.photos/seed/digital2/400/400',
      title: '数字插画',
      tags: ['数字艺术', '插画'],
      createdAt: '2024-03-08',
      width: 400,
      height: 400,
    },
    {
      id: '14',
      url: 'https://picsum.photos/seed/oil2/400/550',
      title: '古典油画',
      tags: ['油画', '古典'],
      createdAt: '2024-03-07',
      width: 400,
      height: 550,
    },
    {
      id: '15',
      url: 'https://picsum.photos/seed/sketch2/400/450',
      title: '速写作品',
      tags: ['素描', '速写'],
      createdAt: '2024-03-06',
      width: 400,
      height: 450,
    },
  ];

  const handleImageClick = (asset: Asset) => {
    setSelectedImage(asset);
  };

  return (
    <div className="flex flex-col h-full relative">

      {/* Enhanced Masonry Grid */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 dark:from-gray-900 dark:to-gray-800 dark:bg-gray-900 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)]">
        <div className="w-full">
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 sm:gap-4 lg:gap-6 [column-fill:_balance] w-full">
            {assets.map((asset) => (
              <motion.div
                key={asset.id}
                className="relative mb-3 sm:mb-4 lg:mb-6 break-inside-avoid w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                whileHover={{ y: -4 }}
              >
                <div
                  className="group relative rounded-xl sm:rounded-2xl overflow-hidden bg-white dark:bg-gray-800 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 w-full"
                  onClick={() => handleImageClick(asset)}
                >
                  {/* Image Container */}
                  <div 
                    className="relative overflow-hidden w-full"
                    style={{ 
                      aspectRatio: `${asset.width}/${asset.height}`,
                      maxHeight: '600px'
                    }}
                  >
                    <img
                      src={asset.url}
                      alt={asset.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute inset-0 p-3 sm:p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-sm sm:text-base font-semibold text-white mb-1.5 sm:mb-2 drop-shadow-lg">
                        {asset.title}
                      </h3>
                      <div className="flex flex-wrap gap-1 sm:gap-1.5">
                        {asset.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-medium bg-white/20 backdrop-blur-md rounded-full text-white/90 border border-white/10"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Hover Effect Border */}
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <ImagePreview
          imageInfo={selectedImage && selectedImage.url ? {
            url: selectedImage.url || '',
            id: selectedImage.id || '',
            messageId: selectedImage.id || '',
            userPrompt: selectedImage.title,
            aiPrompt: '暂无',
            model: 'gpt-4o-image',
            createdAt: selectedImage.createdAt,
          } : null}
          onClose={() => setSelectedImage(null)}
          alt={selectedImage.title}
        />
      )}
    </div>
  );
};

export default AssetsInterface;
