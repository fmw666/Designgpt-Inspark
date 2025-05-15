import { Routes, Route, Navigate } from 'react-router-dom';
import Chat from '@/pages/Chat';
import NotFound from '@/pages/NotFound';
import TestLayout from '@/components/test/TestLayout';
import { AuthProvider } from '@/components/auth/AuthProvider';

function App() {
  return (
    <AuthProvider>
    <Routes>
        <Route path="/" element={<Navigate to="/chat/new" replace />} />
        <Route path="/chat" element={<Navigate to="/chat/new" replace />} />
        <Route path="/chat/new" element={<Chat />} />
        <Route path="/chat/:chatId" element={<Chat />} />
      <Route path="/test" element={<TestLayout />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    </AuthProvider>
  );
}

export default App;
