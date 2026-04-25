'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Calendar, Truck, AlertCircle, Loader2, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, QUOTATION_STATUS_VARIANT_MAP, QUOTATION_STATUS_LABEL_MAP } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { getQuotationById } from '@/services/quotation.service';
import { QuotationApiItem } from '@/types/quotation';

export default function CotizacionDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [quotation, setQuotation] = useState<QuotationApiItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const numId = Number(id);
    if (isNaN(numId)) { setError('ID de cotización inválido.'); setLoading(false); return; }
    getQuotationById(numId)
      .then(setQuotation)
      .catch((err) => setError(err.message ?? 'No se pudo cargar la cotización.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 animate-fade-in">
        <AlertCircle size={48} className="text-muted-foreground" />
        <h2 className="text-xl font-semibold">{error || 'Cotización no encontrada'}</h2>
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

      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <span className="font-mono text-muted-foreground text-sm">#{quotation.id}</span>
                <Badge variant={QUOTATION_STATUS_VARIANT_MAP[quotation.status]} dot>
                  {QUOTATION_STATUS_LABEL_MAP[quotation.status]}
                </Badge>
                {quotation.sync_status === 'synced' && quotation.docentry && (
                  <span className="text-xs text-muted-foreground">SAP #{quotation.docentry}</span>
                )}
              </div>
              <h1 className="text-2xl font-bold">{quotation.cardname}</h1>
              <p className="text-muted-foreground font-mono text-sm">{quotation.cardcode}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-muted-foreground mb-1">Equipo</p>
              <p className="font-bold text-lg">{quotation.matnrk}</p>
              <p className="text-xs text-muted-foreground">{quotation.machine_description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Client */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User size={16} className="text-primary" /> Socio de Negocio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-0 pt-0">
            <InfoRow label="Nombre" value={quotation.cardname} />
            <InfoRow label="CardCode" value={quotation.cardcode} mono />
            {quotation.customer_reference && (
              <InfoRow label="Referencia" value={quotation.customer_reference} />
            )}
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar size={16} className="text-primary" /> Fechas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-0 pt-0">
            <InfoRow label="Creación" value={formatDate(quotation.created_at)} />
            <InfoRow label="Actualización" value={formatDate(quotation.updated_at)} />
            <InfoRow label="Válida hasta" value={formatDate(quotation.valid_until)} />
          </CardContent>
        </Card>

        {/* Machine + lines */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Truck size={16} className="text-primary" /> Configuración del equipo
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <Truck size={22} className="text-primary" />
              </div>
              <div>
                <p className="font-bold">{quotation.matnrk}</p>
                <p className="text-sm text-muted-foreground">{quotation.machine_description}</p>
              </div>
            </div>

            {quotation.lines && quotation.lines.length > 0 && (
              <div className="space-y-0">
                {quotation.lines.map((line) => (
                  <div
                    key={line.characteristic_id}
                    className="flex items-start justify-between py-2.5 border-b border-border last:border-0 gap-4"
                  >
                    <span className="text-xs text-muted-foreground shrink-0 pt-0.5 w-44">{line.characteristic_name}</span>
                    <div className="flex-1 text-right">
                      <p className="text-sm font-medium">{line.option_description}</p>
                      <p className="text-xs text-muted-foreground/60 font-mono">{line.mrkwrt}</p>
                    </div>
                    {line.unit_price != null && (
                      <p className="text-sm font-semibold shrink-0 text-right">
                        {line.currency_symbol} {line.unit_price.toLocaleString('es-AR')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        {quotation.notes && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText size={16} className="text-primary" /> Notas
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground leading-relaxed">{quotation.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pb-6">
        <Button variant="secondary">Exportar PDF</Button>
        <Button variant="outline">Duplicar</Button>
        <Button>Enviar cotización</Button>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}
