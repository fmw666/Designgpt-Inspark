import { FC } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Modal } from '../Modal';
import { ConfirmDialogProps, ConfirmDialogType } from './types';

const typeStyles: Record<ConfirmDialogType, { icon: string; button: string }> = {
  danger: {
    icon: 'text-red-500',
    button: 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 focus-visible:ring-red-500',
  },
  warning: {
    icon: 'text-amber-500',
    button: 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 focus-visible:ring-amber-500',
  },
  info: {
    icon: 'text-blue-500',
    button: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus-visible:ring-blue-500',
  },
};

export const ConfirmDialog: FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  type = 'warning',
  maxWidth = 'sm'
}) => {
  const styles = typeStyles[type];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth={maxWidth}
      showCloseButton={false}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className={`h-6 w-6 ${styles.icon}`} />
        </div>
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
          {title}
        </h3>
      </div>

      <div className="mt-2">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {message}
        </p>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          className="inline-flex justify-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
          onClick={onClose}
        >
          {cancelText}
        </button>
        <button
          type="button"
          className={`inline-flex justify-center rounded-lg px-4 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${styles.button}`}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};
