'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './theme-provider';
import Button from './button';
import { useMounted } from '../../hooks/useMounted';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg border border-border/40">
        <span className="sr-only">Carregando tema</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-9 w-9 p-0 rounded-lg border border-border/40 hover:bg-muted"
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
    >
      {theme === 'dark' ? (
        <Sun className="h-[1.2rem] w-[1.2rem] text-amber-400 rotate-0 scale-100 transition-all" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] text-indigo-600 rotate-0 scale-100 transition-all" />
      )}
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}

export default ThemeToggle;
