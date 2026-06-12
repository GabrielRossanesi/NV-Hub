'use client';

import React, { createContext, useContext, useState } from 'react';

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export function Tabs({ 
  defaultValue, 
  value, 
  onValueChange, 
  className = '', 
  children 
}: { 
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}) {
  const [localValue, setLocalValue] = useState(defaultValue || '');
  
  const activeValue = value !== undefined ? value : localValue;
  const handleValueChange = onValueChange || setLocalValue;

  return (
    <TabsContext.Provider value={{ value: activeValue, onValueChange: handleValueChange }}>
      <div className={`w-full ${className}`}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`flex items-center gap-1 border-b border-border mb-6 overflow-x-auto ${className}`}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, className = '', children }: { value: string; className?: string; children: React.ReactNode }) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');

  const isActive = context.value === value;

  return (
    <button
      onClick={() => context.onValueChange(value)}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap cursor-pointer ${
        isActive 
          ? 'border-primary text-primary' 
          : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className = '', children }: { value: string; className?: string; children: React.ReactNode }) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');

  if (context.value !== value) return null;

  return (
    <div className={`w-full animate-in fade-in duration-200 ${className}`}>
      {children}
    </div>
  );
}

export default Tabs;
