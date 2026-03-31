'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, User, Calendar, Truck, Tag, AlertCircle } from 'lucide-react';
import { MOCK_QUOTATIONS } from '@/services/cotizacion.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, STATUS_VARIANT_MAP, STATUS_LABEL_MAP } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function CotizacionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const quotation = MOCK_QUOTATIONS.find((q) => q.id === id);

  if (!quotation) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 animate-fade-in">
        <AlertCircle size={48} className="text-muted-foreground" />
        <h2 className="text-xl font-semibold">Cotización no encontrada</h2>
        <Link href="/sales/quotation">
          <Button variant="outline">Volver al listado</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Back */}
      <Link href="/sales/quotation">
        <Button variant="ghost" size="sm" className="gap-1.5">
          <ArrowLeft size={15} /> Volver
        </Button>
      </Link>

      {/* Header card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold font-mono">{quotation.number}</h1>
                <Badge variant={STATUS_VARIANT_MAP[quotation.status]} dot>
                  {STATUS_LABEL_MAP[quotation.status]}
                </Badge>
              </div>
              <p className="text-muted-foreground">{quotation.modelName}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-sm mb-1">Valor total</p>
              <p className="text-4xl font-extrabold text-primary">{formatCurrency(quotation.totalPrice)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Client info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User size={16} className="text-primary" /> Datos del cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <InfoRow label="Nombre" value={quotation.clientName} />
            <InfoRow label="Empresa" value={quotation.clientCompany} icon={<Building2 size={14} />} />
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar size={16} className="text-primary" /> Fechas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <InfoRow label="Creación" value={formatDate(quotation.createdAt)} />
            <InfoRow label="Última actualización" value={formatDate(quotation.updatedAt)} />
            <InfoRow label="Validez" value={formatDate(quotation.validUntil)} />
          </CardContent>
        </Card>

        {/* Machine */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Truck size={16} className="text-primary" /> Especificación de la máquina
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                <Truck size={26} className="text-primary" />
              </div>
              <div>
                <p className="font-bold text-lg">{quotation.modelName}</p>
                <p className="text-sm text-muted-foreground">
                  Para ver la configuración detallada, generá la cotización desde el Configurador.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Price breakdown */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Tag size={16} className="text-primary" /> Desglose de precios
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b border-border text-sm">
                <span className="text-muted-foreground">Modelo base</span>
                <span className="font-medium">{formatCurrency(quotation.totalPrice * 0.55)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border text-sm">
                <span className="text-muted-foreground">Componentes configurados</span>
                <span className="font-medium">{formatCurrency(quotation.totalPrice * 0.30)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border text-sm">
                <span className="text-muted-foreground">Accesorios y opcionales</span>
                <span className="font-medium">{formatCurrency(quotation.totalPrice * 0.10)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border text-sm">
                <span className="text-muted-foreground">Flete y puesta en marcha</span>
                <span className="font-medium">{formatCurrency(quotation.totalPrice * 0.05)}</span>
              </div>
              <div className="flex justify-between py-3 font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(quotation.totalPrice)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button variant="secondary">Exportar PDF</Button>
        <Button variant="outline">Duplicar</Button>
        <Button>Enviar cotización</Button>
      </div>
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground flex items-center gap-1.5">{icon}{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
