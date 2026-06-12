import React from 'react';

export function Table({ className = '', children, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={`w-full min-w-[600px] border-collapse text-left text-sm ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className = '', children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={`border-b border-border bg-muted/40 ${className}`} {...props}>{children}</thead>;
}

export function TableBody({ className = '', children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={`divide-y divide-border/40 ${className}`} {...props}>{children}</tbody>;
}

export function TableRow({ className = '', children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={`transition-colors hover:bg-muted/30 ${className}`} {...props}>{children}</tr>;
}

export function TableHead({ className = '', children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) {
  return <th className={`px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider ${className}`} {...props}>{children}</th>;
}

export function TableCell({ className = '', children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) {
  return <td className={`px-4 py-3.5 align-middle text-foreground ${className}`} {...props}>{children}</td>;
}

export default Table;
