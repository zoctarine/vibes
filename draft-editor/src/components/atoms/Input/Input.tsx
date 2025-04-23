import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Additional CSS classes */
  className?: string;
  /** Error message to display */
  error?: string;
}

/**
 * Input component for text entry.
 * 
 * @example
 * ```tsx
 * <Input 
 *   type="email"
 *   placeholder="Enter your email"
 *   onChange={(e) => setEmail(e.target.value)}
 *   error="Please enter a valid email"
 * />
 * ```
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  className = '',
  error,
  ...props
}, ref) => {
  return (
    <div className="relative">
      <input
        ref={ref}
        className={`
          flex h-10 w-full rounded-md border border-input bg-background px-3 py-2
          text-sm ring-offset-background file:border-0 file:bg-transparent
          file:text-sm file:font-medium placeholder:text-muted-foreground
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
          disabled:cursor-not-allowed disabled:opacity-50
          ${error ? 'border-destructive' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
});