'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronRight, Forklift, Zap, Package, ArrowRight, ArrowLeft } from 'lucide-react';
import { MACHINE_MODELS, MACHINE_COMPONENTS, ACCESSORIES } from '@/services/configurador.service';
import { MachineModel, ComponentOption } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn, formatCurrency } from '@/lib/utils';

const STEPS = [
  { id: 1, label: 'Modelo Base', icon: <Forklift size={16} /> },
  { id: 2, label: 'Componentes', icon: <Zap size={16} /> },
  { id: 3, label: 'Accesorios', icon: <Package size={16} /> },
  { id: 4, label: 'Resumen', icon: <Check size={16} /> },
];

export default function ConfiguradorPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedModel, setSelectedModel] = useState<MachineModel | null>(null);
  const [selectedComponents, setSelectedComponents] = useState<Record<string, ComponentOption>>({});
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);

  const totalPrice = useMemo(() => {
    const base = selectedModel?.basePrice ?? 0;
    const comps = Object.values(selectedComponents).reduce((s, c) => s + c.price, 0);
    const accs = ACCESSORIES.filter((a) => selectedAccessories.includes(a.id)).reduce((s, a) => s + a.price, 0);
    return base + comps + accs;
  }, [selectedModel, selectedComponents, selectedAccessories]);

  const selectComponent = (componentId: string, option: ComponentOption) => {
    setSelectedComponents((prev) => ({ ...prev, [componentId]: option }));
  };

  const toggleAccessory = (id: string) => {
    setSelectedAccessories((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const canNext =
    (step === 1 && selectedModel) ||
    (step === 2 && MACHINE_COMPONENTS.every((c) => selectedComponents[c.id])) ||
    step === 3;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Configurador de Autoelevadores</h1>
        <p className="text-muted-foreground mt-1">Armá tu máquina taylor-made paso a paso</p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => {
          const done = step > s.id;
          const active = step === s.id;
          return (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1 min-w-[80px]">
                <div className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300',
                  done  ? 'bg-primary text-white' :
                  active ? 'bg-primary text-white ring-4 ring-primary/20' :
                  'bg-secondary text-muted-foreground'
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
        {/* Step 1: Model */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-lg font-semibold mb-4">Seleccioná el modelo base</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MACHINE_MODELS.map((model) => {
                const active = selectedModel?.id === model.id;
                return (
                  <Card
                    key={model.id}
                    onClick={() => setSelectedModel(model)}
                    className={cn(
                      'cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
                      active ? 'border-primary ring-2 ring-primary/20 shadow-sm' : 'border-border'
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
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {model.category}
                      </span>
                      <h3 className="font-semibold mt-2 mb-1">{model.name}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">{model.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs border-t border-border pt-3">
                        <div>
                          <span className="text-muted-foreground block">Cap. máx.</span>
                          <span className="font-semibold">{model.maxCapacity} kg</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Altura máx.</span>
                          <span className="font-semibold">{model.maxHeight / 1000} m</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-border">
                        <span className="text-xs text-muted-foreground">Desde </span>
                        <span className="font-bold text-lg">{formatCurrency(model.basePrice)}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Components */}
        {step === 2 && (
          <div className="animate-fade-in space-y-6">
            <h2 className="text-lg font-semibold">Configurá los componentes</h2>
            {MACHINE_COMPONENTS.map((comp) => (
              <div key={comp.id}>
                <h3 className="font-medium text-sm uppercase tracking-wider text-muted-foreground mb-3">{comp.name}</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {comp.options.map((opt) => {
                    const selected = selectedComponents[comp.id]?.id === opt.id;
                    return (
                      <Card
                        key={opt.id}
                        onClick={() => selectComponent(comp.id, opt)}
                        className={cn(
                          'cursor-pointer transition-all duration-150 hover:shadow-sm',
                          selected ? 'border-primary ring-2 ring-primary/15' : 'border-border'
                        )}
                      >
                        <CardContent className="p-4 flex items-start gap-3">
                          <div className={cn(
                            'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                            selected ? 'border-primary bg-primary' : 'border-border bg-background'
                          )}>
                            {selected && <Check size={11} className="text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium text-sm">{opt.label}</span>
                              <span className={cn('text-sm font-bold shrink-0', opt.price > 0 ? 'text-primary' : 'text-green-600')}>
                                {opt.price > 0 ? `+${formatCurrency(opt.price)}` : 'Incluido'}
                              </span>
                            </div>
                            {opt.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                            )}
                            {opt.specs && (
                              <div className="flex flex-wrap gap-x-3 mt-1.5">
                                {Object.entries(opt.specs).map(([k, v]) => (
                                  <span key={k} className="text-xs text-muted-foreground">
                                    <span className="font-medium">{k}:</span> {v}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 3: Accessories */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h2 className="text-lg font-semibold mb-1">Opcionales y accesorios</h2>
            <p className="text-sm text-muted-foreground mb-5">Podés agregar o quitar opcionales más tarde</p>
            <div className="grid md:grid-cols-2 gap-3">
              {ACCESSORIES.map((acc) => {
                const selected = selectedAccessories.includes(acc.id);
                return (
                  <Card
                    key={acc.id}
                    onClick={() => toggleAccessory(acc.id)}
                    className={cn(
                      'cursor-pointer transition-all duration-150',
                      selected ? 'border-primary ring-2 ring-primary/15' : 'border-border hover:border-muted-foreground/30'
                    )}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className={cn(
                        'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
                        selected ? 'border-primary bg-primary' : 'border-border bg-background'
                      )}>
                        {selected && <Check size={11} className="text-white" />}
                      </div>
                      <span className="flex-1 text-sm font-medium">{acc.label}</span>
                      <span className="text-sm font-bold text-primary shrink-0">+{formatCurrency(acc.price)}</span>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Summary */}
        {step === 4 && selectedModel && (
          <div className="animate-fade-in">
            <h2 className="text-lg font-semibold mb-5">Resumen de configuración</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                {/* Model */}
                <Card>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Modelo base</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-lg">{selectedModel.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedModel.category}</p>
                      </div>
                      <span className="font-bold text-xl">{formatCurrency(selectedModel.basePrice)}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Components */}
                <Card>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Componentes</h3>
                    <div className="space-y-2">
                      {MACHINE_COMPONENTS.map((comp) => {
                        const opt = selectedComponents[comp.id];
                        return (
                          <div key={comp.id} className="flex items-center justify-between py-1 border-b border-border last:border-0">
                            <div>
                              <span className="text-xs text-muted-foreground">{comp.name}</span>
                              <p className="font-medium text-sm">{opt?.label ?? '—'}</p>
                            </div>
                            <span className="text-sm font-semibold text-primary">
                              {opt?.price === 0 ? 'Incluido' : opt ? `+${formatCurrency(opt.price)}` : '—'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Accessories */}
                {selectedAccessories.length > 0 && (
                  <Card>
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Accesorios</h3>
                      <div className="space-y-2">
                        {ACCESSORIES.filter((a) => selectedAccessories.includes(a.id)).map((a) => (
                          <div key={a.id} className="flex items-center justify-between py-1 border-b border-border last:border-0">
                            <span className="text-sm">{a.label}</span>
                            <span className="text-sm font-semibold text-primary">+{formatCurrency(a.price)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Price summary */}
              <div>
                <Card className="sticky top-4">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">Precio estimado</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Modelo base</span>
                        <span className="font-medium">{formatCurrency(selectedModel.basePrice)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Componentes</span>
                        <span className="font-medium">
                          {formatCurrency(Object.values(selectedComponents).reduce((s, c) => s + c.price, 0))}
                        </span>
                      </div>
                      {selectedAccessories.length > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Accesorios ({selectedAccessories.length})</span>
                          <span className="font-medium">
                            {formatCurrency(ACCESSORIES.filter((a) => selectedAccessories.includes(a.id)).reduce((s, a) => s + a.price, 0))}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="border-t border-border pt-4 mb-5">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total</span>
                        <span className="text-2xl font-extrabold text-primary">{formatCurrency(totalPrice)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">* Precio estimado, sujeto a confirmación</p>
                    </div>
                    <Button className="w-full" size="lg" onClick={() => router.push('/ventas/cotizacion')}>
                      Generar Cotización
                      <ArrowRight size={16} />
                    </Button>
                    <Button variant="outline" className="w-full mt-2" size="sm" onClick={() => setStep(1)}>
                      Nueva configuración
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Button
          variant="secondary"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 1}
        >
          <ArrowLeft size={16} />
          Anterior
        </Button>

        {step < 4 && (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext}
          >
            {step === 3 ? 'Ver resumen' : 'Siguiente'}
            <ChevronRight size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}
