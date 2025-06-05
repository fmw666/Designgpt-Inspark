import { FC } from 'react';
import AssetsLayout from '@/components/layout/AssetsLayout';
import AssetsInterface from '@/components/assets/AssetsInterface';

const Assets: FC = () => {

  return (
    <AssetsLayout>
      <AssetsInterface />
    </AssetsLayout>
  );
};

export default Assets;
