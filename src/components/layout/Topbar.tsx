'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/Button';

// Build breadcrumb from pathname
function buildBreadcrumb(pathname: string): { label: string; href: string }[] {
  const LABELS: Record<string, string> = {
    dashboard: 'Dashboard',
    ventas: 'Ventas',
    configurador: 'Configurador',
    cotizacion: 'Cotizaciones',
  };
  const parts = pathname.split('/').filter(Boolean);
  return parts
    .map((part, i) => ({
      label: LABELS[part] ?? part.charAt(0).toUpperCase() + part.slice(1),
      href: '/' + parts.slice(0, i + 1).join('/'),
    }));
}

export function Topbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const crumbs = buildBreadcrumb(pathname);

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 gap-4 sticky top-0 z-40">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
        {crumbs.map((crumb, i) => (
          <React.Fragment key={crumb.href}>
            {i > 0 && <span className="text-muted-foreground">/</span>}
            <span
              className={
                i === crumbs.length - 1
                  ? 'font-semibold text-foreground'
                  : 'text-muted-foreground hover:text-foreground transition-colors'
              }
            >
              {crumb.label}
            </span>
          </React.Fragment>
        ))}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Search size={18} />
        </Button>

        <div className="relative">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Bell size={18} />
          </Button>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </div>

        {user && (
          <div className="flex items-center gap-2 pl-3 border-l border-border">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="hidden md:flex flex-col leading-tight">
              <span className="text-sm font-semibold text-foreground">{user.name}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
