import { FC, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, EnvelopeIcon, CalendarIcon, ClockIcon, UserCircleIcon, PencilIcon, CheckIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
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
  const [isEditingName, setIsEditingName] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const updateDisplayName = useAuthStore(state => state.updateDisplayName);

  // 当用户数据更新时，更新本地状态
  useEffect(() => {
    setDisplayName(user.user_metadata?.display_name || '');
  }, [user]);

  // 处理保存用户名
  const handleSaveDisplayName = async () => {
    if (!displayName.trim()) {
      toast.error('用户名不能为空');
      return;
    }

    // 如果用户名没有变化，直接关闭编辑状态
    if (displayName.trim() === user.user_metadata?.display_name) {
      setIsEditingName(false);
      return;
    }

    try {
      await updateDisplayName(displayName.trim());
      toast.success('用户名已更新');
      setIsEditingName(false);
    } catch (error) {
      console.error('Error updating display name:', error);
      toast.error('更新用户名失败');
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* 标题栏 */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <UserCircleIcon className="h-6 w-6 text-gray-500" />
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      个人信息
                    </Dialog.Title>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
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
                      <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm border border-gray-200 p-1.5">
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="px-4 py-2 text-lg font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 w-48 placeholder:text-gray-400"
                          placeholder="输入用户名..."
                          maxLength={10}
                          autoFocus
                        />
                        <div className="flex items-center gap-1 pr-1">
                          <button
                            onClick={handleSaveDisplayName}
                            className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                            title="保存"
                          >
                            <CheckIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                            title="取消"
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
                              ? 'font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'
                              : 'text-gray-400 italic'
                          }`}>
                            {currentDisplayName || '点击设置用户名'}
                          </span>
                          {currentDisplayName && (
                            <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></div>
                          )}
                        </div>
                        <button
                          onClick={() => setIsEditingName(true)}
                          className={`absolute -right-9 p-1.5 rounded-lg transition-all duration-200 ${
                            currentDisplayName
                              ? 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover:opacity-100'
                              : 'text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 opacity-100'
                          }`}
                          title={currentDisplayName ? "编辑用户名" : "设置用户名"}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className={`mt-2 text-xs text-gray-500 transition-all duration-300 ease-in-out ${
                    isEditingName ? 'opacity-100 h-5' : 'opacity-0 h-0'
                  }`}>
                    {displayName.length}/10
                  </div>
                </div>

                {/* 内容区域 */}
                <div className="space-y-4">
                  {/* 邮箱信息 */}
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <EnvelopeIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-500">邮箱</div>
                      <div className="text-sm text-gray-900 mt-1">{user.email}</div>
                    </div>
                  </div>

                  {/* 创建时间 */}
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <CalendarIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-500">创建时间</div>
                      <div className="text-sm text-gray-900 mt-1">
                        {user.created_at ? format(new Date(user.created_at), 'yyyy年MM月dd日 HH:mm', { locale: zhCN }) : '暂无记录'}
                      </div>
                    </div>
                  </div>

                  {/* 最后登录时间 */}
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <ClockIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-500">最后登录时间</div>
                      <div className="text-sm text-gray-900 mt-1">
                        {user.last_sign_in_at 
                          ? format(new Date(user.last_sign_in_at), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })
                          : '暂无记录'}
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