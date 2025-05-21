import { FC } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, BellIcon, MoonIcon, GlobeAltIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: FC<SettingsModalProps> = ({ isOpen, onClose }) => {
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
                    <Cog6ToothIcon className="h-6 w-6 text-gray-500" />
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      设置
                    </Dialog.Title>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* 内容区域 */}
                <div className="space-y-4">
                  {/* 通知设置 */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <BellIcon className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">通知设置</div>
                        <div className="text-xs text-gray-500 mt-0.5">管理应用通知</div>
                      </div>
                    </div>
                    <button className="text-sm text-indigo-600 hover:text-indigo-700">
                      管理
                    </button>
                  </div>

                  {/* 主题设置 */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <MoonIcon className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">主题设置</div>
                        <div className="text-xs text-gray-500 mt-0.5">切换深色/浅色模式</div>
                      </div>
                    </div>
                    <button className="text-sm text-indigo-600 hover:text-indigo-700">
                      切换
                    </button>
                  </div>

                  {/* 语言设置 */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <GlobeAltIcon className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">语言设置</div>
                        <div className="text-xs text-gray-500 mt-0.5">切换应用语言</div>
                      </div>
                    </div>
                    <button className="text-sm text-indigo-600 hover:text-indigo-700">
                      切换
                    </button>
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