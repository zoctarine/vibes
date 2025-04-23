import React from 'react';
import { Input } from '../../atoms/Input/Input';

interface FormFieldProps {
  /** Field label */
  label: string;
  /** Input type */
  type?: string;
  /** Field value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Error message */
  error?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Input placeholder */
  placeholder?: string;
}

/**
 * Form field component combining label and input.
 * 
 * @example
 * ```tsx
 * <FormField
 *   label="Email"
 *   type="email"
 *   value={email}
 *   onChange={setEmail}
 *   required
 * />
 * ```
 */
export const FormField: React.FC<FormFieldProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  placeholder
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={error}
        required={required}
        placeholder={placeholder}
      />
    </div>
  );
};