import { Routes, Route, Navigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import Assets from '@/pages/Assets';
import Chat from '@/pages/Chat';
import NotFound from '@/pages/NotFound';
import TestLayout from '@/components/test/TestLayout';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { eventBus } from '@/utils/eventBus';

function App() {
  const { unAuthenticate: onAuthUnAuth } = useAuth();
  const { unAuthenticate: onChatUnAuth } = useChat();

  useEffect(() => {
    const handleUnauthenticated = () => {
      toast.error('登录已过期，请重新登录', { id: 'unauthenticated' });
      onChatUnAuth();
      onAuthUnAuth();
    };

    eventBus.on('unauthenticated', handleUnauthenticated);

    return () => {
      eventBus.off('unauthenticated', handleUnauthenticated);
    };
  }, [onChatUnAuth, onAuthUnAuth]);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster
          position="top-center"
          containerStyle={{
            zIndex: 99999,
          }}
          toastOptions={{
            duration: 3000,
            style: {
              background: 'rgba(255, 255, 255, 0.95)',
              color: '#1F2937',
              boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.1), 0 4px 8px -4px rgba(0, 0, 0, 0.06)',
              borderRadius: '0.75rem',
              padding: '1rem 1.25rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              zIndex: 99999,
            },
            success: {
              iconTheme: {
                primary: '#059669',
                secondary: '#fff',
              },
              style: {
                borderLeft: '4px solid #059669',
              },
            },
            error: {
              iconTheme: {
                primary: '#DC2626',
                secondary: '#fff',
              },
              style: {
                borderLeft: '4px solid #DC2626',
              },
            },
            loading: {
              iconTheme: {
                primary: '#6366F1',
                secondary: '#fff',
              },
              style: {
                borderLeft: '4px solid #6366F1',
              },
            },
            custom: {
              iconTheme: {
                primary: '#6366F1',
                secondary: '#fff',
              },
              style: {
                borderLeft: '4px solid #6366F1',
              },
            },
          }}
        />
        <Routes>
          <Route path="/" element={<Navigate to="/chat/new" replace />} />
          <Route path="/chat" element={<Navigate to="/chat/new" replace />} />
          <Route path="/chat/:chatId" element={<Chat />} />
          <Route path="/test" element={<TestLayout />} />
          <Route
            path="/assets"
            element={
              <ProtectedRoute>
                <Assets />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
