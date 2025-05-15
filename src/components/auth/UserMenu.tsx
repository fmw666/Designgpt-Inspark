import { useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { SignInModal } from './SignInModal';

export const UserMenu: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  // 模拟用户数据
  const user = {
    name: '测试用户',
    avatar: null,
  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
  };

  return (
    <>
      <Menu as="div" className="relative">
        <Menu.Button className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-100 transition-colors">
          {isLoggedIn ? (
            <>
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                  {user.name.charAt(0)}
                </div>
              )}
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {user.name}
              </span>
            </>
          ) : (
            <>
              <UserCircleIcon className="w-6 h-6 text-gray-400" />
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                登录
              </span>
            </>
          )}
        </Menu.Button>

        <Transition
          enter="transition duration-100 ease-out"
          enterFrom="transform scale-95 opacity-0"
          enterTo="transform scale-100 opacity-100"
          leave="transition duration-75 ease-out"
          leaveFrom="transform scale-100 opacity-100"
          leaveTo="transform scale-95 opacity-0"
        >
          <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {isLoggedIn ? (
              <>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleSignOut}
                      className={`${
                        active ? 'bg-gray-50' : ''
                      } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                    >
                      <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400" />
                      退出登录
                    </button>
                  )}
                </Menu.Item>
              </>
            ) : (
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => setIsSignInModalOpen(true)}
                    className={`${
                      active ? 'bg-gray-50' : ''
                    } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                  >
                    <UserCircleIcon className="mr-3 h-5 w-5 text-gray-400" />
                    登录
                  </button>
                )}
              </Menu.Item>
            )}
          </Menu.Items>
        </Transition>
      </Menu>

      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
      />
    </>
  );
};
