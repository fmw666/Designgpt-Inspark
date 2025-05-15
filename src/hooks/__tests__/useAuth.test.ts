import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { auth } from '@/services/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import '@testing-library/jest-dom';
import { expect, jest, describe, it, beforeEach } from '@jest/globals';

// 添加 Jest 类型声明
declare global {
  namespace jest {
    interface Mock<T = any> {
      mockResolvedValueOnce(value: T): this;
      mockRejectedValueOnce(value: any): this;
    }
  }
}

// Mock Firebase auth
jest.mock('@/services/firebase', () => ({
  auth: {
    currentUser: null,
  },
}));

// Mock Firebase auth methods
jest.mock('firebase/auth', () => ({
  RecaptchaVerifier: jest.fn().mockImplementation(() => ({
    render: jest.fn(),
    clear: jest.fn(),
  })),
  signInWithPhoneNumber: jest.fn(),
  onAuthStateChanged: jest.fn(),
  signOut: jest.fn(),
}));

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendVerificationCode', () => {
    it('should send verification code successfully', async () => {
      // Mock successful verification code sending
      const mockVerificationId = 'mock-verification-id';
      const mockSignInWithPhoneNumber = signInWithPhoneNumber as jest.Mock;
      const mockConfirmationResult: Partial<ConfirmationResult> = {
        verificationId: mockVerificationId,
      };
      mockSignInWithPhoneNumber.mockResolvedValueOnce(mockConfirmationResult as never);

      const { result } = renderHook(() => useAuth());

      // Wait for the hook to initialize
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Test sending verification code
      await act(async () => {
        const verificationId = await result.current.sendVerificationCode('+8618066668888');
        expect(verificationId).toBe(mockVerificationId);
      });

      // Verify Firebase methods were called correctly
      expect(RecaptchaVerifier).toHaveBeenCalled();
      expect(signInWithPhoneNumber).toHaveBeenCalledWith(
        auth,
        '+8618066668888',
        expect.any(Object)
      );
    });

    it('should handle errors when sending verification code', async () => {
      // Mock failed verification code sending
      const mockError = new Error('Failed to send verification code');
      const mockSignInWithPhoneNumber = signInWithPhoneNumber as jest.Mock;
      mockSignInWithPhoneNumber.mockRejectedValueOnce(mockError as never);

      const { result } = renderHook(() => useAuth());

      // Wait for the hook to initialize
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      console.log('result', result.current);

      // Test error handling
      await act(async () => {
        await expect(result.current.sendVerificationCode('+8618066668888'))
          .rejects
          .toThrow('Failed to send verification code');
      });

      // Verify error state
      expect(result.current.error).toBe('Failed to send verification code');
    });

    it('should throw error if reCAPTCHA is not initialized', async () => {
      // Mock RecaptchaVerifier to return null
      const mockRecaptchaVerifier = RecaptchaVerifier as jest.Mock;
      mockRecaptchaVerifier.mockImplementationOnce(() => null);

      // Mock signInWithPhoneNumber to throw error when reCAPTCHA is not initialized
      const mockSignInWithPhoneNumber = signInWithPhoneNumber as jest.Mock;
      mockSignInWithPhoneNumber.mockRejectedValueOnce(new Error('reCAPTCHA not initialized') as never);

      const { result } = renderHook(() => useAuth());

      // Wait for the hook to initialize
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Test error handling for uninitialized reCAPTCHA
      await act(async () => {
        await expect(result.current.sendVerificationCode('+8618066668888'))
          .rejects
          .toThrow('reCAPTCHA not initialized');
      });
    });
  });
});
