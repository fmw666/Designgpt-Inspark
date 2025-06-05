import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

export const AssetsInterface: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>{t('assets.backToChat')}</span>
            </Link>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('assets.title')}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-center text-gray-500 dark:text-gray-400">
            {t('assets.todo')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetsInterface;
