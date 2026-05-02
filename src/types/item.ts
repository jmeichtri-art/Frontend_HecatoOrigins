export interface Item {
  id: number;
  code: string;
  name: string;
  company_id: number;
  sap_code: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateItemPayload {
  code: string;
  name: string;
  company_id: number;
  sap_code?: string;
  description?: string;
}

export interface UpdateItemPayload {
  company_id: number;
  code?: string;
  name?: string;
  sap_code?: string;
  description?: string;
}
