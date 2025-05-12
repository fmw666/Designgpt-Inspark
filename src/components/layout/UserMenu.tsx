import { FC, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

interface UserMenuProps {
  isCollapsed?: boolean;
}

const UserMenu: FC<UserMenuProps> = ({ isCollapsed = false }) => {
  const { user, signIn, logout, isAuthAvailable } = useAuth();

  const handleLogin = async () => {
    try {
      await signIn('demo@example.com', 'password123');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (!isAuthAvailable) {
    return (
      <div className="flex items-center gap-2 p-2">
        <UserCircleIcon className="h-6 w-6 text-gray-400" />
        {!isCollapsed && <span className="text-sm text-gray-400">Offline Mode</span>}
      </div>
    );
  }

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 w-full">
        <UserCircleIcon className="h-6 w-6 text-gray-600" />
        {!isCollapsed && (
          <span className="text-sm text-gray-700 truncate">
            {user ? user.email : 'Sign In'}
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
        <Menu.Items className={`absolute ${isCollapsed ? 'left-0' : 'right-0'} bottom-full mb-2 w-48 origin-bottom-right bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`}>
          {user ? (
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } w-full text-left px-4 py-2 text-sm text-gray-700`}
                    onClick={() => logout()}
                  >
                    Sign Out
                  </button>
                )}
              </Menu.Item>
            </div>
          ) : (
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } w-full text-left px-4 py-2 text-sm text-gray-700`}
                    onClick={handleLogin}
                  >
                    Sign In
                  </button>
                )}
              </Menu.Item>
            </div>
          )}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default UserMenu;
