import type { MachineConfiguration } from './machine';

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
