'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookMarked, AlertCircle, Loader2, Search, X, ChevronRight, Forklift } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { getTemplates } from '@/services/template.service';
import { Template } from '@/types/template';
import { Card, CardContent } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';

export default function TemplatesPage() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) return;
    getTemplates(user.company_id)
      .then(setTemplates)
      .catch(() => setError('No se pudieron cargar los templates. Verificá la conexión.'))
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = templates.filter((t) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      t.matnrk.toLowerCase().includes(q) ||
      t.machine_description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Templates</h1>
        <p className="text-muted-foreground mt-1">Configuraciones guardadas para reutilizar</p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar por nombre, equipo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-9 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-4 py-3 rounded-lg text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">
          <BookMarked size={36} className="mx-auto mb-3 opacity-25" />
          <p className="text-sm">
            {search
              ? <>No se encontraron templates para <span className="font-medium text-foreground">&quot;{search}&quot;</span></>
              : 'Todavía no hay templates guardados.'}
          </p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((template) => (
            <Link key={template.id} href={`/sales/templates/${template.id}`}>
              <Card className="cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md border-border h-full">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Forklift size={20} className="text-primary" />
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground mt-1" />
                  </div>
                  <p className="font-semibold text-sm leading-snug mb-1">{template.name}</p>
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full self-start mb-2">
                    {template.matnrk}
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed flex-1">{template.machine_description}</p>
                  <p className="text-xs text-muted-foreground/60 mt-3">
                    Creado el {formatDate(template.created_at)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
