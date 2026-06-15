import React from 'react';

interface SparklineProps {
  points: number[];
  variant?: 'success' | 'danger' | 'neutral' | 'info' | 'primary';
  className?: string;
}

export function Sparkline({ points, variant = 'primary', className = '' }: SparklineProps) {
  if (!points || points.length === 0) return null;
  
  const width = 100;
  const height = 32;
  
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min === 0 ? 1 : max - min;
  
  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((p - min) / range) * height;
    // Add small padding to prevent clipping at the top/bottom
    const paddedY = Math.max(2, Math.min(height - 2, y));
    return `${x},${paddedY}`;
  });
  
  const colorMap = {
    success: 'text-success stroke-success',
    danger: 'text-danger stroke-danger',
    neutral: 'text-muted-foreground stroke-muted-foreground',
    info: 'text-info stroke-info',
    primary: 'text-primary stroke-primary'
  };

  return (
    <svg 
      className={`w-24 h-8 overflow-visible ${colorMap[variant]} ${className}`} 
      viewBox={`0 0 ${width} ${height}`}
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={coords.join(' ')}
      />
    </svg>
  );
}

export default Sparkline;
