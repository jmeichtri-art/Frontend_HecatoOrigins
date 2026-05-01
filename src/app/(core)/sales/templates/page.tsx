'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookMarked, AlertCircle, Loader2, Search, X, ChevronRight, Forklift, FileText } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useCompany } from '@/lib/company/CompanyContext';
import { getTemplates, getTemplateById } from '@/services/template.service';
import { Template } from '@/types/template';
import { QuotationDraft } from '@/types/quotation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';

const DRAFT_KEY = 'hecato_quotation_draft';

export default function TemplatesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { selectedCompany } = useCompany();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [loadingTemplateId, setLoadingTemplateId] = useState<number | null>(null);
  const [quotationError, setQuotationError] = useState('');

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

  const handleGenerateQuotation = async (template: Template) => {
    if (!selectedCompany) {
      setQuotationError('Seleccioná una compañía en el listado de cotizaciones antes de generar.');
      return;
    }
    setQuotationError('');
    setLoadingTemplateId(template.id);
    try {
      const full = await getTemplateById(template.id);
      const lines: QuotationDraft['lines'] = (full.lines ?? []).map((l) => ({
        characteristic_id: l.characteristic_id,
        characteristic_name: l.characteristic_name,
        merkm: l.merkm,
        option_id: l.option_id,
        option_description: l.option_description,
        mrkwrt: l.mrkwrt,
      }));
      const draft: QuotationDraft = {
        company_id: selectedCompany.id,
        company_name: selectedCompany.name,
        machine_id: full.machine_id,
        machine_matnrk: full.matnrk,
        machine_description: full.machine_description,
        template_id: full.id,
        lines,
      };
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      router.push('/sales/quotation/new');
    } catch {
      setQuotationError('No se pudo cargar el template. Intentá de nuevo.');
    } finally {
      setLoadingTemplateId(null);
    }
  };

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
            title="buscar"
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {quotationError && (
        <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-4 py-3 rounded-lg text-sm">
          <AlertCircle size={15} /> {quotationError}
        </div>
      )}

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
              ? <><span>No se encontraron templates para </span><span className="font-medium text-foreground">&quot;{search}&quot;</span></>
              : 'Todavía no hay templates guardados.'}
          </p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((template) => (
            <Card key={template.id} className="transition-all duration-200 hover:shadow-md border-border h-full flex flex-col">
              <CardContent className="p-5 flex flex-col h-full">
                {/* Icon row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Forklift size={20} className="text-primary" />
                  </div>
                  <Link href={`/sales/templates/${template.id}`} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                    <ChevronRight size={16} />
                  </Link>
                </div>

                {/* Info */}
                <p className="font-semibold text-sm leading-snug mb-1">{template.name}</p>
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full self-start mb-2">
                  {template.matnrk}
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed flex-1">{template.machine_description}</p>
                <p className="text-xs text-muted-foreground/60 mt-3 mb-4">
                  Creado el {formatDate(template.created_at)}
                </p>

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                  <Link href={`/sales/templates/${template.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Ver detalle
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    className="flex-1"
                    disabled={loadingTemplateId === template.id}
                    onClick={() => handleGenerateQuotation(template)}
                  >
                    {loadingTemplateId === template.id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <FileText size={13} />
                    )}
                    Cotizar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
