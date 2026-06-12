import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', type = 'text', error, label, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || `input_${generatedId}`;
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-muted-foreground select-none">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          id={inputId}
          className={`flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all ${
            error ? 'border-danger focus-visible:ring-danger/50 focus-visible:border-danger' : ''
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-danger font-medium leading-none">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
