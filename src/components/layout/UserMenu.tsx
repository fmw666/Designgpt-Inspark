import { FC, Fragment, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { UserIcon, ArrowRightOnRectangleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import { SettingsModal } from '../user/SettingsModal';
import { UserProfileModal } from '../user/UserProfileModal';
import { getAvatarClasses, getAvatarSizeClasses, getAvatarText } from '@/utils/avatar';

interface UserMenuProps {
  isCollapsed?: boolean;
  onSignInClick: () => void;
}

const UserMenu: FC<UserMenuProps> = ({ isCollapsed, onSignInClick }) => {
  const { user, signOut } = useAuth();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleProfileClick = () => {
    setIsProfileOpen(true);
  };

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
  };

  if (!user) {
    return (
      <button
        onClick={onSignInClick}
        className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <UserCircleIcon className="w-8 h-8 text-gray-400" />
        {!isCollapsed && (
          <span className="text-sm text-gray-700">登录</span>
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
                  ? 'bg-gray-100'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium shadow-sm">
                <div className={`${getAvatarClasses()} ${getAvatarSizeClasses('sm')}`}>
                  <span>
                    {getAvatarText(user)}
                  </span>
                </div>
              </div>
              {!isCollapsed && (
                <span className="text-sm text-gray-700 truncate">
                  {user.email || '未登录'}
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
              <Menu.Items className="absolute bottom-full left-0 mb-2 w-48 origin-bottom-left rounded-xl bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-[9999]">
                {/* 个人信息按钮 */}
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleProfileClick}
                      className={`${
                        active ? 'bg-gray-50' : ''
                      } flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors`}
                    >
                      <UserIcon className="w-4 h-4 mr-2 text-gray-500" />
                      个人信息
                    </button>
                  )}
                </Menu.Item>

                {/* 设置按钮 */}
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleSettingsClick}
                      className={`${
                        active ? 'bg-gray-50' : ''
                      } flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors`}
                    >
                      <Cog6ToothIcon className="w-4 h-4 mr-2 text-gray-500" />
                      设置
                    </button>
                  )}
                </Menu.Item>

                {/* 分隔线 */}
                <div className="my-1 border-t border-gray-100" />

                {/* 退出登录按钮 */}
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={signOut}
                      className={`${
                        active ? 'bg-gray-50' : ''
                      } flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors`}
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2 text-red-500" />
                      退出登录
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
