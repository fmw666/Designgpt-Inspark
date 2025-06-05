import { FC, ReactNode } from 'react';
import BaseLayout from './BaseLayout';

interface AssetsLayoutProps {
  children: ReactNode;
}

const AssetsLayout: FC<AssetsLayoutProps> = ({ children }) => {

  return (
    <BaseLayout type="assets">
      {children}
    </BaseLayout>
  );
};

export default AssetsLayout; 
