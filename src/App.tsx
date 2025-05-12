import { Routes, Route, Navigate } from 'react-router-dom';
import Chat from '@/pages/Chat';
import NotFound from '@/pages/NotFound';
import TestLayout from '@/components/test/TestLayout';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/chat" replace />} />
      <Route path="/chat/*" element={<Chat />} />
      <Route path="/test" element={<TestLayout />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
