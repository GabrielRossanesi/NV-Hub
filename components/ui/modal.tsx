'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, description, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div 
        className={`relative w-full ${sizeClasses[size]} transform overflow-hidden rounded-xl bg-card border border-border p-6 text-left align-middle shadow-xl transition-all duration-300 ease-out animate-in fade-in zoom-in-95 slide-in-from-bottom-10`}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border/10 pb-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold leading-6 text-foreground">
              {title}
            </h3>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-muted" onClick={onClose}>
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto pr-1 modal-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
