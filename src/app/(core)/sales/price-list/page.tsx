'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Loader2, Plus, Trash2, X, Check, Tag, PlusCircle, Pencil } from 'lucide-react';
import { createPriceList, getPriceLists, deletePriceList, updatePriceList } from '@/services/price-list.service';
import { getMachines } from '@/services/equipment.service';
import { PriceList, CreatePriceListPayload, UpdatePriceListPayload } from '@/types/price-list';
import { Machine } from '@/types/equipment';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { useCompany } from '@/lib/company/CompanyContext';

interface BasicForm {
  list_number: string;
  name: string;
  valid_from: string;
  valid_until: string;
}

const EMPTY_BASIC: BasicForm = {
  list_number: '',
  name: '',
  valid_from: '',
  valid_until: '',
};

interface ItemRow {
  itemType: 'machine' | 'article';
  machine_id: string;
  article_id: string;
  unit_price: string;
  currency_id: string;
}

const EMPTY_ITEM: ItemRow = {
  itemType: 'machine',
  machine_id: '',
  article_id: '',
  unit_price: '',
  currency_id: '',
};

export default function PriceListPage() {
  const { companies } = useCompany();

  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [loading, setLoading] = useState(true);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [basic, setBasic] = useState<BasicForm>(EMPTY_BASIC);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<Set<number>>(new Set());
  const [items, setItems] = useState<ItemRow[]>([]);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [lists, machs] = await Promise.allSettled([getPriceLists(), getMachines()]);
    if (lists.status === 'fulfilled') setPriceLists(lists.value);
    if (machs.status === 'fulfilled') setMachines(machs.value);
    setLoading(false);
  }

  function openCreate() {
    setBasic(EMPTY_BASIC);
    setSelectedCompanyIds(new Set());
    setItems([]);
    setFormError('');
    setEditingId(null);
    setShowForm(true);
    setConfirmDelete(null);
  }

  function openEdit(pl: PriceList) {
    setBasic({
      list_number: pl.list_number,
      name: pl.name,
      valid_from: pl.valid_from,
      valid_until: pl.valid_until ?? '',
    });
    setSelectedCompanyIds(new Set((pl.companies ?? []).map((c) => c.id)));
    setItems((pl.items ?? []).map((item) => ({
      itemType: item.article_id !== null ? 'article' : 'machine',
      machine_id: item.machine_id !== null ? String(item.machine_id) : '',
      article_id: item.article_id !== null ? String(item.article_id) : '',
      unit_price: String(item.unit_price),
      currency_id: String(item.currency_id),
    })));
    setFormError('');
    setEditingId(pl.id);
    setShowForm(true);
    setConfirmDelete(null);
  }

  function closeForm() {
    setShowForm(false);
    setFormError('');
    setEditingId(null);
  }

  function setField<K extends keyof BasicForm>(key: K, value: string) {
    setBasic((f) => ({ ...f, [key]: value }));
    setFormError('');
  }

  function toggleCompany(id: number) {
    setSelectedCompanyIds((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function addItem() {
    setItems((rows) => [...rows, { ...EMPTY_ITEM }]);
  }

  function removeItem(index: number) {
    setItems((rows) => rows.filter((_, i) => i !== index));
  }

  function setItemField(index: number, key: keyof ItemRow, value: string) {
    setItems((rows) => rows.map((row, i) => i === index ? { ...row, [key]: value } : row));
    setFormError('');
  }

  async function handleSubmit() {
    if (!basic.list_number.trim()) { setFormError('El número de lista es requerido.'); return; }
    if (!basic.name.trim()) { setFormError('El nombre es requerido.'); return; }
    if (!basic.valid_from) { setFormError('La fecha de vigencia desde es requerida.'); return; }

    for (let i = 0; i < items.length; i++) {
      const row = items[i];
      if (row.itemType === 'machine' && !row.machine_id) {
        setFormError(`Ítem ${i + 1}: seleccioná una máquina.`); return;
      }
      if (row.itemType === 'article' && !row.article_id.trim()) {
        setFormError(`Ítem ${i + 1}: ingresá el ID del artículo.`); return;
      }
      if (!row.unit_price || isNaN(Number(row.unit_price)) || Number(row.unit_price) <= 0) {
        setFormError(`Ítem ${i + 1}: el precio unitario debe ser un número positivo.`); return;
      }
      if (!row.currency_id || isNaN(Number(row.currency_id)) || Number(row.currency_id) < 1) {
        setFormError(`Ítem ${i + 1}: el ID de moneda debe ser un entero positivo.`); return;
      }
    }

    setSubmitting(true);
    try {
      if (editingId !== null) {
        const payload: UpdatePriceListPayload = {
          list_number: basic.list_number.trim(),
          name: basic.name.trim(),
          valid_from: basic.valid_from,
          ...(basic.valid_until && { valid_until: basic.valid_until }),
          company_ids: Array.from(selectedCompanyIds),
          items: items.map((row) => ({
            ...(row.itemType === 'machine'
              ? { characteristic_option_id: Number(row.machine_id) }
              : { article_id: Number(row.article_id) }),
            unit_price: Number(row.unit_price),
            currency_id: Number(row.currency_id),
          })),
        };
        const updated = await updatePriceList(editingId, payload);
        setPriceLists((p) => p.map((x) => x.id === editingId ? updated : x));
      } else {
        const payload: CreatePriceListPayload = {
          list_number: basic.list_number.trim(),
          name: basic.name.trim(),
          valid_from: basic.valid_from,
          ...(basic.valid_until && { valid_until: basic.valid_until }),
          ...(selectedCompanyIds.size > 0 && { company_ids: Array.from(selectedCompanyIds) }),
          ...(items.length > 0 && {
            items: items.map((row) => ({
              ...(row.itemType === 'machine'
                ? { machine_id: Number(row.machine_id) }
                : { article_id: Number(row.article_id) }),
              unit_price: Number(row.unit_price),
              currency_id: Number(row.currency_id),
            })),
          }),
        };
        const created = await createPriceList(payload);
        setPriceLists((p) => [created, ...p]);
      }
      closeForm();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : editingId !== null ? 'No se pudo actualizar la lista de precios.' : 'No se pudo crear la lista de precios.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    setDeleting(true);
    try {
      await deletePriceList(id);
      setPriceLists((p) => p.filter((x) => x.id !== id));
      setConfirmDelete(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar la lista de precios.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Listas de Precios</h1>
          <p className="text-muted-foreground mt-1">Administrá las listas de precios vigentes</p>
        </div>
        {!showForm && (
          <Button onClick={openCreate}>
            <Plus size={16} />
            Nueva lista
          </Button>
        )}
      </div>

      {/* Form panel */}
      {showForm && (
        <Card className="border-primary/30 shadow-sm">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-base">
                {editingId !== null ? 'Editar lista de precios' : 'Nueva lista de precios'}
              </h2>
              <button onClick={closeForm} title="Cerrar" className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Basic info */}
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                Datos generales
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Número de lista <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="LP-001"
                    value={basic.list_number}
                    onChange={(e) => setField('list_number', e.target.value)}
                    className="px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Nombre <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Lista Oficial 2026"
                    value={basic.name}
                    onChange={(e) => setField('name', e.target.value)}
                    className="px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Vigente desde <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="date"
                    title="Vigente desde"
                    value={basic.valid_from}
                    onChange={(e) => setField('valid_from', e.target.value)}
                    className="px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Vigente hasta{' '}
                    <span className="text-muted-foreground/60 normal-case font-normal ml-1">(opcional)</span>
                  </label>
                  <input
                    type="date"
                    title="Vigente hasta"
                    value={basic.valid_until}
                    onChange={(e) => setField('valid_until', e.target.value)}
                    className="px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Companies */}
            {companies.length > 0 && (
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                  Compañías{' '}
                  <span className="text-muted-foreground/60 normal-case font-normal">(opcional)</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {companies.map((c) => {
                    const selected = selectedCompanyIds.has(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleCompany(c.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          selected
                            ? 'bg-primary/15 border-primary text-primary'
                            : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                        }`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  Ítems{' '}
                  <span className="text-muted-foreground/60 normal-case font-normal">(opcional)</span>
                </p>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  <PlusCircle size={14} />
                  Agregar ítem
                </button>
              </div>
              {items.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">Sin ítems. Se pueden agregar después.</p>
              ) : (
                <div className="space-y-2">
                  {items.map((row, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/20"
                    >
                      <select
                        title="Tipo de ítem"
                        value={row.itemType}
                        onChange={(e) => setItemField(idx, 'itemType', e.target.value)}
                        className="px-2 py-1.5 text-xs rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/30 w-[90px] shrink-0"
                      >
                        <option value="machine">Máquina</option>
                        <option value="article">Artículo</option>
                      </select>

                      {row.itemType === 'machine' ? (
                        <select
                          title="Máquina"
                          value={row.machine_id}
                          onChange={(e) => setItemField(idx, 'machine_id', e.target.value)}
                          className="px-2 py-1.5 text-xs rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/30 flex-1 min-w-0"
                        >
                          <option value="">Seleccioná máquina…</option>
                          {machines.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.matnrk} — {m.description}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="number"
                          placeholder="ID artículo"
                          value={row.article_id}
                          onChange={(e) => setItemField(idx, 'article_id', e.target.value)}
                          className="px-2 py-1.5 text-xs rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/30 flex-1 min-w-0"
                          min={1}
                        />
                      )}

                      <input
                        type="number"
                        placeholder="Precio"
                        value={row.unit_price}
                        onChange={(e) => setItemField(idx, 'unit_price', e.target.value)}
                        className="px-2 py-1.5 text-xs rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/30 w-[120px] shrink-0"
                        min={0}
                        step="0.01"
                      />

                      <input
                        type="number"
                        placeholder="ID moneda"
                        value={row.currency_id}
                        onChange={(e) => setItemField(idx, 'currency_id', e.target.value)}
                        className="px-2 py-1.5 text-xs rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/30 w-[90px] shrink-0"
                        min={1}
                      />

                      <button
                        onClick={() => removeItem(idx)}
                        title="Eliminar ítem"
                        className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {formError && (
              <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-3 py-2 rounded-lg text-sm">
                <AlertCircle size={14} /> {formError}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={closeForm} disabled={submitting}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} loading={submitting}>
                {editingId !== null ? 'Guardar cambios' : 'Crear lista'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* General error */}
      {error && (
        <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-4 py-3 rounded-lg text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            {priceLists.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                <Tag size={36} className="mx-auto mb-3 opacity-25" />
                <p className="text-sm">No hay listas de precios registradas.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">
                      Nro.
                    </th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">
                      Nombre
                    </th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">
                      Desde
                    </th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">
                      Hasta
                    </th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">
                      Ítems
                    </th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {priceLists.map((pl) => {
                    const isConfirming = confirmDelete === pl.id;
                    return (
                      <tr
                        key={pl.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                          {pl.list_number}
                        </td>
                        <td className="px-5 py-3.5 font-medium">{pl.name}</td>
                        <td className="px-5 py-3.5 text-muted-foreground text-xs">
                          {formatDate(pl.valid_from)}
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground text-xs">
                          {pl.valid_until ? formatDate(pl.valid_until) : '—'}
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge variant="default">{pl.items?.length ?? 0}</Badge>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            {!isConfirming && (
                              <button
                                type="button"
                                onClick={() => openEdit(pl)}
                                className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                title="Editar"
                              >
                                <Pencil size={14} />
                              </button>
                            )}
                            {isConfirming ? (
                              <>
                                <span className="text-xs text-muted-foreground mr-1">¿Eliminar?</span>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  loading={deleting}
                                  onClick={() => handleDelete(pl.id)}
                                >
                                  <Check size={13} />
                                  Sí
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => setConfirmDelete(null)}
                                  disabled={deleting}
                                >
                                  No
                                </Button>
                              </>
                            ) : (
                              <button
                                onClick={() => { setConfirmDelete(pl.id); setShowForm(false); }}
                                className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
