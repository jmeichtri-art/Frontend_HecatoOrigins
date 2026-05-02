'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Loader2, Plus, Pencil, Trash2, X, Check, Building2 } from 'lucide-react';
import { getCompanies, createCompany, updateCompany, deleteCompany } from '@/services/company.service';
import { Company, CreateCompanyPayload, UpdateCompanyPayload } from '@/types/company';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { useCompany } from '@/lib/company/CompanyContext';

interface CompanyFormState {
  name: string;
  database_name: string;
  user: string;
  password: string;
  type: string;
  active: boolean;
}

const EMPTY_FORM: CompanyFormState = {
  name: '',
  database_name: '',
  user: '',
  password: '',
  type: 'mssql',
  active: true,
};

type FormMode = { type: 'create' } | { type: 'edit'; company: Company };

export default function CompaniesPage() {
  const { refreshCompanies } = useCompany();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  const [mode, setMode]               = useState<FormMode | null>(null);
  const [form, setForm]               = useState<CompanyFormState>(EMPTY_FORM);
  const [formError, setFormError]     = useState('');
  const [submitting, setSubmitting]   = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [deleting, setDeleting]           = useState(false);

  useEffect(() => { loadCompanies(); }, []);

  async function loadCompanies() {
    setLoading(true);
    setError('');
    try {
      setCompanies(await getCompanies());
    } catch {
      setError('No se pudieron cargar las compañías. Verificá la conexión.');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormError('');
    setMode({ type: 'create' });
    setConfirmDelete(null);
  }

  function openEdit(company: Company) {
    setForm({
      name: company.name,
      database_name: company.database_name,
      user: '',
      password: '',
      type: '',
      active: company.active,
    });
    setFormError('');
    setMode({ type: 'edit', company });
    setConfirmDelete(null);
  }

  function closeForm() {
    setMode(null);
    setFormError('');
  }

  function setField<K extends keyof CompanyFormState>(key: K, value: CompanyFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setFormError('');
  }

  async function handleSubmit() {
    if (mode?.type === 'create') {
      if (!form.name.trim())          { setFormError('El nombre es requerido.'); return; }
      if (!form.database_name.trim()) { setFormError('El database name es requerido.'); return; }
      if (!form.user.trim())          { setFormError('El usuario de conexión es requerido.'); return; }
      if (!form.password.trim())      { setFormError('La contraseña de conexión es requerida.'); return; }
      if (!form.type.trim())          { setFormError('El tipo de driver es requerido.'); return; }

      setSubmitting(true);
      try {
        const payload: CreateCompanyPayload = {
          name: form.name.trim(),
          database_name: form.database_name.trim(),
          user: form.user.trim(),
          password: form.password,
          type: form.type.trim(),
          active: form.active,
        };
        const created = await createCompany(payload);
        setCompanies((c) => [...c, created]);
        closeForm();
        refreshCompanies();
      } catch (err: unknown) {
        setFormError(err instanceof Error ? err.message : 'No se pudo crear la compañía.');
      } finally {
        setSubmitting(false);
      }
    }

    if (mode?.type === 'edit') {
      setSubmitting(true);
      try {
        const payload: UpdateCompanyPayload = {};
        if (form.name.trim())          payload.name          = form.name.trim();
        if (form.database_name.trim()) payload.database_name = form.database_name.trim();
        if (form.user.trim())          payload.user          = form.user.trim();
        if (form.password.trim())      payload.password      = form.password;
        if (form.type.trim())          payload.type          = form.type.trim();
        payload.active = form.active;

        const updated = await updateCompany(mode.company.id, payload);
        setCompanies((c) => c.map((x) => (x.id === updated.id ? updated : x)));
        closeForm();
        refreshCompanies();
      } catch (err: unknown) {
        setFormError(err instanceof Error ? err.message : 'No se pudo actualizar la compañía.');
      } finally {
        setSubmitting(false);
      }
    }
  }

  async function handleDelete(id: number) {
    setDeleting(true);
    try {
      await deleteCompany(id);
      setCompanies((c) => c.filter((x) => x.id !== id));
      setConfirmDelete(null);
      refreshCompanies();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar la compañía.');
    } finally {
      setDeleting(false);
    }
  }

  const isEditing = mode?.type === 'edit';

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Compañías</h1>
          <p className="text-muted-foreground mt-1">Gestioná las empresas conectadas al sistema</p>
        </div>
        {!mode && (
          <Button onClick={openCreate}>
            <Plus size={16} />
            Nueva compañía
          </Button>
        )}
      </div>

      {/* Form panel */}
      {mode && (
        <Card className="border-primary/30 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-base">
                {isEditing
                  ? `Editar compañía — ${(mode as { type: 'edit'; company: Company }).company.name}`
                  : 'Nueva compañía'}
              </h2>
              <button 
              aria-label="label for the select"
              onClick={closeForm} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Nombre */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Nombre <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Hecato Argentina"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  className="px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              {/* Database name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Database name {!isEditing && <span className="text-destructive">*</span>}
                </label>
                <input
                  type="text"
                  placeholder="SBO_HECATO_ARG"
                  value={form.database_name}
                  onChange={(e) => setField('database_name', e.target.value)}
                  className="px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-mono"
                />
              </div>

              {/* Usuario DB */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Usuario DB {!isEditing && <span className="text-destructive">*</span>}
                  {isEditing && <span className="text-muted-foreground/60 normal-case font-normal ml-1">(vacío = sin cambio)</span>}
                </label>
                <input
                  type="text"
                  placeholder="sa"
                  value={form.user}
                  onChange={(e) => setField('user', e.target.value)}
                  className="px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              {/* Contraseña DB */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Contraseña DB {!isEditing && <span className="text-destructive">*</span>}
                  {isEditing && <span className="text-muted-foreground/60 normal-case font-normal ml-1">(vacío = sin cambio)</span>}
                </label>
                <input
                  type="password"
                  placeholder="········"
                  value={form.password}
                  onChange={(e) => setField('password', e.target.value)}
                  className="px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              {/* Tipo de driver */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Tipo de driver {!isEditing && <span className="text-destructive">*</span>}
                  {isEditing && <span className="text-muted-foreground/60 normal-case font-normal ml-1">(vacío = sin cambio)</span>}
                </label>
                <select
                  aria-label="label for the select"
                  value={form.type}
                  onChange={(e) => setField('type', e.target.value)}
                  className="px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                >
                  {isEditing && <option value="">Sin cambio</option>}
                  <option value="mssql">mssql</option>
                  <option value="hana">hana</option>
                </select>
              </div>

              {/* Activa */}
              <div className="flex flex-col gap-1.5 justify-end">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Estado</label>
                <label className="flex items-center gap-2.5 cursor-pointer select-none h-[38px]">
                  <div
                    onClick={() => setField('active', !form.active)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${form.active ? 'bg-primary' : 'bg-border'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.active ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                  <span className="text-sm">{form.active ? 'Activa' : 'Inactiva'}</span>
                </label>
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
                {isEditing ? 'Guardar cambios' : 'Crear compañía'}
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
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            {companies.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                <Building2 size={36} className="mx-auto mb-3 opacity-25" />
                <p className="text-sm">No hay compañías registradas.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">ID</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Nombre</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Database</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Estado</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Creada</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {companies.map((c) => {
                    const isConfirming = confirmDelete === c.id;
                    return (
                      <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3.5 text-muted-foreground font-mono text-xs">#{c.id}</td>
                        <td className="px-5 py-3.5 font-medium">{c.name}</td>
                        <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{c.database_name}</td>
                        <td className="px-5 py-3.5">
                          <Badge variant={c.active ? 'success' : 'default'} dot>
                            {c.active ? 'Activa' : 'Inactiva'}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground text-xs">{formatDate(c.created_at)}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            {isConfirming ? (
                              <>
                                <span className="text-xs text-muted-foreground mr-1">¿Eliminar?</span>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  loading={deleting}
                                  onClick={() => handleDelete(c.id)}
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
                                  onClick={() => openEdit(c)}
                                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                                  title="Editar"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={() => { setConfirmDelete(c.id); setMode(null); }}
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
