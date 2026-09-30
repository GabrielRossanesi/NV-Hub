'use client';

import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Briefcase,
  Building2,
  CheckSquare,
  CreditCard,
  FileText,
  History,
  Landmark,
  LayoutDashboard,
  Megaphone,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Target,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import IconButton from '../ui/icon-button';
import { useStore, getPlanDefaultFeatures } from '../../lib/store';
import { useMounted } from '../../hooks/useMounted';
import { useDatabaseTenantContext } from '../../hooks/useDatabaseTenantContext';
import { isDatabaseDataMode } from '../../lib/data-mode';
import { LogoSidebar } from '../ui/logo';
import AccountMenu from './account-menu';
import WorkspaceSwitcher from './workspace-switcher';

interface MenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  feature?: string;
  isOperator?: boolean;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

interface NavigationTooltipState {
  label: string;
  top: number;
  left: number;
}

const desktopMediaQuery = '(min-width: 1024px)';
// Sibling route layouts remount the shell; retain only the last route for motion continuity.
let previousNavigationHref = '';

function subscribeToDesktop(callback: () => void) {
  const query = window.matchMedia(desktopMediaQuery);
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}

function getDesktopSnapshot() {
  return window.matchMedia(desktopMediaQuery).matches;
}

function getServerDesktopSnapshot() {
  return false;
}

const menuGroups: { title: string; items: MenuItem[] }[] = [
  {
    title: 'Comercial',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Leads', href: '/leads', icon: Target, feature: 'leads' },
      { label: 'Clientes', href: '/clientes', icon: Users, feature: 'clients' },
      { label: 'Propostas', href: '/propostas', icon: FileText, feature: 'proposals' },
      { label: 'Contratos', href: '/contratos', icon: Briefcase, feature: 'contracts' },
      { label: 'Cobranças', href: '/cobrancas', icon: CreditCard, feature: 'charges' },
    ],
  },
  {
    title: 'Operações',
    items: [
      { label: 'Onboarding', href: '/onboarding', icon: UserPlus, feature: 'onboarding' },
      { label: 'Publicações', href: '/publicacoes', icon: Megaphone, feature: 'publications' },
      { label: 'Tarefas', href: '/tarefas', icon: CheckSquare, feature: 'tasks' },
      { label: 'Histórico', href: '/historico', icon: History, feature: 'history' },
    ],
  },
  {
    title: 'Gestão',
    items: [
      { label: 'Financeiro', href: '/financeiro', icon: Landmark, feature: 'financial' },
      { label: 'Configurações', href: '/configuracoes', icon: Settings },
    ],
  },
  {
    title: 'Administração',
    items: [{ label: 'Empresas', href: '/empresas', icon: Building2, isOperator: true }],
  },
];

