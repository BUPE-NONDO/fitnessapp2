import React from 'react';
import { cn } from '@/styles/design-system';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({
  children,
  size = 'lg',
  className,
  ...props
}) => {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  };

  const baseClasses = cn(
    'mx-auto px-4 sm:px-6 lg:px-8',
    sizeClasses[size],
    className
  );

  return (
    <div className={baseClasses} {...props}>
      {children}
    </div>
  );
};

export default Container;
