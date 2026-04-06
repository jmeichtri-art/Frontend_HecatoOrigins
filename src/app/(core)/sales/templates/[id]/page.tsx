'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Loader2, ArrowLeft, Forklift, BookMarked } from 'lucide-react';
import { getTemplateById } from '@/services/template.service';
import { Template } from '@/types/template';
import { Card, CardContent } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';

export default function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const numId = Number(id);
    if (isNaN(numId)) {
      setError('ID de template inválido.');
      setLoading(false);
      return;
    }
    getTemplateById(numId)
      .then(setTemplate)
      .catch((err) => setError(err.message ?? 'No se pudo cargar el template.'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link
          href="/sales/templates"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">
            {template ? template.name : 'Template'}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Detalle de configuración guardada</p>
        </div>
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

      {!loading && !error && template && (
        <div className="space-y-4">
          {/* Header card */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Forklift size={24} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {template.matnrk}
                    </span>
                    <BookMarked size={14} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">#{template.id}</span>
                  </div>
                  <p className="font-bold text-lg leading-snug">{template.name}</p>
                  <p className="text-sm text-muted-foreground">{template.machine_description}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border flex gap-6 text-xs text-muted-foreground">
                <span>Creado: <span className="text-foreground font-medium">{formatDate(template.created_at)}</span></span>
                <span>Actualizado: <span className="text-foreground font-medium">{formatDate(template.updated_at)}</span></span>
              </div>
            </CardContent>
          </Card>

          {/* Lines */}
          {template.lines && template.lines.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">
                  Configuración ({template.lines.length} {template.lines.length === 1 ? 'ítem' : 'ítems'})
                </h3>
                <div className="space-y-0">
                  {template.lines.map((line, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-between py-2.5 border-b border-border last:border-0 gap-4"
                    >
                      <span className="text-xs text-muted-foreground shrink-0 pt-0.5 w-44">{line.characteristic_name}</span>
                      <div className="text-right">
                        <p className="font-medium text-sm">{line.option_description}</p>
                        <p className="text-xs text-muted-foreground/60 font-mono">{line.mrkwrt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