export function Sidebar({ isOpen, onClose, triggerRef }: SidebarProps) {
  const pathname = usePathname();
  const storedSidebarCollapsed = useStore(state => state.isSidebarCollapsed);
  const sandboxCurrentOrganizationId = useStore(state => state.currentOrganizationId);
  const sandboxOrganizations = useStore(state => state.organizations);
  const sandboxFeatureList = useStore(state => state.organizationFeatures);
  const sandboxCurrentUser = useStore(state => state.currentUser);
  const sandboxTeamMembers = useStore(state => state.teamMembers);
  const setCurrentOrganizationId = useStore(state => state.setCurrentOrganizationId);
  const toggleSidebar = useStore(state => state.toggleSidebar);
  const hasMounted = useMounted();
  const { context: databaseTenantContext } = useDatabaseTenantContext();
  const isDesktop = useSyncExternalStore(subscribeToDesktop, getDesktopSnapshot, getServerDesktopSnapshot);
  const showCompact = isDesktop && storedSidebarCollapsed;
  const panelRef = useRef<HTMLElement>(null);
  const mobileCloseRef = useRef<HTMLButtonElement>(null);
  const navigationRef = useRef<HTMLElement>(null);
  const navigationContentRef = useRef<HTMLDivElement>(null);
  const activeIndicatorRef = useRef<HTMLSpanElement>(null);
  const [navigationTooltip, setNavigationTooltip] = useState<NavigationTooltipState | null>(null);

  const sandboxOrganization = sandboxOrganizations.find(org => org.id === sandboxCurrentOrganizationId);
  const sandboxFeatures = sandboxFeatureList.find(features => features.organizationId === sandboxCurrentOrganizationId) ?? {
    organizationId: sandboxCurrentOrganizationId,
    ...getPlanDefaultFeatures(sandboxOrganization?.planId ?? 'starter'),
  };
  const currentOrganizationId = isDatabaseDataMode
    ? databaseTenantContext?.organization.id || ''
    : (hasMounted ? sandboxCurrentOrganizationId : 'org_hub_power');
  const currentFeatures = isDatabaseDataMode
    ? databaseTenantContext?.features || getPlanDefaultFeatures('pro')
    : (hasMounted ? sandboxFeatures : getPlanDefaultFeatures('pro'));
  const sandboxUser = hasMounted
    ? sandboxCurrentUser
    : sandboxTeamMembers.find(member => member.organizationId === 'org_hub_power') || sandboxTeamMembers[0];
  const organizations = isDatabaseDataMode
    ? (databaseTenantContext ? [databaseTenantContext.organization] : [])
    : sandboxOrganizations;
  const currentOrganization = organizations.find(org => org.id === currentOrganizationId) || organizations[0];
  const displayUserName = isDatabaseDataMode
    ? databaseTenantContext?.userName || 'Usuário'
    : sandboxUser?.name || 'Usuário';
  const displayUserRole = isDatabaseDataMode
    ? databaseTenantContext?.membershipRole || 'Membro'
    : sandboxUser?.role || 'Membro';
  const displayUserPermission = isDatabaseDataMode
    ? databaseTenantContext?.membershipRole
    : sandboxUser?.userRole;
  const displayUserInitials = displayUserName
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'US';

  const closeMobileNavigation = useCallback(() => {
    setNavigationTooltip(null);
    if (isDesktop) return;
    onClose();
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, [isDesktop, onClose, triggerRef]);

  const toggleSidebarPreference = () => {
    const nextCollapsedState = !useStore.getState().isSidebarCollapsed;
    document.documentElement.dataset.sidebarCollapsed = String(nextCollapsedState);
    setNavigationTooltip(null);
    toggleSidebar();
  };

  useEffect(() => {
    if (!isOpen || isDesktop) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => mobileCloseRef.current?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMobileNavigation();
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusableElements = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter(element => element.getClientRects().length > 0);
      if (focusableElements.length === 0) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeMobileNavigation, isDesktop, isOpen]);

  const filterMenuItems = (items: MenuItem[]) => items.filter(item => {
    if (item.feature) {
      const key = item.feature as keyof Omit<typeof currentFeatures, 'organizationId'>;
      if (currentFeatures[key] === false) return false;
    }

    if (item.isOperator && isDatabaseDataMode) {
      return databaseTenantContext?.platformRole === 'operator' || databaseTenantContext?.platformRole === 'platform_admin';
    }

    return true;
  });

  const visibleGroups = menuGroups
    .map(group => ({ ...group, items: filterMenuItems(group.items) }))
    .filter(group => group.items.length > 0);
  const navigationKey = visibleGroups.flatMap(group => group.items.map(item => item.href)).join('|');

  useEffect(() => {
    const nav = navigationRef.current;
    const content = navigationContentRef.current;
    const indicator = activeIndicatorRef.current;
    if (!nav || !content || !indicator) return;
    const active = content.querySelector<HTMLElement>('[aria-current="page"]');
    if (!active) {
      delete content.dataset.indicatorReady;
      return;
    }
    const previous = Array.from(content.querySelectorAll<HTMLAnchorElement>('a[href]'))
      .find(link => link.getAttribute('href') === previousNavigationHref);
    const activeHref = active.getAttribute('href') || '';
    const shouldAnimateEntry = previous && previousNavigationHref !== activeHref
      && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rememberFrame = requestAnimationFrame(() => { previousNavigationHref = activeHref; });

    const updateIndicator = () => {
      const itemBounds = active.getBoundingClientRect();
      const contentBounds = content.getBoundingClientRect();
      indicator.style.transform = `translateY(${itemBounds.top - contentBounds.top}px)`;
      indicator.style.height = `${itemBounds.height}px`;
    };
    updateIndicator();
    content.dataset.indicatorReady = 'true';
    const entryAnimation = shouldAnimateEntry ? indicator.animate([
      { transform: `translateY(${previous.getBoundingClientRect().top - content.getBoundingClientRect().top}px)` },
      { transform: indicator.style.transform },
    ], { duration: 240, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }) : null;
    const observer = new ResizeObserver(updateIndicator);
    observer.observe(content);
    observer.observe(active);

    // Scroll the navigation alone, keeping the workspace and mobile drawer still.
    const navBounds = nav.getBoundingClientRect();
    const activeBounds = active.getBoundingClientRect();
    if (activeBounds.top < navBounds.top + 16) nav.scrollTop -= navBounds.top + 16 - activeBounds.top;
    else if (activeBounds.bottom > navBounds.bottom - 16) nav.scrollTop += activeBounds.bottom - navBounds.bottom + 16;

    return () => {
      cancelAnimationFrame(rememberFrame);
      entryAnimation?.cancel();
      observer.disconnect();
    };
  }, [pathname, showCompact, navigationKey]);

  const showTooltip = (element: HTMLElement, label: string) => {
    if (!showCompact) return;
    const rect = element.getBoundingClientRect();
    setNavigationTooltip({ label, top: rect.top + rect.height / 2, left: rect.right + 12 });
  };

  return (
    <>
      {isOpen && !isDesktop && (
        <div
          className="fixed inset-0 z-40 bg-black/55"
          aria-hidden="true"
          onMouseDown={closeMobileNavigation}
        />
      )}

      <aside
        id="nvhub-sidebar"
        ref={panelRef}
        aria-label="Navegação principal"
        aria-hidden={!isDesktop && !isOpen}
        inert={!isDesktop && !isOpen}
        className={`nv-glass-sidebar fixed inset-y-0 left-0 z-50 flex w-64 flex-col shadow-elevated lg:relative lg:translate-x-0 lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${showCompact ? 'lg:w-18' : 'lg:w-64'}`}
      >
        <span className={`nv-brand-signal absolute left-0 top-0 h-0.5 ${showCompact ? 'w-18' : 'w-24'}`} aria-hidden="true" />

        <div
          id="nvhub-sidebar-header"
          className="nv-sidebar-header relative flex h-[4.25rem] shrink-0 items-center justify-between gap-2 px-3"
        >
          <Link
            id="nvhub-sidebar-brand-link"
            href="/dashboard"
            onClick={closeMobileNavigation}
            aria-label="Ir para o Dashboard"
            className="min-w-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <LogoSidebar />
          </Link>
          <IconButton
            id="nvhub-sidebar-toggle"
            variant="ghost"
            size="sm"
            className="nv-sidebar-toggle hidden text-foreground-muted hover:bg-surface-subtle hover:text-primary lg:inline-flex"
            label={storedSidebarCollapsed ? 'Expandir navegação' : 'Recolher navegação'}
            aria-controls="nvhub-sidebar-navigation"
            aria-expanded={!storedSidebarCollapsed}
            onClick={toggleSidebarPreference}
          >
            {storedSidebarCollapsed
              ? <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
              : <PanelLeftClose className="h-4 w-4" aria-hidden="true" />}
          </IconButton>
          {!isDesktop && (
            <IconButton
              ref={mobileCloseRef}
              variant="ghost"
              size="sm"
              className="rounded-md text-foreground-muted lg:hidden"
              label="Fechar menu principal"
              onClick={closeMobileNavigation}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </IconButton>
          )}
        </div>

        <div id="nvhub-sidebar-workspace" className={`shrink-0 ${showCompact ? 'p-3' : 'px-3 py-4'}`}>
          <WorkspaceSwitcher
            organizations={organizations}
            currentOrganization={currentOrganization}
            isCollapsed={showCompact}
            canSwitch={!isDatabaseDataMode && organizations.length > 1}
            onChange={setCurrentOrganizationId}
          />
        </div>

        <nav ref={navigationRef} id="nvhub-sidebar-navigation" aria-label="Módulos" className="nv-sidebar-navigation min-h-0 flex-1 overflow-y-auto" onScroll={() => setNavigationTooltip(null)} onKeyDown={event => { if (event.key === 'Escape') setNavigationTooltip(null); }}>
          <div ref={navigationContentRef} className="nv-sidebar-navigation-content">
            <span ref={activeIndicatorRef} className="nv-sidebar-active-indicator" aria-hidden="true" />
            {visibleGroups.map(group => {
              return (
                <div key={group.title} className="nv-sidebar-navigation-group">
                  <p className="nv-sidebar-group-label" aria-hidden={showCompact}>
                    <span>{group.title}</span>
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map(item => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`) || false;

                      return (
                        <div key={item.href} className="group relative">
                          <Link
                            href={item.href}
                            onClick={closeMobileNavigation}
                            onMouseEnter={event => showTooltip(event.currentTarget, item.label)}
                            onMouseLeave={() => setNavigationTooltip(null)}
                            onFocus={event => showTooltip(event.currentTarget, item.label)}
                            onBlur={() => setNavigationTooltip(null)}
                            aria-label={item.label}
                            aria-current={isActive ? 'page' : undefined}
                            aria-describedby={showCompact && navigationTooltip?.label === item.label ? 'sidebar-navigation-tooltip' : undefined}
                            className="nv-sidebar-item relative flex h-11 items-center gap-3 text-body-small font-medium"
                          >
                            <span className="nv-sidebar-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
                              <Icon className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <span className="nv-sidebar-label min-w-0 flex-1 truncate" aria-hidden={showCompact}>{item.label}</span>
                            {item.isOperator && (
                              <span className="nv-sidebar-expanded-only rounded-sm bg-primary-subtle px-1.5 py-0.5 text-[0.5625rem] font-bold uppercase tracking-wide text-primary">Admin</span>
                            )}
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </nav>

        <div id="nvhub-sidebar-account" className="shrink-0 border-t border-border/60 p-3">
          <AccountMenu
            name={displayUserName}
            role={displayUserRole}
            initials={displayUserInitials}
            isAdmin={displayUserPermission === 'admin'}
            isCollapsed={showCompact}
            onNavigate={closeMobileNavigation}
          />
        </div>
      </aside>

      {showCompact && navigationTooltip && hasMounted && createPortal(
        <div
          id="sidebar-navigation-tooltip"
          role="tooltip"
          className="pointer-events-none fixed z-[70] -translate-y-1/2 rounded-md border border-border-strong/70 bg-surface-elevated px-2.5 py-1.5 text-label font-medium text-foreground shadow-elevated"
          style={{ top: navigationTooltip.top, left: navigationTooltip.left }}
        >
          {navigationTooltip.label}
        </div>,
        document.body,
      )}
    </>
  );
}

export default Sidebar;
