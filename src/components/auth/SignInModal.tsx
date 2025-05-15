import { useState, useEffect } from 'react';
import { XMarkIcon, PhoneIcon, KeyIcon, TicketIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose }) => {
  const { sendVerificationCode, verifyCode, initRecaptcha } = useAuth();
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInviteVerified, setIsInviteVerified] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);

  // 在 Modal 打开时初始化 reCAPTCHA
  useEffect(() => {
    if (isOpen) {
      // 给 DOM 一点时间来渲染 reCAPTCHA 容器
      setTimeout(() => {
        initRecaptcha();
        console.log('initRecaptcha');
      }, 100);
    }
  }, [isOpen, initRecaptcha]);

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
    if (phone.length !== 11) return;

    // 如果是测试账号，直接设置验证码
    if (phone === '18066668888') {
      setVerificationCode('123456');
      return;
    }

    try {
      setError(null);
      const id = await sendVerificationCode(`+86${phone}`);
      setVerificationId(id);
      setCountdown(60);
    } catch (err) {
      console.error('发送验证码失败', err);
      setError('发送验证码失败，请稍后重试');
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
    
    if (phone.length !== 11 || verificationCode.length !== 6) {
      setError('请输入正确的手机号和验证码');
      return;
    }

    // 测试用户验证
    if (phone === '18066668888' && verificationCode === '123456') {
      setIsSubmitting(true);
      try {
        // 测试用户直接登录成功
        await new Promise(resolve => setTimeout(resolve, 500));
        onClose();
      } catch (err) {
        setError('登录失败，请稍后重试');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // 正常用户验证
    if (!verificationId) {
      setError('请先获取验证码');
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyCode(verificationId, verificationCode);
      onClose();
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
                  邀请码+手机号 登录验证
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  测试账号：18066668888 / 123456
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
                <div id="captcha__container" className="hidden" />
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

                {/* 手机号输入框 */}
                <div className={`transition-opacity duration-200 ${isInviteVerified ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    手机号
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                      placeholder="请输入手机号"
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
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="请输入验证码"
                      disabled={!isInviteVerified}
                      className="block w-full pl-10 pr-32 py-3.5 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-base"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <button
                        type="button"
                        id="send-code-button"
                        onClick={handleSendCode}
                        disabled={countdown > 0 || phone.length !== 11 || !isInviteVerified}
                        className={`text-sm font-medium ${
                          countdown > 0 || phone.length !== 11 || !isInviteVerified
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-indigo-600 hover:text-indigo-700'
                        }`}
                      >
                        {countdown > 0 ? `${countdown}秒后重试` : '获取验证码'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 登录按钮 */}
                <button
                  type="submit"
                  disabled={isSubmitting || !isInviteVerified || phone.length !== 11 || verificationCode.length !== 6}
                  id="signin-button"
                  className={`w-full py-3.5 px-4 rounded-xl text-white font-medium transition-all duration-200 text-base ${
                    isSubmitting || !isInviteVerified || phone.length !== 11 || verificationCode.length !== 6
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
