import React from 'react';

interface ChartContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`w-full h-full min-h-[300px] ${className}`}>
      {children}
    </div>
  );
};

export default ChartContainer;
