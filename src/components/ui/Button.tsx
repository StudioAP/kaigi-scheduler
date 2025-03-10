import React from 'react';
import { cn } from '@/lib/utils';

type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className,
  fullWidth = false,
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    outline: 'border border-gray-300 hover:bg-gray-100 text-gray-800',
    ghost: 'hover:bg-gray-100 text-gray-800',
    link: 'text-blue-600 hover:underline p-0',
  };

  const sizeClasses = {
    sm: 'text-sm px-2 py-1 rounded',
    md: 'px-4 py-2 rounded-md',
    lg: 'text-lg px-6 py-3 rounded-lg',
  };

  return (
    <button
      className={cn(
        'font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        variant !== 'link' ? 'flex items-center justify-center' : '',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
} 