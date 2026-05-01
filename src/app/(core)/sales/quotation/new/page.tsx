'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Forklift, User, Calendar, FileText, AlertCircle, Loader2, Check, Building2, Tag, Banknote } from 'lucide-react';
import Link from 'next/link';
import { QuotationDraft } from '@/types/quotation';
import { PriceList, PriceListOptionPrice } from '@/types/price-list';
import { SapCustomer } from '@/services/sap.service';
import { createQuotation } from '@/services/quotation.service';
import { getPriceLists, getPriceListPrices } from '@/services/price-list.service';
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

  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [selectedPriceListId, setSelectedPriceListId] = useState<string>('');
  const [prices, setPrices] = useState<Map<number, PriceListOptionPrice>>(new Map());
  const [fetchingPrices, setFetchingPrices] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) { router.replace('/sales/configurator'); return; }
    try { setDraft(JSON.parse(raw)); }
    catch { router.replace('/sales/configurator'); }
  }, [router]);

  useEffect(() => {
    getPriceLists().then(setPriceLists).catch(() => {});
  }, []);

  const fetchPrices = useCallback(async (priceListId: number, currentDraft: QuotationDraft) => {
    setFetchingPrices(true);
    try {
      const optionIds = currentDraft.lines.map((l) => l.option_id);
      const result = await getPriceListPrices(priceListId, currentDraft.company_id, optionIds);
      setPrices(new Map(result.map((p) => [p.characteristic_option_id, p])));
    } catch {
      setPrices(new Map());
    } finally {
      setFetchingPrices(false);
    }
  }, []);

  async function handlePriceListChange(value: string) {
    setSelectedPriceListId(value);
    setPrices(new Map());
    if (value && draft) {
      await fetchPrices(Number(value), draft);
    }
  }

  // Totales agrupados por moneda (solo líneas con precio)
  const priceTotals = useMemo(() => {
    if (!draft || prices.size === 0) return [];
    const totals = new Map<string, { symbol: string; total: number }>();
    for (const line of draft.lines) {
      const p = prices.get(line.option_id);
      if (p?.unit_price == null) continue;
      const amount = Number(p.unit_price);
      const code = p.currency_code ?? '?';
      const existing = totals.get(code);
      if (existing) {
        existing.total += amount;
      } else {
        totals.set(code, { symbol: p.currency_symbol ?? code, total: amount });
      }
    }
    return Array.from(totals.entries()).map(([code, { symbol, total }]) => ({ code, symbol, total }));
  }, [draft, prices]);

  const canSubmit = !!customer && !!validUntil && !submitting;

  async function handleSubmit() {
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
        lines: draft.lines.map((l) => {
          const price = prices.get(l.option_id);
          return {
            characteristic_id: l.characteristic_id,
            option_id: l.option_id,
            ...(price?.unit_price != null && { unit_price: price.unit_price }),
          };
        }),
      });
      sessionStorage.removeItem(DRAFT_KEY);
      router.push(`/sales/quotation/${result.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cotización.');
    } finally {
      setSubmitting(false);
    }
  }

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

          {/* Lista de precios */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Tag size={16} className="text-primary" /> Lista de Precios
                <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="priceList">Lista de precios</Label>
                <div className="relative">
                  <select
                    id="priceList"
                    title="Lista de precios"
                    value={selectedPriceListId}
                    onChange={(e) => handlePriceListChange(e.target.value)}
                    disabled={fetchingPrices}
                    className="w-full px-3 py-2 text-sm rounded-md border border-input bg-transparent shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors disabled:opacity-50 appearance-none"
                  >
                    <option value="">Sin lista de precios</option>
                    {priceLists.map((pl) => (
                      <option key={pl.id} value={pl.id}>
                        {pl.list_number} — {pl.name}
                      </option>
                    ))}
                  </select>
                  {fetchingPrices && (
                    <Loader2 size={14} className="animate-spin text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  )}
                </div>
              </div>
              {selectedPriceListId && !fetchingPrices && prices.size > 0 && (
                <p className="text-xs text-muted-foreground">
                  Precios cargados. Los ítems sin precio en esta lista se enviarán sin valor.
                </p>
              )}
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

        {/* ── Right: desglose + total ── */}
        <div className="flex gap-4 items-start lg:sticky lg:top-6">

          {/* Desglose */}
          <Card className="flex-1 min-w-0">
            <CardHeader className="px-4 py-2.5 border-b border-border">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Banknote size={14} className="text-primary" /> Desglose
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex items-start justify-between px-4 py-2 border-b border-border gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">Equipo</p>
                  <p className="text-xs font-semibold">{draft.machine_matnrk}</p>
                  <p className="text-[11px] text-muted-foreground">{draft.machine_description}</p>
                </div>
              </div>

              {fetchingPrices ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 size={18} className="animate-spin text-muted-foreground" />
                </div>
              ) : (
                draft.lines.map((line) => {
                  const price = prices.get(line.option_id);
                  return (
                    <div
                      key={line.characteristic_id}
                      className="flex items-center justify-between px-4 py-2 border-b border-border last:border-0 gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-[11px] text-muted-foreground">{line.characteristic_name}</p>
                        <p className="text-xs truncate">{line.option_description}</p>
                        <p className="text-[11px] text-muted-foreground/50 font-mono">{line.mrkwrt}</p>
                      </div>
                      {selectedPriceListId && (
                        <div className="shrink-0 text-right">
                          {price?.unit_price != null ? (
                            <span className="text-xs font-semibold text-primary tabular-nums">
                              {price.currency_symbol ?? price.currency_code}{' '}
                              {Number(price.unit_price).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          ) : (
                            <span className="text-[11px] text-muted-foreground italic">Sin precio</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Total — aparece solo cuando hay precios calculados */}
          {priceTotals.length > 0 && (
            <Card className="shrink-0 w-56 border-primary/20">
              <CardHeader className="px-4 py-2.5 border-b border-border">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Total
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 py-3 space-y-3">
                {priceTotals.map(({ code, symbol, total }) => (
                  <div key={code}>
                    <p className="text-[11px] text-muted-foreground mb-0.5">{code}</p>
                    <p className="text-2xl font-bold text-primary tabular-nums leading-tight">
                      {symbol}{' '}
                      {total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
