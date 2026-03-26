'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { MOCK_QUOTATIONS } from '@/services/cotizacion.service';
import { Quotation } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge, STATUS_VARIANT_MAP, STATUS_LABEL_MAP } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';

const STATUS_OPTIONS = ['Todas', 'borrador', 'enviada', 'aceptada', 'rechazada', 'vencida'];

export default function CotizacionPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todas');

  const filtered = MOCK_QUOTATIONS.filter((q) => {
    const matchSearch =
      q.number.toLowerCase().includes(search.toLowerCase()) ||
      q.clientName.toLowerCase().includes(search.toLowerCase()) ||
      q.clientCompany.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Todas' || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cotizaciones</h1>
          <p className="text-muted-foreground mt-1">{MOCK_QUOTATIONS.length} cotizaciones en total</p>
        </div>
        <Link href="/ventas/configurador">
          <Button>
            <Plus size={16} />
            Nueva cotización
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              className="pl-9"
              placeholder="Buscar por número, cliente, empresa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-primary text-white border-primary'
                    : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                }`}
              >
                {s === 'Todas' ? 'Todas' : STATUS_LABEL_MAP[s]}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de cotizaciones</CardTitle>
          <CardDescription>{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left px-6 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">N°</th>
                  <th className="text-left px-6 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Cliente</th>
                  <th className="text-left px-6 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden md:table-cell">Modelo</th>
                  <th className="text-left px-6 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Estado</th>
                  <th className="text-right px-6 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Valor</th>
                  <th className="text-left px-6 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden lg:table-cell">Válida hasta</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground">
                      No se encontraron cotizaciones
                    </td>
                  </tr>
                ) : (
                  filtered.map((q) => (
                    <tr key={q.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-semibold text-xs">{q.number}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{q.clientName}</p>
                          <p className="text-xs text-muted-foreground">{q.clientCompany}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">{q.modelName}</td>
                      <td className="px-6 py-4">
                        <Badge variant={STATUS_VARIANT_MAP[q.status]} dot>
                          {STATUS_LABEL_MAP[q.status]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right font-bold">{formatCurrency(q.totalPrice)}</td>
                      <td className="px-6 py-4 text-muted-foreground hidden lg:table-cell">{formatDate(q.validUntil)}</td>
                      <td className="px-6 py-4">
                        <Link href={`/ventas/cotizacion/${q.id}`}>
                          <Button variant="ghost" size="sm">Ver</Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
