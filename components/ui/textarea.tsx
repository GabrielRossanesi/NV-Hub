import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', error, label, id, rows = 3, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id || `textarea_${generatedId}`;
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-xs font-medium text-muted-foreground select-none">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={`flex w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all ${
            error ? 'border-danger focus-visible:ring-danger/50 focus-visible:border-danger' : ''
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-danger font-medium leading-none">{error}</span>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export default Textarea;
