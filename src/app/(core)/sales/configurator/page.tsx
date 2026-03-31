'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronRight, Forklift, Settings, ArrowRight, ArrowLeft, Search, X, Loader2, AlertCircle } from 'lucide-react';
import { getMachines, getMachineOptions } from '@/services/equipment.service';
import { Machine, Option, MachineOptions } from '@/types/equipment';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

// SAP convention: characteristic merkm '1100' holds the model variant options
const MODEL_VARIANT_KEY = '1100';

const STEPS = [
  { id: 1, label: 'Equipo',   icon: <Forklift  size={16} /> },
  { id: 2, label: 'Opciones', icon: <Settings  size={16} /> },
  { id: 3, label: 'Resumen',  icon: <Check     size={16} /> },
];

export default function ConfiguratorPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1
  const [machines, setMachines]           = useState<Machine[]>([]);
  const [machinesLoading, setMachinesLoading] = useState(true);
  const [machinesError, setMachinesError] = useState('');
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [machineSearch, setMachineSearch] = useState('');

  // Step 2
  const [machineOptions, setMachineOptions] = useState<MachineOptions | null>(null);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError]     = useState('');
  const [selectedOptions, setSelectedOptions] = useState<Record<number, Option>>({}); // characteristicId → Option

  // Fetch machine list on mount
  useEffect(() => {
    getMachines()
      .then(setMachines)
      .catch(() => setMachinesError('No se pudieron cargar los equipos. Verificá la conexión.'))
      .finally(() => setMachinesLoading(false));
  }, []);

  // Fetch options whenever the selected machine changes
  useEffect(() => {
    if (!selectedMachine) return;
    setOptionsLoading(true);
    setOptionsError('');
    setMachineOptions(null);
    setSelectedOptions({});
    getMachineOptions(selectedMachine.id)
      .then(setMachineOptions)
      .catch(() => setOptionsError('No se pudieron cargar las opciones de este equipo.'))
      .finally(() => setOptionsLoading(false));
  }, [selectedMachine]);

  // The model-variant characteristic (merkm === '1100') — may not exist for all machines
  const modelVariantChar = useMemo(
    () => machineOptions?.characteristics.find((c) => c.merkm === MODEL_VARIANT_KEY) ?? null,
    [machineOptions],
  );

  // The currently selected model-variant option ID (drives compatibility filtering)
  const selectedModelVariantId: number | null = modelVariantChar
    ? (selectedOptions[modelVariantChar.id]?.id ?? null)
    : null;

  // Characteristics ordered: model-variant first, rest in original order
  const orderedCharacteristics = useMemo(() => {
    if (!machineOptions) return [];
    return [...machineOptions.characteristics].sort((a, b) => {
      if (a.merkm === MODEL_VARIANT_KEY) return -1;
      if (b.merkm === MODEL_VARIANT_KEY) return 1;
      return 0;
    });
  }, [machineOptions]);

  // Options per characteristic, filtered by compatibility when a model variant is selected
  const visibleOptions = useMemo(() => {
    if (!machineOptions) return {} as Record<number, Option[]>;
    const result: Record<number, Option[]> = {};
    for (const char of machineOptions.characteristics) {
      const active = machineOptions.options.filter((o) => Number(o.characteristicId) === Number(char.id));
      if (char.merkm === MODEL_VARIANT_KEY || !selectedModelVariantId) {
        result[char.id] = active;
      } else {
        result[char.id] = active.filter((o) =>
          machineOptions.compatibility.some((c) => Number(c.optionId) === Number(o.id) && Number(c.modelId) === Number(selectedModelVariantId)),
        );
      }
    }
    return result;
  }, [machineOptions, selectedModelVariantId]);

  const filteredMachines = useMemo(() => {
    const q = machineSearch.trim().toLowerCase();
    if (!q) return machines;
    return machines.filter(
      (m) =>
        m.matnrk.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.matnr.toLowerCase().includes(q),
    );
  }, [machines, machineSearch]);

  // A characteristic is required only if it has at least one visible option
  const canNext =
    (step === 1 && !!selectedMachine) ||
    (step === 2 &&
      !!machineOptions &&
      orderedCharacteristics.every((c) => {
        const opts = visibleOptions[c.id] ?? [];
        return opts.length === 0 || !!selectedOptions[c.id];
      }));

  const selectOption = (characteristicId: number, option: Option) => {
    setSelectedOptions((prev) => {
      const next = { ...prev, [characteristicId]: option };
      // When the model-variant changes, clear selections that are no longer compatible
      const isModelVariantChange =
        characteristicId === modelVariantChar?.id && option.id !== prev[characteristicId]?.id;
      if (isModelVariantChange && machineOptions) {
        for (const char of machineOptions.characteristics) {
          if (char.merkm === MODEL_VARIANT_KEY) continue;
          const existing = next[char.id];
          if (existing) {
            const stillCompatible = machineOptions.compatibility.some(
              (c) => Number(c.optionId) === Number(existing.id) && Number(c.modelId) === Number(option.id),
            );
            if (!stillCompatible) delete next[char.id];
          }
        }
      }
      return next;
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Configurador de Equipos</h1>
        <p className="text-muted-foreground mt-1">Configurá tu equipo paso a paso</p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => {
          const done   = step > s.id;
          const active = step === s.id;
          return (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1 min-w-[80px]">
                <div className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300',
                  done   ? 'bg-primary text-white' :
                  active ? 'bg-primary text-white ring-4 ring-primary/20' :
                           'bg-secondary text-muted-foreground',
                )}>
                  {done ? <Check size={16} /> : s.icon}
                </div>
                <span className={cn('text-xs font-medium whitespace-nowrap', active ? 'text-primary' : 'text-muted-foreground')}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('flex-1 h-0.5 mb-5 mx-2 transition-colors', done ? 'bg-primary' : 'bg-border')} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="min-h-[400px]">

        {/* ── Step 1: Machine selection ── */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-lg font-semibold mb-4">Seleccioná el equipo base</h2>

            <div className="relative mb-5">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por código, descripción..."
                value={machineSearch}
                onChange={(e) => setMachineSearch(e.target.value)}
                className="w-full pl-9 pr-9 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
              {machineSearch && (
                <button
                  onClick={() => setMachineSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {machinesLoading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={28} className="animate-spin text-muted-foreground" />
              </div>
            )}

            {machinesError && (
              <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-4 py-3 rounded-lg text-sm">
                <AlertCircle size={16} />
                {machinesError}
              </div>
            )}

            {!machinesLoading && !machinesError && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMachines.length === 0 && (
                  <div className="col-span-3 py-12 text-center text-muted-foreground">
                    <Search size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">
                      No se encontraron equipos para{' '}
                      <span className="font-medium text-foreground">&quot;{machineSearch}&quot;</span>
                    </p>
                  </div>
                )}
                {filteredMachines.map((machine) => {
                  const active = selectedMachine?.id === machine.id;
                  return (
                    <Card
                      key={machine.id}
                      onClick={() => setSelectedMachine(machine)}
                      className={cn(
                        'cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
                        active ? 'border-primary ring-2 ring-primary/20 shadow-sm' : 'border-border',
                      )}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', active ? 'bg-primary/10' : 'bg-secondary')}>
                            <Forklift size={20} className={active ? 'text-primary' : 'text-muted-foreground'} />
                          </div>
                          {active && (
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <Check size={12} className="text-white" />
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          {machine.matnrk}
                        </span>
                        <p className="text-sm font-medium mt-2 mb-1 leading-snug">{machine.description}</p>
                        <p className="text-xs text-muted-foreground/60 font-mono">#{machine.matnr}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: Options ── */}
        {step === 2 && (
          <div className="animate-fade-in space-y-6">
            <h2 className="text-lg font-semibold">Configurá las opciones</h2>

            {optionsLoading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={28} className="animate-spin text-muted-foreground" />
              </div>
            )}

            {optionsError && (
              <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-4 py-3 rounded-lg text-sm">
                <AlertCircle size={16} />
                {optionsError}
              </div>
            )}

            {!optionsLoading && !optionsError && machineOptions && orderedCharacteristics.map((char) => {
              const opts        = visibleOptions[char.id] ?? [];
              const isVariant   = char.merkm === MODEL_VARIANT_KEY;
              const needsVariant = !isVariant && !selectedModelVariantId && !!modelVariantChar;
              return (
                <div key={char.id}>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">{char.name}</h3>
                    {isVariant && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Variante</span>
                    )}
                  </div>

                  {needsVariant ? (
                    <p className="text-sm text-muted-foreground italic">
                      Seleccioná primero la variante de modelo para ver las opciones compatibles.
                    </p>
                  ) : opts.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">Sin opciones compatibles.</p>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-3">
                      {opts.map((opt) => {
                        const selected = selectedOptions[char.id]?.id === opt.id;
                        return (
                          <Card
                            key={opt.id}
                            onClick={() => selectOption(char.id, opt)}
                            className={cn(
                              'cursor-pointer transition-all duration-150 hover:shadow-sm',
                              selected ? 'border-primary ring-2 ring-primary/15' : 'border-border',
                            )}
                          >
                            <CardContent className="p-4 flex items-start gap-3">
                              <div className={cn(
                                'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                                selected ? 'border-primary bg-primary' : 'border-border bg-background',
                              )}>
                                {selected && <Check size={11} className="text-white" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{opt.description}</p>
                                <p className="text-xs text-muted-foreground/60 font-mono mt-0.5">{opt.mrkwrt}</p>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Step 3: Summary ── */}
        {step === 3 && selectedMachine && (
          <div className="animate-fade-in">
            <h2 className="text-lg font-semibold mb-5">Resumen de configuración</h2>
            <div className="space-y-4 max-w-2xl">

              <Card>
                <CardContent className="p-5">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Equipo</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-lg">{selectedMachine.matnrk}</p>
                      <p className="text-sm text-muted-foreground">{selectedMachine.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">#{selectedMachine.matnr}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Opciones seleccionadas</h3>
                  <div className="space-y-0">
                    {orderedCharacteristics.map((char) => {
                      const opt = selectedOptions[char.id];
                      if (!opt) return null;
                      return (
                        <div key={char.id} className="flex items-start justify-between py-2 border-b border-border last:border-0 gap-4">
                          <span className="text-xs text-muted-foreground shrink-0 pt-0.5 w-40">{char.name}</span>
                          <div className="text-right">
                            <p className="font-medium text-sm">{opt.description}</p>
                            <p className="text-xs text-muted-foreground/60 font-mono">{opt.mrkwrt}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Button className="w-full" size="lg" onClick={() => router.push('/sales/quotation')}>
                Generar Cotización
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Button
          variant="secondary"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 1}
        >
          <ArrowLeft size={16} />
          Anterior
        </Button>

        {step < 3 && (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext}
          >
            {step === 2 ? 'Ver resumen' : 'Siguiente'}
            <ChevronRight size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}
