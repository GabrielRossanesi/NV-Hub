'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, FileText, Briefcase, 
  CreditCard, UserPlus, Megaphone, CheckSquare, 
  History, Settings, X, Power
} from 'lucide-react';
import Button from '../ui/button';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Clientes', href: '/clientes', icon: Users },
    { label: 'Propostas', href: '/propostas', icon: FileText },
    { label: 'Contratos', href: '/contratos', icon: Briefcase },
    { label: 'Cobranças', href: '/cobrancas', icon: CreditCard },
    { label: 'Onboarding', href: '/onboarding', icon: UserPlus },
    { label: 'Publicações', href: '/publicacoes', icon: Megaphone },
    { label: 'Tarefas', href: '/tarefas', icon: CheckSquare },
    { label: 'Histórico', href: '/historico', icon: History },
    { label: 'Configurações', href: '/configuracoes', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity" 
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-45 w-64 border-r border-border bg-card text-foreground flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:h-full ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border/40 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
              <Power className="h-5 w-5 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-tight tracking-tight">Hub Power</span>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">&amp; Ponto</span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full lg:hidden hover:bg-muted"
            onClick={onClose}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-current' : 'text-muted-foreground group-hover:text-foreground'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-border/40 shrink-0">
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-muted/40">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs uppercase">
              AS
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold truncate text-foreground">Ana Silva</span>
              <span className="text-[10px] text-muted-foreground truncate">Operações / Onboarding</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
