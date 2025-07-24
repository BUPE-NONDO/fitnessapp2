import React from 'react';
import { cn, getVariant } from '@/styles/design-system';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'error' | 'success';
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  success,
  helperText,
  leftIcon,
  rightIcon,
  variant = 'default',
  className,
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const getInputVariant = () => {
    if (error) return 'error';
    if (success) return 'success';
    return 'base';
  };

  const inputClasses = cn(
    'w-full px-3 py-2 border rounded-lg transition-colors duration-200',
    'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
    'placeholder-gray-500 dark:placeholder-gray-400',
    'focus:outline-none focus:ring-2 focus:border-transparent',
    leftIcon && 'pl-10',
    rightIcon && 'pr-10',
    error && 'border-red-500 focus:ring-red-500',
    success && 'border-green-500 focus:ring-green-500',
    !error && !success && 'border-gray-300 dark:border-gray-600 focus:ring-blue-500',
    className
  );

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 dark:text-gray-400">{leftIcon}</span>
          </div>
        )}
        
        <input
          id={inputId}
          className={inputClasses}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 dark:text-gray-400">{rightIcon}</span>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      
      {success && (
        <p className="mt-1 text-sm text-green-600 dark:text-green-400">
          {success}
        </p>
      )}
      
      {helperText && !error && !success && (
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
