'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';
import Button from './button';

interface DropdownItem {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
  icon?: React.ReactNode;
}

interface DropdownProps {
  items: DropdownItem[];
  trigger?: React.ReactNode;
}

export function Dropdown({ items, trigger }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger || (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg border border-border bg-card shadow-lg ring-1 ring-black/5 focus:outline-none z-40 py-1 animate-in fade-in zoom-in-95 duration-100">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className={`flex w-full items-center px-4 py-2 text-sm transition-colors cursor-pointer hover:bg-muted ${
                item.variant === 'danger' 
                  ? 'text-danger font-medium' 
                  : 'text-foreground'
              }`}
            >
              {item.icon && <span className="mr-2.5 h-4 w-4 flex items-center justify-center">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dropdown;
