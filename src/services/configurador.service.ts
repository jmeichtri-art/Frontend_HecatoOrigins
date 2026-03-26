import { MachineModel, MachineComponent } from '@/types';

export const MACHINE_MODELS: MachineModel[] = [
  {
    id: 'cb-1500',
    name: 'Counterbalance 1500',
    category: 'Contrapesado',
    description: 'Autoelevador contrapesado estándar. Ideal para trabajo en exteriores y superficies irregulares.',
    basePrice: 45000,
    maxCapacity: 1500,
    maxHeight: 5500,
  },
  {
    id: 'cb-2500',
    name: 'Counterbalance 2500',
    category: 'Contrapesado',
    description: 'Contrapesado de alta capacidad para cargas pesadas en depósitos y zonas industriales.',
    basePrice: 62000,
    maxCapacity: 2500,
    maxHeight: 6000,
  },
  {
    id: 'rt-1200',
    name: 'Reach Truck 1200',
    category: 'Apilador Retráctil',
    description: 'Ideal para pasillos angostos y operaciones en altura. Alcanza posiciones de rack elevadas.',
    basePrice: 55000,
    maxCapacity: 1200,
    maxHeight: 9500,
  },
  {
    id: 'op-800',
    name: 'Order Picker 800',
    category: 'Selector de Pedidos',
    description: 'Para picking en altura. El operador asciende con la carga para mayor eficiencia.',
    basePrice: 38000,
    maxCapacity: 800,
    maxHeight: 8000,
  },
  {
    id: 'stk-1000',
    name: 'Stacker Eléctrico 1000',
    category: 'Apilador',
    description: 'Apilador eléctrico compacto para traslado y apilado en espacios reducidos.',
    basePrice: 28000,
    maxCapacity: 1000,
    maxHeight: 4500,
  },
];

export const MACHINE_COMPONENTS: MachineComponent[] = [
  {
    id: 'motor',
    name: 'Motor / Propulsión',
    type: 'motor',
    options: [
      { id: 'elec-ac', label: 'Eléctrico AC 48V', description: 'Motor AC trifásico de alto rendimiento energético', price: 0, specs: { 'Potencia': '15 kW', 'Voltaje': '48V', 'Tipo': 'AC Trifásico' } },
      { id: 'elec-li', label: 'Eléctrico Litio 80V', description: 'Sistema de batería litio de alto rendimiento, carga rápida', price: 8000, specs: { 'Potencia': '22 kW', 'Voltaje': '80V', 'Tipo': 'Li-Ion' } },
      { id: 'gnc', label: 'GNC Doble Combustible', description: 'Motor a gas natural comprimido con respaldo nafta', price: 4500, specs: { 'Potencia': '2.4L', 'Emisiones': 'Euro V', 'Tipo': 'GNC/Nafta' } },
      { id: 'lp', label: 'LP Gas (Propano)', description: 'Motor a gas propano licuado', price: 3200, specs: { 'Potencia': '2.4L', 'Tipo': 'LP' } },
    ],
  },
  {
    id: 'mastil',
    name: 'Mástil',
    type: 'mastil',
    options: [
      { id: 'simple', label: 'Simple 3.0 m', description: 'Mástil simple, bajo costo, ideal para espacios con altura libre', price: 0, specs: { 'Altura libre': '2.1 m', 'Altura máx': '3.0 m' } },
      { id: 'duplex', label: 'Dúplex 4.5 m', description: 'Mástil dúplex con visibilidad mejorada y libre paso bajo cabeza', price: 2800, specs: { 'Altura libre': '2.2 m', 'Altura máx': '4.5 m' } },
      { id: 'triplex', label: 'Tríplex 5.5 m', description: 'Mástil tríplex para rack en altura, libre paso bajo estructura', price: 5500, specs: { 'Altura libre': '2.2 m', 'Altura máx': '5.5 m' } },
      { id: 'triplex-x', label: 'Tríplex Plus 6.5 m', description: 'Alta performance para depósitos con racks de gran altura', price: 9200, specs: { 'Altura libre': '2.2 m', 'Altura máx': '6.5 m' } },
    ],
  },
  {
    id: 'llantas',
    name: 'Tipo de Llantas',
    type: 'llantas',
    options: [
      { id: 'superelastica', label: 'Superelástica', description: 'Sin aire, alta durabilidad en pisos industriales', price: 0, specs: { 'Ideal para': 'Interior' } },
      { id: 'neumatica', label: 'Neumática', description: 'Ideal para terrenos irregulares y uso exterior', price: 1200, specs: { 'Ideal para': 'Exterior / Interior' } },
      { id: 'poliuretano', label: 'Poliuretano', description: 'Alta resistencia, sin mantenimiento, piso liso', price: 800, specs: { 'Ideal para': 'Pisos pulidos' } },
    ],
  },
  {
    id: 'bateria',
    name: 'Batería / Autonomía',
    type: 'bateria',
    options: [
      { id: 'pb-360', label: 'Plomo-Ácido 360Ah', description: 'Batería convencional, bajo costo inicial', price: 0, specs: { 'Capacidad': '360 Ah', 'Ciclos': '~1200' } },
      { id: 'pb-480', label: 'Plomo-Ácido 480Ah', description: 'Mayor autonomía por turno', price: 1800, specs: { 'Capacidad': '480 Ah', 'Ciclos': '~1200' } },
      { id: 'litio-200', label: 'Litio 200Ah', description: 'Sin mantenimiento, carga rápida, mayor vida útil', price: 12000, specs: { 'Capacidad': '200 Ah', 'Ciclos': '~3000', 'Carga rápida': 'Sí' } },
      { id: 'litio-300', label: 'Litio 300Ah', description: 'Operación 24/7, ideal para múltiples turnos', price: 18000, specs: { 'Capacidad': '300 Ah', 'Ciclos': '~3000', 'Multi-turno': 'Sí' } },
    ],
  },
];

export const ACCESSORIES = [
  { id: 'cabina', label: 'Cabina con climatización', price: 4500 },
  { id: 'camara', label: 'Sistema de cámara trasera', price: 1200 },
  { id: 'luces-led', label: 'Luces LED de trabajo', price: 650 },
  { id: 'beacon', label: 'Luz beacon de seguridad', price: 380 },
  { id: 'clipper', label: 'Clipper hidráulico', price: 3200 },
  { id: 'rotador', label: 'Rotador de horquillas', price: 2800 },
  { id: 'empujador', label: 'Empujador de carga', price: 2200 },
  { id: 'barra', label: 'Barra de seguridad anti-objetos', price: 450 },
  { id: 'soft', label: 'Software de telemetría (HECATO Connect)', price: 1500 },
  { id: 'asiento-premium', label: 'Asiento premium con amortiguación', price: 780 },
];
