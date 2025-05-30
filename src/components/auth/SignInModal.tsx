import { useState, useEffect } from 'react';
import { EnvelopeIcon, KeyIcon, TicketIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/common/Modal';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const { sendVerificationCode, verifyCode } = useAuth();
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInviteVerified, setIsInviteVerified] = useState(false);

  // 处理倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 处理邀请码验证
  const handleInviteVerification = () => {
    setError(null);
    if (inviteCode === 'innoverse0') {
      setIsInviteVerified(true);
    } else {
      setError(t('auth.signIn.inviteCode.invalid'));
    }
  };

  // 处理发送验证码
  const handleSendCode = async () => {
    if (!isInviteVerified) {
      setError(t('auth.signIn.inviteCode.required'));
      return;
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('auth.signIn.email.invalid'));
      return;
    }

    try {
      setError(null);
      setIsSendingCode(true);
      await sendVerificationCode(email);
      setCountdown(60);
    } catch (err) {
      console.error('发送验证码失败', err);
      setError(t('auth.signIn.verificationCode.sendFailed'));
    } finally {
      setIsSendingCode(false);
    }
  };

  // 处理登录
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!isInviteVerified) {
      setError(t('auth.signIn.inviteCode.required'));
      return;
    }
    
    if (!email || !verificationCode) {
      setError(t('auth.signIn.verificationCode.required'));
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyCode(email, verificationCode);
      onSuccess?.();
      onClose();
      setEmail('');
      setVerificationCode('');
      setInviteCode('');
      setIsInviteVerified(false);
    } catch (err) {
      setError(t('auth.signIn.verificationCode.invalid'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('auth.signIn.title')}
      maxWidth="md"
      closeOnBackdropClick={false}
    >
      {/* 欢迎文本 */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
          {t('auth.signIn.subtitle')}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('auth.signIn.description')}
        </p>
      </div>

      {/* 错误提示 */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mb-4 p-3 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-400 text-sm rounded-lg"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 表单 */}
      <form onSubmit={handleSignIn} className="space-y-6">
        {/* 邀请码输入框 */}
        <div>
          <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('auth.signIn.inviteCode.label')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <TicketIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              id="inviteCode"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder={t('auth.signIn.inviteCode.placeholder')}
              disabled={isInviteVerified}
              className={`block w-full outline-none pl-10 pr-32 py-3.5 border ${
                isInviteVerified ? 'border-green-500 bg-green-50 dark:bg-green-900 dark:text-gray-400' : 'border-gray-200 dark:border-gray-800'
              } rounded-xl bg-white dark:bg-gray-900 shadow-sm placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-base dark:text-gray-100`}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <button
                type="button"
                onClick={handleInviteVerification}
                disabled={isInviteVerified || !inviteCode}
                className={`text-sm font-medium ${
                  isInviteVerified || !inviteCode
                    ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-500'
                }`}
              >
                {isInviteVerified ? t('auth.signIn.inviteCode.verified') : t('auth.signIn.inviteCode.verify')}
              </button>
            </div>
          </div>
        </div>

        {/* 邮箱输入框 */}
        <div className={`transition-opacity duration-200 ${isInviteVerified ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('auth.signIn.email.label')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <EnvelopeIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.signIn.email.placeholder')}
              disabled={!isInviteVerified}
              className="block w-full bg-white dark:bg-gray-900 outline-none pl-10 pr-3 py-3.5 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-base dark:text-gray-100"
            />
          </div>
        </div>

        {/* 验证码输入框 */}
        <div className={`transition-opacity duration-200 ${isInviteVerified ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('auth.signIn.verificationCode.label')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <KeyIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              id="code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder={t('auth.signIn.verificationCode.placeholder')}
              disabled={!isInviteVerified}
              className="block w-full bg-white dark:bg-gray-900 outline-none pl-10 pr-32 py-3.5 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-base dark:text-gray-100"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <button
                type="button"
                onClick={handleSendCode}
                disabled={countdown > 0 || !email || !isInviteVerified || isSendingCode}
                className={`text-sm font-medium ${
                  countdown > 0 || !email || !isInviteVerified || isSendingCode
                    ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-500'
                }`}
              >
                {isSendingCode ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin mr-1" />
                    {t('auth.signIn.verificationCode.sending')}
                  </div>
                ) : countdown > 0 ? (
                  t('auth.signIn.verificationCode.countdown', { count: countdown })
                ) : (
                  t('auth.signIn.verificationCode.send')
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 登录按钮 */}
        <button
          type="submit"
          disabled={isSubmitting || !isInviteVerified || !email || !verificationCode}
          className={`w-full py-3.5 px-4 rounded-xl text-white font-medium text-base ${
            isSubmitting || !isInviteVerified || !email || !verificationCode
              ? 'bg-indigo-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              {t('auth.signIn.submit.loading')}
            </div>
          ) : (
            t('auth.signIn.submit.default')
          )}
        </button>
      </form>

      {/* 底部提示 */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('auth.signIn.terms.prefix')}
          <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-500 mx-1">
            {t('auth.signIn.terms.terms')}
          </a>
          {t('auth.signIn.terms.and')}
          <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-500 mx-1">
            {t('auth.signIn.terms.privacy')}
          </a>
        </p>
      </div>
    </Modal>
  );
};
