import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'muted' | 'success' | 'warning' | 'danger' | 'info';
}

export function Badge({ className = '', variant = 'default', children, ...props }: BadgeProps) {
  const baseStyles = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold select-none border transition-colors';
  
  const variants = {
    default: 'bg-primary/10 text-primary border-primary/20',
    muted: 'bg-muted text-muted-foreground border-border',
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    danger: 'bg-danger/10 text-danger border-danger/20',
    info: 'bg-info/10 text-info border-info/20',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
}

export default Badge;
