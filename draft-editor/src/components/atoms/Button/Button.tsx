import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface ButtonProps {
  /** Click handler for the button */
  onClick: () => void;
  /** Optional icon component from lucide-react */
  icon?: LucideIcon;
  /** Button title/tooltip */
  title?: string;
  /** Additional CSS classes */
  className?: string;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Button contents */
  children?: React.ReactNode;
}

/**
 * Primary button component for user interactions.
 * 
 * @example
 * ```tsx
 * <Button 
 *   onClick={() => console.log('clicked')}
 *   variant="primary"
 *   icon={PlusIcon}
 * >
 *   Add Item
 * </Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  onClick,
  icon: Icon,
  title,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  children
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';
  
  const variantStyles = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  };

  const sizeStyles = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 py-2',
    lg: 'h-12 px-6 text-lg',
  };

  return (
    <button
      ref={ref}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      title={title}
      disabled={disabled}
      type="button"
    >
      {Icon && <Icon className={`${children ? 'mr-2' : ''} h-5 w-5`} />}
      {children}
    </button>
  );
});