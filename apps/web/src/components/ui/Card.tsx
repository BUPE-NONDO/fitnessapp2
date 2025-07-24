import React from 'react';
import { cn, getVariant } from '@/styles/design-system';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hover' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className,
  ...props
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const baseClasses = cn(
    'bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700',
    paddingClasses[padding]
  );

  const variantClasses = {
    default: '',
    hover: 'hover:shadow-lg transition-shadow duration-200',
    interactive: 'cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200',
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardHeader: React.FC<CardHeaderProps> = ({ children, className, ...props }) => {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  );
};

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const CardTitle: React.FC<CardTitleProps> = ({ 
  children, 
  as: Component = 'h3', 
  className, 
  ...props 
}) => {
  return (
    <Component 
      className={cn('text-xl font-semibold text-gray-900 dark:text-white', className)} 
      {...props}
    >
      {children}
    </Component>
  );
};

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardContent: React.FC<CardContentProps> = ({ children, className, ...props }) => {
  return (
    <div className={cn('text-gray-700 dark:text-gray-300', className)} {...props}>
      {children}
    </div>
  );
};

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardFooter: React.FC<CardFooterProps> = ({ children, className, ...props }) => {
  return (
    <div className={cn('mt-4 pt-4 border-t border-gray-200 dark:border-gray-700', className)} {...props}>
      {children}
    </div>
  );
};

// Compound component pattern
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
