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

export interface QuotationDraftLine {
  characteristic_id: number;
  characteristic_name: string;
  merkm: string;
  option_id: number;
  option_description: string;
  mrkwrt: string;
}

export interface QuotationDraft {
  company_id: number;
  company_name: string;
  machine_id: number;
  machine_matnrk: string;
  machine_description: string;
  template_id?: number;
  lines: QuotationDraftLine[];
}

export interface CreateQuotationPayload {
  company_id: number;
  cardcode: string;
  cardname: string;
  machine_id: number;
  template_id?: number | null;
  valid_until: string;
  customer_reference?: string;
  notes?: string;
  lines: {
    characteristic_id: number;
    option_id: number;
    unit_price?: number;
    currency_id?: number;
  }[];
}

export interface QuotationApiLine {
  characteristic_id: number;
  merkm: string;
  characteristic_name: string;
  option_id: number;
  mrkwrt: string;
  option_description: string;
  unit_price: number | null;
  currency_id: number | null;
  currency_code: string | null;
  currency_symbol: string | null;
}

export interface QuotationApiItem {
  id: number;
  company_id: number;
  cardcode: string;
  cardname: string;
  machine_id: number;
  matnrk: string;
  machine_description: string;
  template_id: number | null;
  valid_until: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  sync_status: 'pending' | 'synced' | 'error';
  docentry: number | null;
  notes: string | null;
  customer_reference: string | null;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
  lines?: QuotationApiLine[];
}
