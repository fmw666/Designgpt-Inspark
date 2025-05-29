import { FC, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon, EnvelopeIcon, CalendarIcon, ClockIcon, UserCircleIcon, PencilIcon, CheckIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { User } from '@/services/supabase';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';
import { getAvatarText, getAvatarClasses, getAvatarSizeClasses } from '@/utils/avatar';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export const UserProfileModal: FC<UserProfileModalProps> = ({ isOpen, onClose, user }) => {
  const { t, i18n } = useTranslation();
  const [isEditingName, setIsEditingName] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const updateDisplayName = useAuthStore(state => state.updateDisplayName);

  // 获取当前语言的 date-fns locale
  const dateLocale = i18n.language === 'zh' ? zhCN : enUS;

  // 当用户数据更新时，更新本地状态
  useEffect(() => {
    setDisplayName(user.user_metadata?.display_name || '');
  }, [user]);

  // 处理保存用户名
  const handleSaveDisplayName = async () => {
    if (!displayName.trim()) {
      toast.error(t('profile.displayName.empty'));
      return;
    }

    // 如果用户名没有变化，直接关闭编辑状态
    if (displayName.trim() === user.user_metadata?.display_name) {
      setIsEditingName(false);
      return;
    }

    try {
      await updateDisplayName(displayName.trim());
      toast.success(t('profile.displayName.updated'));
      setIsEditingName(false);
    } catch (error) {
      console.error('Error updating display name:', error);
      toast.error(t('profile.displayName.updateFailed'));
    }
  };

  // 处理取消编辑
  const handleCancelEdit = () => {
    setDisplayName(user.user_metadata?.display_name || '');
    setIsEditingName(false);
  };

  if (!user) {
    console.error('User data is missing in UserProfileModal');
    return null;
  }

  // 获取当前用户名
  const currentDisplayName = user.user_metadata?.display_name;

  // 格式化日期的函数
  const formatDate = (date: string | null) => {
    if (!date) return t('profile.createdAt.noRecord');
    const formatString = i18n.language === 'zh' ? 'yyyy年MM月dd日 HH:mm' : 'MMM dd, yyyy HH:mm';
    return format(new Date(date), formatString, { locale: dateLocale });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[9999]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-6 text-left align-middle shadow-xl">
                {/* 标题栏 */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <UserCircleIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100"
                    >
                      {t('profile.title')}
                    </Dialog.Title>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* 头像和用户名区域 */}
                <div className="flex flex-col items-center mb-6">
                  <div className={`${getAvatarClasses()} ${getAvatarSizeClasses('lg')} mb-6`}>
                    <span>
                      {getAvatarText(user)}
                    </span>
                  </div>
                  
                  {/* 用户名编辑区域 */}
                  <div className="flex items-center justify-center w-full">
                    {isEditingName ? (
                      <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-1.5">
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="px-4 py-2 text-lg font-medium text-gray-900 dark:text-gray-100 bg-transparent border-none focus:outline-none focus:ring-0 w-48 placeholder:text-gray-400 dark:placeholder:text-gray-600"
                          placeholder={t('profile.displayName.placeholder')}
                          maxLength={10}
                          autoFocus
                        />
                        <div className="flex items-center gap-1 pr-1">
                          <button
                            onClick={handleSaveDisplayName}
                            className="p-1.5 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors"
                            title={t('profile.displayName.save')}
                          >
                            <CheckIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1.5 text-gray-500 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            title={t('profile.displayName.cancel')}
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative flex items-center justify-center group">
                        <div className="relative text-center">
                          <span className={`text-2xl ${
                            currentDisplayName 
                              ? 'font-semibold bg-gradient-to-r from-gray-900 dark:from-gray-100 to-gray-700 dark:to-gray-300 bg-clip-text text-transparent'
                              : 'text-gray-400 dark:text-gray-600 italic'
                          }`}>
                            {currentDisplayName || t('profile.displayName.set')}
                          </span>
                          {currentDisplayName && (
                            <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 dark:from-indigo-400 to-purple-500 dark:to-purple-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></div>
                          )}
                        </div>
                        <button
                          onClick={() => setIsEditingName(true)}
                          className={`absolute -right-9 p-1.5 rounded-lg ${
                            currentDisplayName
                              ? 'text-gray-400 dark:text-gray-600 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100'
                              : 'text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-900 opacity-100'
                          }`}
                          title={currentDisplayName ? t('profile.displayName.edit') : t('profile.displayName.set')}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className={`mt-2 text-xs text-gray-500 dark:text-gray-600 transition-all duration-300 ease-in-out ${
                    isEditingName ? 'opacity-100 h-5' : 'opacity-0 h-0'
                  }`}>
                    {displayName.length}/10
                  </div>
                </div>

                {/* 内容区域 */}
                <div className="space-y-4">
                  {/* 邮箱信息 */}
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <EnvelopeIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t('profile.email.label')}
                      </div>
                      <div className="text-sm text-gray-900 dark:text-gray-100 mt-1">{user.email}</div>
                    </div>
                  </div>

                  {/* 创建时间 */}
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <CalendarIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t('profile.createdAt.label')}
                      </div>
                      <div className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {formatDate(user.created_at)}
                      </div>
                    </div>
                  </div>

                  {/* 最后登录时间 */}
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <ClockIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t('profile.lastSignIn.label')}
                      </div>
                      <div className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {formatDate(user.last_sign_in_at)}
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}; 