import React from 'react';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  variant?: 'default' | 'operational';
  containerClassName?: string;
}

function headerText(node: React.ReactNode): string {
  return React.Children.toArray(node).map(child => {
    if (typeof child === 'string' || typeof child === 'number') return String(child);
    if (React.isValidElement<{ children?: React.ReactNode }>(child)) return headerText(child.props.children);
    return '';
  }).join('');
}

// Render labels on the server; mobile rows keep every value and action visible.
function labelMobileCells(children: React.ReactNode) {
  const sections = React.Children.toArray(children);
  const header = sections.find(child => React.isValidElement(child) && child.type === TableHeader);
  if (!React.isValidElement<{ children?: React.ReactNode }>(header)) return children;
  const row = React.Children.toArray(header.props.children).find(child => React.isValidElement(child) && child.type === TableRow);
  if (!React.isValidElement<{ children?: React.ReactNode }>(row)) return children;
  const labels = React.Children.toArray(row.props.children).map(child => headerText(child));

  return sections.map(section => {
    if (!React.isValidElement<{ children?: React.ReactNode }>(section) || section.type !== TableBody) return section;
    return React.cloneElement(section, {}, React.Children.map(section.props.children, bodyRow => {
      if (!React.isValidElement<{ children?: React.ReactNode }>(bodyRow) || bodyRow.type !== TableRow) return bodyRow;
      return React.cloneElement(bodyRow, {}, React.Children.map(bodyRow.props.children, (cell, index) => {
        if (!React.isValidElement<React.HTMLAttributes<HTMLTableCellElement> & { 'data-label'?: string }>(cell) || cell.type !== TableCell) return cell;
        return React.cloneElement(cell, { 'data-label': labels[index] });
      }));
    }));
  });
}

export function Table({
  className = '',
  containerClassName = '',
  variant = 'default',
  children,
  ...props
}: TableProps) {
  const isOperational = variant === 'operational';

  return (
    <div className={`nv-table-container w-full overflow-x-auto ${isOperational
      ? 'rounded-lg border border-border bg-surface shadow-subtle'
      : 'rounded-xl border border-border/20 bg-card/30 shadow-sm backdrop-blur-sm'} ${containerClassName}`}>
      <table className={`nv-table-mobile w-full border-collapse text-left text-sm ${isOperational ? 'min-w-[680px]' : 'min-w-[600px]'} ${className}`} {...props}>
        {labelMobileCells(children)}
      </table>
    </div>
  );
}

export function TableHeader({ className = '', children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={`border-b border-border/25 bg-muted/15 ${className}`} {...props}>{children}</thead>;
}

export function TableBody({ className = '', children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={`divide-y divide-border/20 ${className}`} {...props}>{children}</tbody>;
}

export function TableRow({ className = '', children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={`transition-all duration-150 hover:bg-muted/15 ${className}`} {...props}>{children}</tr>;
}

export function TableHead({ className = '', children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) {
  return <th className={`px-4 py-3 text-[10px] font-extrabold text-muted-foreground/75 uppercase tracking-[0.14em] select-none ${className}`} {...props}>{children}</th>;
}

export function TableCell({ className = '', children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) {
  return <td className={`px-4 py-3 text-xs md:text-sm font-medium text-foreground/90 align-middle ${className}`} {...props}>{children}</td>;
}

export default Table;
