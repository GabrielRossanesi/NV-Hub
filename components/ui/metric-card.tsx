import React from 'react';
import Card from './card';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  trend?: {
    value: string;
    type: 'positive' | 'negative' | 'neutral';
  };
}

export function MetricCard({ title, value, icon, description, trend }: MetricCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        {icon && <div className="text-muted-foreground/80 h-5 w-5 flex items-center justify-center">{icon}</div>}
      </div>
      
      <div className="mt-2.5 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {value}
        </span>
        {trend && (
          <span className={`inline-flex items-center text-xs font-medium rounded-full px-2 py-0.5 ${
            trend.type === 'positive' 
              ? 'bg-success/10 text-success' 
              : trend.type === 'negative' 
                ? 'bg-danger/10 text-danger' 
                : 'bg-muted text-muted-foreground'
          }`}>
            {trend.value}
          </span>
        )}
      </div>

      {(description || trend) && (
        <p className="mt-2 text-xs text-muted-foreground">
          {description}
        </p>
      )}
    </Card>
  );
}

export default MetricCard;
