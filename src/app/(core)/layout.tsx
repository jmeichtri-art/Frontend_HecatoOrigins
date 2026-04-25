'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { CompanyProvider } from '@/lib/company/CompanyContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <CompanyProvider>
      <AppLayout>{children}</AppLayout>
    </CompanyProvider>
  );
}
