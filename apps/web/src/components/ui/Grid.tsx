import React from 'react';
import { cn } from '@/styles/design-system';

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

const Grid: React.FC<GridProps> = ({
  children,
  cols = 1,
  gap = 'md',
  className,
  ...props
}) => {
  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
    12: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6',
  };

  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12',
  };

  const baseClasses = cn(
    'grid',
    colsClasses[cols],
    gapClasses[gap],
    className
  );

  return (
    <div className={baseClasses} {...props}>
      {children}
    </div>
  );
};

export default Grid;
