'use client';

import { useState, useRef, useEffect } from 'react';
import { AlertCircle, CheckCircle2, FileSpreadsheet, Upload, X, ShieldAlert, Info } from 'lucide-react';
import { importEquipment, ImportEquipmentResult } from '@/services/equipment.service';
import { getPriceLists } from '@/services/price-list.service';
import { PriceList } from '@/types/price-list';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth/AuthContext';

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export default function EquipmentImportPage() {
  const { user } = useAuth();

  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [selectedPriceListId, setSelectedPriceListId] = useState<string>('');

  const [file, setFile] = useState<File | null>(null);
  const [sizeError, setSizeError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [importError, setImportError] = useState('');
  const [result, setResult] = useState<ImportEquipmentResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getPriceLists()
      .then(setPriceLists)
      .catch(() => {/* Si no hay listas disponibles, el dropdown queda vacío */});
  }, []);

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-destructive/10 text-destructive">
          <ShieldAlert size={20} className="shrink-0" />
          <p className="text-sm font-medium">Solo los administradores pueden importar equipos.</p>
        </div>
      </div>
    );
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setSizeError('');
    setImportError('');
    setResult(null);

    if (selected && selected.size > MAX_SIZE_BYTES) {
      setSizeError('El archivo supera el tamaño máximo de 10 MB.');
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    setFile(selected);
  }

  function clearFile() {
    setFile(null);
    setSizeError('');
    setImportError('');
    setResult(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setImportError('');
    setResult(null);
    try {
      const priceListId = selectedPriceListId ? Number(selectedPriceListId) : undefined;
      const data = await importEquipment(file, priceListId);
      setResult(data);
      clearFile();
    } catch (err: unknown) {
      setImportError(err instanceof Error ? err.message : 'Error al importar el archivo.');
    } finally {
      setUploading(false);
    }
  }

  const fileSizeLabel = file
    ? file.size >= 1024 * 1024
      ? `${(file.size / 1024 / 1024).toFixed(1)} MB`
      : `${(file.size / 1024).toFixed(0)} KB`
    : '';

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Importar Equipos</h1>
        <p className="text-muted-foreground mt-1">
          Cargá un archivo Excel con la combinación de máquinas, características y opciones
        </p>
      </div>

      {/* Info */}
      <div className="flex gap-3 px-4 py-3.5 rounded-lg border border-destructive/20 bg-destructive/5 text-sm text-destructive">
        <Info size={16} className="shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p>
            <span className="font-semibold">Sin lista de precios:</span>{' '}
            solo se actualizan máquinas, características, opciones y compatibilidades.
          </p>
          <p>
            <span className="font-semibold">Con lista de precios:</span>{' '}
            además se actualizan los precios de las máquinas que tengan <code className="font-mono text-xs bg-destructive/10 px-1 rounded">PREIS &gt; 0</code> y
            cuya moneda (<code className="font-mono text-xs bg-destructive/10 px-1 rounded">WAER</code>) exista en el sistema.
            Todo corre en una sola transacción — si algo falla, no queda nada a medias.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-5">
          {/* Archivo */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-2">
              Archivo Excel <span className="text-destructive">*</span>
            </label>

            {file ? (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-primary/40 bg-primary/5">
                <FileSpreadsheet size={20} className="text-primary shrink-0" />
                <span className="text-sm font-medium flex-1 truncate">{file.name}</span>
                <span className="text-xs text-muted-foreground shrink-0">{fileSizeLabel}</span>
                <button
                  onClick={clearFile}
                  title="Quitar archivo"
                  className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center gap-2 px-6 py-10 rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <Upload size={28} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Hacé click para seleccionar un archivo
                </span>
                <span className="text-xs text-muted-foreground/60">.xlsx · .xls · máx. 10 MB</span>
              </label>
            )}

            <input
              id="file-upload"
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="sr-only"
            />
          </div>

          {/* Lista de precios */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Lista de precios{' '}
              <span className="text-muted-foreground/60 normal-case font-normal">(opcional)</span>
            </label>
            <select
              title="Lista de precios"
              value={selectedPriceListId}
              onChange={(e) => setSelectedPriceListId(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            >
              <option value="">Sin actualizar precios</option>
              {priceLists.map((pl) => (
                <option key={pl.id} value={pl.id}>
                  {pl.list_number} — {pl.name}
                </option>
              ))}
            </select>
          </div>

          {sizeError && (
            <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-3 py-2.5 rounded-lg text-sm">
              <AlertCircle size={14} className="shrink-0" /> {sizeError}
            </div>
          )}

          {importError && (
            <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-3 py-2.5 rounded-lg text-sm">
              <AlertCircle size={14} className="shrink-0" /> {importError}
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleUpload} loading={uploading} disabled={!file || uploading}>
              <Upload size={15} />
              Importar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultado */}
      {result && (
        <Card className="border-green-500/30">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle2 size={18} className="shrink-0" />
              <h2 className="font-semibold text-base">Importación completada</h2>
              <span className="ml-auto text-xs text-muted-foreground font-normal">
                {result.duration_ms} ms
              </span>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide py-2">
                    Entidad
                  </th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide py-2">
                    Upserted
                  </th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide py-2">
                    Omitidos
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-2.5 font-medium">Máquinas</td>
                  <td className="py-2.5 text-right font-mono">{result.machines.upserted}</td>
                  <td className="py-2.5 text-right text-muted-foreground font-mono">—</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2.5 font-medium">Características</td>
                  <td className="py-2.5 text-right font-mono">{result.characteristics.upserted}</td>
                  <td className="py-2.5 text-right text-muted-foreground font-mono">—</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2.5 font-medium">Opciones</td>
                  <td className="py-2.5 text-right font-mono">{result.options.upserted}</td>
                  <td className="py-2.5 text-right text-muted-foreground font-mono">—</td>
                </tr>
                <tr className={result.prices ? 'border-b border-border' : ''}>
                  <td className="py-2.5 font-medium">Compatibilidades</td>
                  <td className="py-2.5 text-right font-mono">{result.compatibility.upserted}</td>
                  <td className="py-2.5 text-right text-muted-foreground font-mono">
                    {result.compatibility.skipped > 0 ? result.compatibility.skipped : '—'}
                  </td>
                </tr>
                {result.prices && (
                  <tr>
                    <td className="py-2.5 font-medium">Precios</td>
                    <td className="py-2.5 text-right font-mono">{result.prices.upserted}</td>
                    <td className="py-2.5 text-right text-muted-foreground font-mono">—</td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
