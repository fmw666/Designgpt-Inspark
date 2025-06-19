import { FC, ReactNode } from 'react';

interface AssetsLayoutProps {
  children: ReactNode;
}

const AssetsLayout: FC<AssetsLayoutProps> = ({ children }) => {

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {children}
    </div>
  );
};

export default AssetsLayout; 
