'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Loader2, Plus, Pencil, Trash2, X, Check, Boxes } from 'lucide-react';
import { getItems, createItem, updateItem, deleteItem } from '@/services/item.service';
import { Item, CreateItemPayload, UpdateItemPayload } from '@/types/item';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { useCompany } from '@/lib/company/CompanyContext';
import { SapItemCombobox } from '@/components/ui/SapItemCombobox';
import { SapItem } from '@/services/sap.service';

interface ItemFormState {
  code: string;
  name: string;
  sap_code: string;
  description: string;
}

const EMPTY_FORM: ItemFormState = { code: '', name: '', sap_code: '', description: '' };

type FormMode = { type: 'create' } | { type: 'edit'; item: Item };

export default function ItemsPage() {
  const { companies, isLoading: companiesLoading } = useCompany();

  const [activeCompanyId, setActiveCompanyId] = useState<number | null>(null);

  const [items, setItems]     = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const [mode, setMode]             = useState<FormMode | null>(null);
  const [form, setForm]             = useState<ItemFormState>(EMPTY_FORM);
  const [selectedSapItem, setSelectedSapItem] = useState<SapItem | null>(null);
  const [formError, setFormError]   = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [deleting, setDeleting]           = useState(false);

  // Auto-select first company once the list loads
  useEffect(() => {
    if (!companiesLoading && companies.length > 0 && activeCompanyId === null) {
      setActiveCompanyId(companies[0].id);
    }
  }, [companiesLoading, companies, activeCompanyId]);

  // Load items whenever the active company changes
  useEffect(() => {
    if (!activeCompanyId) return;
    setLoading(true);
    setError('');
    setMode(null);
    setConfirmDelete(null);
    getItems(activeCompanyId)
      .then(setItems)
      .catch(() => setError('No se pudieron cargar los ítems.'))
      .finally(() => setLoading(false));
  }, [activeCompanyId]);

  const activeCompany = companies.find((c) => c.id === activeCompanyId) ?? null;

  function openCreate() {
    setForm(EMPTY_FORM);
    setSelectedSapItem(null);
    setFormError('');
    setMode({ type: 'create' });
    setConfirmDelete(null);
  }

  function openEdit(item: Item) {
    setForm({
      code: item.code,
      name: item.name,
      sap_code: item.sap_code ?? '',
      description: item.description ?? '',
    });
    setSelectedSapItem(item.sap_code ? { ItemCode: item.sap_code, ItemName: item.sap_code } : null);
    setFormError('');
    setMode({ type: 'edit', item });
    setConfirmDelete(null);
  }

  function closeForm() {
    setMode(null);
    setSelectedSapItem(null);
    setFormError('');
  }

  function setField<K extends keyof ItemFormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setFormError('');
  }

  async function handleSubmit() {
    if (!activeCompanyId) return;

    if (!form.code.trim()) { setFormError('El código es requerido.'); return; }
    if (!form.name.trim()) { setFormError('El nombre es requerido.'); return; }

    setSubmitting(true);
    try {
      if (mode?.type === 'create') {
        const payload: CreateItemPayload = {
          code: form.code.trim(),
          name: form.name.trim(),
          company_id: activeCompanyId,
          ...(form.sap_code.trim()    && { sap_code: form.sap_code.trim() }),
          ...(form.description.trim() && { description: form.description.trim() }),
        };
        const created = await createItem(payload);
        setItems((prev) => [...prev, created]);
        closeForm();
      } else if (mode?.type === 'edit') {
        const payload: UpdateItemPayload = {
          company_id: activeCompanyId,
          ...(form.code.trim() && { code: form.code.trim() }),
          ...(form.name.trim() && { name: form.name.trim() }),
          sap_code:    form.sap_code.trim()    || undefined,
          description: form.description.trim() || undefined,
        };
        const updated = await updateItem(mode.item.id, payload);
        setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
        closeForm();
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'No se pudo guardar el ítem.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!activeCompanyId) return;
    setDeleting(true);
    try {
      await deleteItem(id, activeCompanyId);
      setItems((prev) => prev.filter((x) => x.id !== id));
      setConfirmDelete(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el ítem.');
    } finally {
      setDeleting(false);
    }
  }

  const isEditing = mode?.type === 'edit';

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Ítems</h1>
          <p className="text-muted-foreground mt-1">Artículos vinculados a la compañía</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            title="Compañía"
            value={activeCompanyId ?? ''}
            onChange={(e) => setActiveCompanyId(Number(e.target.value))}
            disabled={companiesLoading || companies.length === 0}
            className="px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-50"
          >
            {companiesLoading && <option value="">Cargando…</option>}
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {!mode && activeCompanyId && (
            <Button onClick={openCreate}>
              <Plus size={16} />
              Nuevo ítem
            </Button>
          )}
        </div>
      </div>

      {/* Form panel */}
      {mode && (
        <Card className="border-primary/30 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-base">
                {isEditing
                  ? `Editar ítem — ${(mode as { type: 'edit'; item: Item }).item.code}`
                  : `Nuevo ítem · ${activeCompany?.name}`}
              </h2>
              <button
                type="button"
                title="Cerrar"
                onClick={closeForm}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Código <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  placeholder="ART-001"
                  value={form.code}
                  onChange={(e) => setField('code', e.target.value)}
                  className="px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Nombre <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nombre del artículo"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  className="px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Código SAP{' '}
                  <span className="text-muted-foreground/60 normal-case font-normal">(opcional)</span>
                </label>
                <SapItemCombobox
                  companyId={activeCompanyId!}
                  value={selectedSapItem}
                  onChange={(item) => {
                    setSelectedSapItem(item);
                    setField('sap_code', item?.ItemCode ?? '');
                  }}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Descripción{' '}
                  <span className="text-muted-foreground/60 normal-case font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Descripción breve"
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  className="px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
            </div>

            {formError && (
              <div className="flex items-center gap-2 mt-4 text-destructive bg-destructive/10 px-3 py-2 rounded-lg text-sm">
                <AlertCircle size={14} /> {formError}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-5">
              <Button variant="secondary" onClick={closeForm} disabled={submitting}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} loading={submitting}>
                {isEditing ? 'Guardar cambios' : 'Crear ítem'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error general */}
      {error && (
        <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-4 py-3 rounded-lg text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Table */}
      {loading || companiesLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            {items.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                <Boxes size={36} className="mx-auto mb-3 opacity-25" />
                <p className="text-sm">No hay ítems registrados para esta compañía.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Código</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Nombre</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Cód. SAP</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Descripción</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Creado</th>
                    <th className="px-5 py-3"><span className="sr-only">Acciones</span></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const isConfirming = confirmDelete === item.id;
                    return (
                      <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-xs font-medium">{item.code}</td>
                        <td className="px-5 py-3.5 font-medium">{item.name}</td>
                        <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                          {item.sap_code ?? <span className="opacity-40">—</span>}
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground max-w-xs truncate">
                          {item.description ?? <span className="opacity-40">—</span>}
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground text-xs">{formatDate(item.created_at)}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            {isConfirming ? (
                              <>
                                <span className="text-xs text-muted-foreground mr-1">¿Eliminar?</span>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  loading={deleting}
                                  onClick={() => handleDelete(item.id)}
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
                              <>
                                <button
                                  type="button"
                                  onClick={() => openEdit(item)}
                                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                                  title="Editar"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setConfirmDelete(item.id); setMode(null); }}
                                  className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
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
