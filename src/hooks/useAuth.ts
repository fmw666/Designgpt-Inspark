import { useState, useEffect } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  ApplicationVerifier,
} from 'firebase/auth';
import { auth } from '@/services/firebase';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthAvailable: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  sendVerificationCode: (phoneNumber: string) => Promise<string>;
  verifyCode: (verificationId: string, code: string) => Promise<void>;
  initRecaptcha: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthAvailable, setIsAuthAvailable] = useState(true);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      console.log('auth', auth);

      unsubscribe = onAuthStateChanged(auth,
        (user) => {
          console.log('user', user);
          setUser(user);
          setLoading(false);
        },
        (error) => {
          console.warn('Auth state change listener failed:', error);
          setIsAuthAvailable(false);
            setLoading(false);
          },
        () => {
          console.log('Auth state change listener unsubscribed');
        }
      );
    } catch (err) {
      console.warn('Auth state change listener failed:', err);
      setIsAuthAvailable(false);
      setLoading(false);
    }

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
      }
    };
  }, []);

  const getRecaptchaVerifier = () => {
    if (recaptchaVerifier) {
      return recaptchaVerifier;
    }

    if (!document.getElementById('recaptcha-container')) {
      console.log('recaptcha-container not found');
      return null;
    }

    // 初始化 reCAPTCHA
    const verifier = new RecaptchaVerifier(auth, 'send-code-button', {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA 验证成功
        console.log('reCAPTCHA 验证成功');
      },
      'expired-callback': () => {
        // reCAPTCHA 过期
        console.log('reCAPTCHA 验证过期');
        setError('验证已过期，请重新验证');
      }
    });
    verifier.render();

    setRecaptchaVerifier(verifier);
    return verifier;
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setError(null);
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  };

  const sendVerificationCode = async (phoneNumber: string): Promise<string> => {
    try {
      setError(null);
      const recaptchaVerifier = getRecaptchaVerifier();
      if (!recaptchaVerifier) {
        throw new Error('reCAPTCHA not initialized');
      }
      console.log('recaptchaVerifier', recaptchaVerifier);
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      return confirmationResult.verificationId;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  };

  const verifyCode = async (verificationId: string, code: string) => {
    try {
      setError(null);
      const credential = PhoneAuthProvider.credential(verificationId, code);
      await signInWithPhoneNumber(auth, credential as unknown as string, recaptchaVerifier as unknown as ApplicationVerifier);
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  };

  const initRecaptcha = () => {
    if (recaptchaVerifier) {
      return recaptchaVerifier;
    }
    if (!document.getElementById('captcha__container')) {
      console.log('captcha__container not found');
      return null;
    }

    const verifier = new RecaptchaVerifier(auth, 'captcha__container', {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA 验证成功
        console.log('reCAPTCHA 验证成功');
      },
      'expired-callback': () => {
        // reCAPTCHA 过期
        console.log('reCAPTCHA 验证过期');
        setError('验证已过期，请重新验证');
      }
    });
    verifier.render();
    setRecaptchaVerifier(verifier);
    return verifier;
  };

  return {
    user,
    loading,
    error,
    isAuthAvailable,
    signIn,
    signUp,
    logout,
    sendVerificationCode,
    verifyCode,
    initRecaptcha,
  };
};
