'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, FileText, Briefcase, 
  CreditCard, UserPlus, Megaphone, CheckSquare, 
  History, Settings, X, Power, Sparkles, Building2,
  Target
} from 'lucide-react';
import Button from '../ui/button';
import { useTenantStore } from '../../lib/store';
import { PLATFORM_NAME } from '../../lib/config';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { 
    organizations, 
    currentOrganizationId, 
    setCurrentOrganizationId,
    currentUser 
  } = useTenantStore();

  const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Leads', href: '/leads', icon: Target },
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
              <span className="font-bold text-sm leading-tight tracking-tight">{PLATFORM_NAME}</span>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">SaaS Manager</span>
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

        {/* Organization Switcher Dropdown (Simulator) */}
        <div className="px-4 py-3 bg-muted/20 border-b border-border/40 shrink-0">
          <div className="flex items-center gap-1.5 mb-1.5 text-[9px] font-bold text-primary uppercase tracking-wider select-none">
            <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" /> Simulador de Organização
          </div>
          <div className="relative">
            <select
              value={currentOrganizationId || ''}
              onChange={(e) => setCurrentOrganizationId?.(e.target.value)}
              className="w-full h-9 pl-2.5 pr-8 rounded-lg bg-background border border-border text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary cursor-pointer transition-all"
              title="Alternar Organização Assinante"
            >
              {(organizations || []).map((org) => (
                <option key={org?.id || ''} value={org?.id || ''}>
                  {org?.name || 'Organização sem nome'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {(menuItems || []).map((item, idx) => {
            if (!item) return null;
            const Icon = item.icon || Target;
            const itemHref = item.href || '#';
            const isActive = itemHref !== '#' && pathname.startsWith(itemHref);
            return (
              <Link
                key={(item.href || '#') + '-' + idx}
                href={itemHref}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all relative ${
                  isActive
                    ? 'bg-primary/10 text-primary border-l-4 border-primary rounded-l-none pl-2 shadow-sm dark:bg-primary dark:text-primary-foreground dark:border-l-0 dark:rounded-lg dark:pl-3'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-primary dark:text-current' : 'text-muted-foreground group-hover:text-foreground'}`} />
                {item.label || 'Item'}
              </Link>
            );
          })}

          {/* Painel Operador Section */}
          <div className="pt-4 mt-4 border-t border-border/40">
            <div className="px-3 mb-2 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
              Operador GaroFlow
            </div>
            <Link
              href="/empresas"
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all relative ${
                pathname.startsWith('/empresas')
                  ? 'bg-primary/10 text-primary border-l-4 border-primary rounded-l-none pl-2 shadow-sm dark:bg-primary dark:text-primary-foreground dark:border-l-0 dark:rounded-lg dark:pl-3'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building2 className={`h-4.5 w-4.5 shrink-0 ${pathname.startsWith('/empresas') ? 'text-primary dark:text-current' : 'text-muted-foreground'}`} />
                <span>Empresas</span>
              </div>
              <span className="bg-primary/20 text-primary dark:bg-primary-foreground/20 dark:text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                Admin
              </span>
            </Link>
          </div>
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-border/40 shrink-0">
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-muted/40">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs uppercase shrink-0">
              {String(currentUser?.name || 'US').slice(0, 2)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold truncate text-foreground">{currentUser?.name || 'Usuário'}</span>
              <span className="text-[9px] text-muted-foreground truncate leading-normal" title={`${currentUser?.role || 'Membro'} (${String(currentUser?.userRole ?? 'member').toUpperCase()})`}>
                {currentUser?.role || 'Membro'}
                <strong className="text-primary block font-mono text-[8px] uppercase">{String(currentUser?.userRole ?? 'member').toUpperCase()}</strong>
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
