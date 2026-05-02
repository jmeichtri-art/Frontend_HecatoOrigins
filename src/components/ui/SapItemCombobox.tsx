'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, X, ChevronsUpDown, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { getSapItems, SapItem } from '@/services/sap.service';

interface SapItemComboboxProps {
  companyId: number;
  value: SapItem | null;
  onChange: (item: SapItem | null) => void;
}

export function SapItemCombobox({ companyId, value, onChange }: SapItemComboboxProps) {
  const [items, setItems]         = useState<SapItem[]>([]);
  const [loading, setLoading]     = useState(false);
  const [fetchError, setFetchError] = useState('');

  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);

  const fetchItems = useCallback(() => {
    setLoading(true);
    setFetchError('');
    getSapItems(companyId)
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setFetchError('No se pudieron cargar los ítems SAP.'))
      .finally(() => setLoading(false));
  }, [companyId]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.ItemName.toLowerCase().includes(q) ||
        i.ItemCode.toLowerCase().includes(q),
    );
  }, [items, query]);

  const handleOpen = () => {
    if (loading || !!fetchError) return;
    setOpen(true);
    setQuery('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSelect = (item: SapItem) => {
    onChange(item);
    setOpen(false);
    setQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex gap-1">
        <button
          type="button"
          onClick={handleOpen}
          disabled={loading}
          className="flex-1 flex items-center justify-between gap-2 h-9 px-3 py-1 text-sm rounded-md border border-input bg-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-left"
        >
          {loading ? (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Loader2 size={14} className="animate-spin" /> Cargando ítems SAP...
            </span>
          ) : fetchError ? (
            <span className="flex items-center gap-1.5 text-destructive text-xs">
              <AlertCircle size={14} /> {fetchError}
            </span>
          ) : value ? (
            <span className="truncate">
              <span className="font-medium">{value.ItemName}</span>
              <span className="text-muted-foreground font-mono text-xs ml-2">{value.ItemCode}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">Seleccioná un ítem SAP...</span>
          )}
          <span className="flex items-center gap-1 shrink-0">
            {value && (
              <span
                onClick={handleClear}
                className="p-0.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X size={13} />
              </span>
            )}
            <ChevronsUpDown size={14} className="text-muted-foreground" />
          </span>
        </button>

        <button
          type="button"
          onClick={fetchItems}
          disabled={loading}
          title="Actualizar ítems SAP"
          className="h-9 w-9 flex items-center justify-center rounded-md border border-input bg-transparent shadow-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg overflow-hidden">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Buscar por nombre o código..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 text-sm rounded border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              />
            </div>
          </div>

          <ul className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-3 py-4 text-sm text-center text-muted-foreground">
                {query ? `Sin resultados para "${query}"` : 'Sin ítems disponibles'}
              </li>
            ) : (
              filtered.map((i) => (
                <li
                  key={i.ItemCode}
                  onClick={() => handleSelect(i)}
                  className={`flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-secondary transition-colors gap-3 ${
                    value?.ItemCode === i.ItemCode ? 'bg-primary/5' : ''
                  }`}
                >
                  <span className="text-sm truncate">{i.ItemName}</span>
                  <span className="text-xs text-muted-foreground font-mono shrink-0">{i.ItemCode}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
