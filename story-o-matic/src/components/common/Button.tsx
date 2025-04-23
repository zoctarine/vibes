import React from 'react';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  title?: string;
}

export function Button({ onClick, children, className, disabled, title }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`px-4 py-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:bg-gray-200 dark:hover:bg-gray-700'
      } ${className}`}
    >
      {children}
    </button>
  );
}