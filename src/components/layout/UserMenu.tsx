import { FC, Fragment, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { UserCircleIcon, UserIcon, ArrowRightOnRectangleIcon, Cog6ToothIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import { SettingsModal } from '../user/SettingsModal';
import { UserProfileModal } from '../user/UserProfileModal';
import { getAvatarClasses, getAvatarSizeClasses, getAvatarText } from '@/utils/avatar';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

interface UserMenuProps {
  isCollapsed?: boolean;
  onSignInClick: () => void;
}

const UserMenu: FC<UserMenuProps> = ({ isCollapsed, onSignInClick }) => {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleProfileClick = () => {
    setIsProfileOpen(true);
  };

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
  };

  const isAssetsPage = location.pathname.startsWith('/assets');

  if (!user) {
    return (
      <button
        onClick={onSignInClick}
        className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <UserCircleIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        {!isCollapsed && (
          <span className="text-sm text-gray-700 dark:text-gray-300">{t('auth.login')}</span>
        )}
      </button>
    );
  }

  return (
    <>
      <Menu as="div" className="relative">
        {({ open }) => (
          <>
            <Menu.Button
              className={`flex items-center gap-2 w-full p-2 rounded-lg transition-colors ${
                open
                  ? 'bg-gray-100 dark:bg-gray-800'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400 flex items-center justify-center text-white font-medium shadow-sm">
                <div className={`${getAvatarClasses()} ${getAvatarSizeClasses('sm')}`}>
                  <span>
                    {getAvatarText(user)}
                  </span>
                </div>
              </div>
              {!isCollapsed && (
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                  {user.email || t('auth.notLogin')}
                </span>
              )}
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute bottom-full left-0 mb-2 w-48 origin-bottom-left rounded-xl bg-white dark:bg-gray-900 py-1 shadow-lg ring-1 ring-black/5 dark:ring-white/10 focus:outline-none border border-gray-100 dark:border-gray-800 z-[9999]">
                {/* 个人信息按钮 */}
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleProfileClick}
                      className={`${
                        active ? 'bg-gray-50 dark:bg-gray-800' : ''
                      } flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`}
                    >
                      <UserIcon className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                      {t('profile.title')}
                    </button>
                  )}
                </Menu.Item>

                {/* 设置按钮 */}
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleSettingsClick}
                      className={`${
                        active ? 'bg-gray-50 dark:bg-gray-800' : ''
                      } flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`}
                    >
                      <Cog6ToothIcon className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                      {t('settings.title')}
                    </button>
                  )}
                </Menu.Item>

                {/* 素材库按钮 - 仅在非素材库页面显示 */}
                {!isAssetsPage && (
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/assets"
                        className={`${
                          active ? 'bg-gray-50 dark:bg-gray-800' : ''
                        } flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`}
                      >
                        <PhotoIcon className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                        {t('assets.title')}
                      </Link>
                    )}
                  </Menu.Item>
                )}

                {/* 分隔线 */}
                <div className="my-1 border-t border-gray-100 dark:border-gray-800" />

                {/* 退出登录按钮 */}
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={signOut}
                      className={`${
                        active ? 'bg-gray-50 dark:bg-gray-800' : ''
                      } flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-800 transition-colors`}
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2 text-red-500 dark:text-red-400" />
                      {t('auth.logout')}
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>

      {/* 个人信息弹框 */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
      />

      {/* 设置弹框 */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
};

export default UserMenu;
