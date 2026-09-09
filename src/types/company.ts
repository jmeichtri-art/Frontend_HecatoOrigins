export interface Company {
  id: number;
  name: string;
  active: boolean;
  database_name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCompanyPayload {
  name: string;
  database_name: string;
  user: string;
  password: string;
  type: string;
  active?: boolean;
}

export interface UpdateCompanyPayload {
  name?: string;
  database_name?: string;
  user?: string;
  password?: string;
  type?: string;
  active?: boolean;
}

export type SapSettingValue = string | number | boolean | null;

export interface SapSettingDefinition {
  key: string;
  label: string;
  data_type: 'string' | 'number' | 'boolean';
  description: string;
  default_value: SapSettingValue;
}

export interface CompanySapSettings {
  company_id: number;
  configured: boolean;
  [key: string]: SapSettingValue | number | boolean;
}

export type UpdateSapSettingsPayload = Record<string, SapSettingValue>;
