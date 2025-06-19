import { FC } from 'react';
import AssetsLayout from '@/components/layout/AssetsLayout';
import AssetsInterface from '@/components/assets/AssetsInterface';
import BaseSidebar from '@/components/layout/BaseSidebar';

const Assets: FC = () => {

  return (
    <AssetsLayout>
      {/* 侧边栏 */}
      <BaseSidebar type="assets" />

      {/* 主聊天区域 */}
      <main className="flex flex-col w-full h-full">
        <AssetsInterface />
      </main>
    </AssetsLayout>
  );
};

export default Assets;
