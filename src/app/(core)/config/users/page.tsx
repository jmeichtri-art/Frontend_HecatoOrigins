'use client';

import { useState, useEffect } from 'react';
import {
  AlertCircle, Loader2, Plus, Pencil, Trash2, X, Check, ShieldCheck, Eye, ShoppingBag,
} from 'lucide-react';
import { getUsers, createUser, updateUser, deleteUser } from '@/services/user.service';
import { AppUser, UserRole, CreateUserPayload, UpdateUserPayload } from '@/types/user';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

const ROLE_CONFIG: Record<UserRole, { label: string; variant: 'destructive' | 'info' | 'default'; icon: React.ReactNode }> = {
  admin:  { label: 'Admin',   variant: 'destructive', icon: <ShieldCheck size={11} /> },
  sales:  { label: 'Ventas',  variant: 'info',        icon: <ShoppingBag size={11} /> },
  viewer: { label: 'Viewer',  variant: 'default',     icon: <Eye size={11} /> },
};

interface UserFormState {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

const EMPTY_FORM: UserFormState = { name: '', email: '', password: '', role: 'viewer' };

type FormMode = { type: 'create' } | { type: 'edit'; user: AppUser };

export default function UsersPage() {
  const [users, setUsers]       = useState<AppUser[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  // Form
  const [mode, setMode]         = useState<FormMode | null>(null);
  const [form, setForm]         = useState<UserFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    setError('');
    try {
      setUsers(await getUsers());
    } catch {
      setError('No se pudieron cargar los usuarios. Verificá la conexión.');
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

  function openEdit(user: AppUser) {
    setForm({ name: '', email: user.email, password: '', role: user.role });
    setFormError('');
    setMode({ type: 'edit', user });
    setConfirmDelete(null);
  }

  function closeForm() {
    setMode(null);
    setFormError('');
  }

  function setField<K extends keyof UserFormState>(key: K, value: UserFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setFormError('');
  }

  async function handleSubmit() {
    if (!form.email.trim()) { setFormError('El email es requerido.'); return; }

    if (mode?.type === 'create') {
      if (!form.name.trim())     { setFormError('El nombre es requerido.'); return; }
      if (!form.password.trim()) { setFormError('La contraseña es requerida.'); return; }
      setSubmitting(true);
      try {
        const payload: CreateUserPayload = {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
        };
        const created = await createUser(payload);
        setUsers((u) => [...u, created]);
        closeForm();
      } catch (err: unknown) {
        setFormError(err instanceof Error ? err.message : 'No se pudo crear el usuario.');
      } finally {
        setSubmitting(false);
      }
    }

    if (mode?.type === 'edit') {
      setSubmitting(true);
      try {
        const payload: UpdateUserPayload = {};
        if (form.name.trim())     payload.name     = form.name.trim();
        if (form.email.trim())    payload.email    = form.email.trim();
        if (form.password.trim()) payload.password = form.password;
        if (form.role)            payload.role     = form.role;

        const updated = await updateUser(mode.user.id, payload);
        setUsers((u) => u.map((x) => (x.id === updated.id ? updated : x)));
        closeForm();
      } catch (err: unknown) {
        setFormError(err instanceof Error ? err.message : 'No se pudo actualizar el usuario.');
      } finally {
        setSubmitting(false);
      }
    }
  }

  async function handleDelete(id: number) {
    setDeleting(true);
    try {
      await deleteUser(id);
      setUsers((u) => u.filter((x) => x.id !== id));
      setConfirmDelete(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el usuario.');
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
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-muted-foreground mt-1">Gestioná los accesos al sistema</p>
        </div>
        {!mode && (
          <Button onClick={openCreate}>
            <Plus size={16} />
            Nuevo usuario
          </Button>
        )}
      </div>

      {/* Form panel */}
      {mode && (
        <Card className="border-primary/30 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-base">
                {isEditing ? `Editar usuario #${(mode as { type: 'edit'; user: AppUser }).user.id}` : 'Nuevo usuario'}
              </h2>
              <button onClick={closeForm} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Nombre {!isEditing && <span className="text-destructive">*</span>}
                </label>
                <input
                  type="text"
                  placeholder={isEditing ? 'Dejar vacío para no cambiar' : 'Juan Pérez'}
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  className="px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Email <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  placeholder="juan@hecato.com"
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                  className="px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Contraseña {!isEditing && <span className="text-destructive">*</span>}
                </label>
                <input
                  type="password"
                  placeholder={isEditing ? 'Dejar vacío para no cambiar' : '········'}
                  value={form.password}
                  onChange={(e) => setField('password', e.target.value)}
                  className="px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              {/* Role */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Rol</label>
                <select
                  value={form.role}
                  onChange={(e) => setField('role', e.target.value as UserRole)}
                  className="px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                >
                  <option value="viewer">Viewer</option>
                  <option value="sales">Ventas</option>
                  <option value="admin">Admin</option>
                </select>
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
                {isEditing ? 'Guardar cambios' : 'Crear usuario'}
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
            {users.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground text-sm">
                No hay usuarios registrados.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">ID</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Email</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Rol</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Creado</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const role = ROLE_CONFIG[u.role] ?? ROLE_CONFIG.viewer;
                    const isConfirming = confirmDelete === u.id;
                    return (
                      <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3.5 text-muted-foreground font-mono text-xs">#{u.id}</td>
                        <td className="px-5 py-3.5 font-medium">{u.email}</td>
                        <td className="px-5 py-3.5">
                          <Badge variant={role.variant} className="gap-1">
                            {role.icon}
                            {role.label}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground text-xs">{formatDate(u.created_at)}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            {isConfirming ? (
                              <>
                                <span className="text-xs text-muted-foreground mr-1">¿Eliminar?</span>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  loading={deleting}
                                  onClick={() => handleDelete(u.id)}
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
                                  onClick={() => openEdit(u)}
                                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                                  title="Editar"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={() => { setConfirmDelete(u.id); setMode(null); }}
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
