'use client';

import { AlertCircle, Loader2 } from 'lucide-react';
import { useCompany } from '@/lib/company/CompanyContext';

interface CompanySelectorProps {
  label?: string;
  description?: string;
  className?: string;
}

export function CompanySelector({ label = 'Compañía', description, className }: CompanySelectorProps) {
  const { companies, isLoading, error, selectedCompany, setSelectedCompany } = useCompany();

  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {description && <p className="text-xs text-muted-foreground mb-2">{description}</p>}

      {error && (
        <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-3 py-2 rounded-lg text-xs mb-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div className="relative">
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Loader2 size={14} className="animate-spin text-muted-foreground" />
          </div>
        )}
        <select
          title= "companies"
          value={selectedCompany?.id ?? ''}
          onChange={(e) => {
            const found = companies.find((c) => c.id === Number(e.target.value));
            setSelectedCompany(found ?? null);
          }}
          disabled={isLoading || !!error}
          className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">— Seleccioná una compañía —</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
