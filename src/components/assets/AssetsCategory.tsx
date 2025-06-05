import { ClockIcon, FolderIcon, TagIcon } from "@heroicons/react/24/outline";

export const AssetsCategory: React.FC = () => {
  
  // 标签数据
  const tags = [
    { id: 'all', name: '全部', icon: FolderIcon, count: 128 },
    { id: 'recent', name: '最近使用', icon: ClockIcon, count: 12 },
    { id: 'favorites', name: '收藏夹', icon: TagIcon, count: 8 },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-1">
        {tags.map((tag) => (
          <button
            key={tag.id}
            className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group"
          >
            <div className="flex items-center gap-2">
              <tag.icon className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400" />
              <span>{tag.name}</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
              {tag.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AssetsCategory;
