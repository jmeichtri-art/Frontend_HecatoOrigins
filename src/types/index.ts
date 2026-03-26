export interface MachineModel {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl?: string;
  basePrice: number;
  maxCapacity: number;
  maxHeight: number;
}

export interface MachineComponent {
  id: string;
  name: string;
  type: 'motor' | 'mastil' | 'llantas' | 'bateria' | 'cabina' | 'attachment';
  options: ComponentOption[];
}

export interface ComponentOption {
  id: string;
  label: string;
  description?: string;
  price: number;
  specs?: Record<string, string>;
}

export interface MachineConfiguration {
  modelId: string;
  modelName: string;
  selectedComponents: Record<string, ComponentOption>;
  selectedAccessories: string[];
  totalPrice: number;
  notes?: string;
}

export interface Quotation {
  id: string;
  number: string;
  clientName: string;
  clientCompany: string;
  status: 'borrador' | 'enviada' | 'aceptada' | 'rechazada' | 'vencida';
  modelName: string;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  validUntil: string;
  configuration?: MachineConfiguration;
}
