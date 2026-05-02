'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCompanies } from '@/services/company.service';
import { Company } from '@/types/company';

interface CompanyContextType {
  companies: Company[];
  isLoading: boolean;
  error: string;
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company | null) => void;
  refreshCompanies: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    getCompanies()
      .then((data) => setCompanies(data.filter((c) => c.active)))
      .catch(() => setError('No se pudieron cargar las compañías.'))
      .finally(() => setIsLoading(false));
  }, []);

  async function refreshCompanies() {
    try {
      const data = await getCompanies();
      setCompanies(data.filter((c) => c.active));
    } catch { /* silent — selector keeps showing current list */ }
  }

  return (
    <CompanyContext.Provider value={{ companies, isLoading, error, selectedCompany, setSelectedCompany, refreshCompanies }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error('useCompany must be used within CompanyProvider');
  return ctx;
}
