'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Forklift, User, Calendar, FileText, AlertCircle, Loader2, Check, Building2 } from 'lucide-react';
import Link from 'next/link';
import { QuotationDraft } from '@/types/quotation';
import { SapCustomer } from '@/services/sap.service';
import { createQuotation } from '@/services/quotation.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { CustomerCombobox } from '@/components/ui/CustomerCombobox';

const DRAFT_KEY = 'hecato_quotation_draft';

export default function NewQuotationPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<QuotationDraft | null>(null);

  const [customer, setCustomer] = useState<SapCustomer | null>(null);
  const [validUntil, setValidUntil] = useState('');
  const [customerReference, setCustomerReference] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) { router.replace('/sales/configurator'); return; }
    try { setDraft(JSON.parse(raw)); }
    catch { router.replace('/sales/configurator'); }
  }, [router]);

  const canSubmit = !!customer && !!validUntil && !submitting;

  const handleSubmit = async () => {
    if (!draft || !canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      const result = await createQuotation({
        company_id: draft.company_id,
        cardcode: customer!.CardCode,
        cardname: customer!.CardName,
        machine_id: draft.machine_id,
        template_id: draft.template_id ?? null,
        valid_until: validUntil,
        customer_reference: customerReference.trim() || undefined,
        notes: notes.trim() || undefined,
        lines: draft.lines.map((l) => ({
          characteristic_id: l.characteristic_id,
          option_id: l.option_id,
        })),
      });
      sessionStorage.removeItem(DRAFT_KEY);
      router.push(`/sales/quotation/${result.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cotización.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!draft) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <Link href="/sales/configurator">
          <Button variant="ghost" size="sm" className="gap-1.5 mb-2">
            <ArrowLeft size={15} /> Volver al configurador
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Nueva Cotización</h1>
        <p className="text-muted-foreground mt-1">Completá los datos del cliente y revisá la configuración</p>
      </div>

      {/* 2-column grid */}
      <div className="grid lg:grid-cols-2 gap-5 items-start">

        {/* ── Left: form ── */}
        <div className="space-y-4">

          {/* Compañía */}
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Building2 size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Compañía</p>
                <p className="font-semibold text-sm">{draft.company_name}</p>
              </div>
            </CardContent>
          </Card>

          {/* Socio de Negocio */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <User size={16} className="text-primary" /> Socio de Negocio
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="space-y-1.5">
                <Label>Cliente <span className="text-destructive">*</span></Label>
                <CustomerCombobox
                  companyId={draft.company_id}
                  value={customer}
                  onChange={setCustomer}
                />
              </div>
              {customer && (
                <div className="flex items-center justify-between px-3 py-2 rounded-md bg-secondary/60 text-xs text-muted-foreground">
                  <span>CardCode</span>
                  <span className="font-mono font-medium text-foreground">{customer.CardCode}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Condiciones */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar size={16} className="text-primary" /> Condiciones
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="validUntil">
                  Válida hasta <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="customerReference">
                  Referencia del cliente <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
                </Label>
                <Input
                  id="customerReference"
                  placeholder="Ej: OC-4521, pedido interno..."
                  value={customerReference}
                  onChange={(e) => setCustomerReference(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes" className="flex items-center gap-1.5">
                  <FileText size={13} />
                  Notas <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
                </Label>
                <textarea
                  id="notes"
                  rows={3}
                  placeholder="Observaciones, condiciones especiales..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-md border border-input bg-transparent shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Error + Actions */}
          {error && (
            <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-4 py-3 rounded-lg text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Link href="/sales/configurator">
              <Button variant="secondary">Cancelar</Button>
            </Link>
            <Button onClick={handleSubmit} disabled={!canSubmit}>
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Crear Cotización
            </Button>
          </div>
        </div>

        {/* ── Right: configuration summary ── */}
        <Card className="lg:sticky lg:top-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Forklift size={16} className="text-primary" /> Configuración seleccionada
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-0">
            {/* Machine */}
            <div className="flex items-start justify-between py-2.5 border-b border-border gap-4">
              <span className="text-xs text-muted-foreground shrink-0 pt-0.5 w-36">Equipo</span>
              <div className="text-right">
                <p className="text-sm font-semibold">{draft.machine_matnrk}</p>
                <p className="text-xs text-muted-foreground">{draft.machine_description}</p>
              </div>
            </div>

            {/* Lines */}
            {draft.lines.map((line) => (
              <div
                key={line.characteristic_id}
                className="flex items-start justify-between py-2.5 border-b border-border last:border-0 gap-4"
              >
                <span className="text-xs text-muted-foreground shrink-0 pt-0.5 w-36">{line.characteristic_name}</span>
                <div className="text-right">
                  <p className="text-sm font-medium">{line.option_description}</p>
                  <p className="text-xs text-muted-foreground/60 font-mono">{line.mrkwrt}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
