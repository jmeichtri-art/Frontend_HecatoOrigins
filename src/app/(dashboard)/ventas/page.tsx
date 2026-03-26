'use client';

import Link from 'next/link';
import { Settings, FileText, TrendingUp, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MOCK_QUOTATIONS } from '@/services/cotizacion.service';
import { formatCurrency, formatDate } from '@/lib/utils';
import { STATUS_LABEL_MAP, STATUS_VARIANT_MAP } from '@/components/ui/Badge';

const STATS = [
  { label: 'Cotizaciones Activas', value: '4', icon: <FileText size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Aceptadas este mes', value: '1', icon: <CheckCircle2 size={20} />, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'En espera de respuesta', value: '2', icon: <Clock size={20} />, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Valor pipeline', value: '$215K', icon: <TrendingUp size={20} />, color: 'text-primary', bg: 'bg-primary/10' },
];

export default function VentasPage() {
  const recent = MOCK_QUOTATIONS.slice(0, 4);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ventas</h1>
          <p className="text-muted-foreground mt-1">Gestión de configuraciones y cotizaciones</p>
        </div>
        <Link href="/ventas/configurador">
          <Button>
            <Settings size={16} />
            Nueva configuración
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <Card key={s.label} className="border-border">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">{s.label}</p>
                  <p className="text-3xl font-bold">{s.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center ${s.color}`}>
                  {s.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick access */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/ventas/configurador">
          <Card className="border-border hover:border-primary/50 hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="p-6 flex items-center gap-5">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Settings size={28} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-base">Configurador de Máquinas</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Armá un autoelevador taylor-made paso a paso</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/ventas/cotizacion">
          <Card className="border-border hover:border-primary/50 hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="p-6 flex items-center gap-5">
              <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <FileText size={28} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-base">Cotizaciones</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Administrá y hacé seguimiento de cotizaciones</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent quotations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Cotizaciones recientes</CardTitle>
            <CardDescription>Últimas 4 cotizaciones del sistema</CardDescription>
          </div>
          <Link href="/ventas/cotizacion">
            <Button variant="ghost" size="sm">Ver todas</Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {recent.map((q) => (
              <div key={q.id} className="flex items-center justify-between px-6 py-4 hover:bg-secondary/30 transition-colors">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-sm">{q.number}</span>
                  <span className="text-xs text-muted-foreground">{q.clientCompany} · {q.modelName}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold">{formatCurrency(q.totalPrice)}</span>
                  <Badge variant={STATUS_VARIANT_MAP[q.status]} dot>
                    {STATUS_LABEL_MAP[q.status]}
                  </Badge>
                  <span className="text-xs text-muted-foreground hidden md:block">{formatDate(q.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
