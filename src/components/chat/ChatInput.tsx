import { FC, useState, FormEvent } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface ChatInputProps {
  onSubmit?: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput: FC<ChatInputProps> = ({ onSubmit, disabled = false }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && onSubmit) {
      onSubmit(message.trim());
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="输入你的想法..."
        disabled={disabled}
        className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-200 text-base"
      />
      <motion.button
        type="submit"
        disabled={!message.trim() || disabled}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg ${
          !message.trim() || disabled
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-indigo-600 hover:bg-indigo-50'
        } transition-colors`}
      >
        <PaperAirplaneIcon className="w-5 h-5" />
      </motion.button>
    </form>
  );
}; 