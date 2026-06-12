import React from 'react';

export interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className = '', error, label, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || `date_${generatedId}`;
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-muted-foreground select-none">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type="date"
          id={inputId}
          className={`flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all ${
            error ? 'border-danger focus-visible:ring-danger/50 focus-visible:border-danger' : ''
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-danger font-medium leading-none">{error}</span>}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';
export default DatePicker;
