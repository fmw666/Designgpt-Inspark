import { useState, useEffect } from 'react';
import { XMarkIcon, EnvelopeIcon, KeyIcon, TicketIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose, onSuccess }) => {
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
      setError('邀请码无效');
    }
  };

  // 处理发送验证码
  const handleSendCode = async () => {
    if (!isInviteVerified) {
      setError('请先验证邀请码');
      return;
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('请输入有效的邮箱地址');
      return;
    }

    try {
      setError(null);
      setIsSendingCode(true);
      await sendVerificationCode(email);
      setCountdown(60);
    } catch (err) {
      console.error('发送验证码失败', err);
      setError('发送验证码失败，请稍后重试');
    } finally {
      setIsSendingCode(false);
    }
  };

  // 处理登录
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!isInviteVerified) {
      setError('请先验证邀请码');
      return;
    }
    
    if (!email || !verificationCode) {
      setError('请输入邮箱和验证码');
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyCode(email, verificationCode);
      // 先调用 onSuccess 回调
      onSuccess?.();
      // 然后关闭模态框
      onClose();
      // 重置表单状态
      setEmail('');
      setVerificationCode('');
      setInviteCode('');
      setIsInviteVerified(false);
    } catch (err) {
      setError('验证码错误，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-xl"
          >
            {/* 顶部导航栏 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="w-8" /> {/* 占位，保持标题居中 */}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                <h2 className="text-lg font-medium text-gray-900">欢迎登录</h2>
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* 主要内容区域 */}
            <div className="p-6">
              {/* 欢迎文本 */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  欢迎使用 AI 绘图平台
                </h1>
                <p className="text-sm text-gray-500">
                  邀请码+邮箱验证码 登录
                </p>
              </div>

              {/* 错误提示 */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                  {error}
                </div>
              )}

              {/* 表单 */}
              <form onSubmit={handleSignIn} className="space-y-6">
                {/* 邀请码输入框 */}
                <div>
                  <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-1">
                    邀请码
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <TicketIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="inviteCode"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      placeholder="请输入邀请码"
                      disabled={isInviteVerified}
                      className={`block w-full pl-10 pr-32 py-3.5 border ${
                        isInviteVerified ? 'border-green-500 bg-green-50' : 'border-gray-200'
                      } rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-base`}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <button
                        type="button"
                        onClick={handleInviteVerification}
                        disabled={isInviteVerified || !inviteCode}
                        className={`text-sm font-medium ${
                          isInviteVerified || !inviteCode
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-indigo-600 hover:text-indigo-700'
                        }`}
                      >
                        {isInviteVerified ? '已验证' : '验证'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 邮箱输入框 */}
                <div className={`transition-opacity duration-200 ${isInviteVerified ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    邮箱
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="请输入邮箱"
                      disabled={!isInviteVerified}
                      className="block w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-base"
                    />
                  </div>
                </div>

                {/* 验证码输入框 */}
                <div className={`transition-opacity duration-200 ${isInviteVerified ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                    验证码
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="请输入验证码"
                      disabled={!isInviteVerified}
                      className="block w-full pl-10 pr-32 py-3.5 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-base"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <button
                        type="button"
                        onClick={handleSendCode}
                        disabled={countdown > 0 || !email || !isInviteVerified || isSendingCode}
                        className={`text-sm font-medium ${
                          countdown > 0 || !email || !isInviteVerified || isSendingCode
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-indigo-600 hover:text-indigo-700'
                        }`}
                      >
                        {isSendingCode ? (
                          <div className="flex items-center">
                            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-1" />
                            发送中
                          </div>
                        ) : countdown > 0 ? (
                          `${countdown}秒后重试`
                        ) : (
                          '获取验证码'
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 登录按钮 */}
                <button
                  type="submit"
                  disabled={isSubmitting || !isInviteVerified || !email || !verificationCode}
                  className={`w-full py-3.5 px-4 rounded-xl text-white font-medium transition-all duration-200 text-base ${
                    isSubmitting || !isInviteVerified || !email || !verificationCode
                      ? 'bg-indigo-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      登录中...
                    </div>
                  ) : (
                    '登录'
                  )}
                </button>
              </form>

              {/* 底部提示 */}
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">
                  登录即表示您同意我们的
                  <a href="#" className="text-indigo-600 hover:text-indigo-700 mx-1">
                    服务条款
                  </a>
                  和
                  <a href="#" className="text-indigo-600 hover:text-indigo-700 mx-1">
                    隐私政策
                  </a>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
 