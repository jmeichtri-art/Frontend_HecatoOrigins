export interface TemplateLine {
  characteristic_id: number;
  merkm: string;
  characteristic_name: string;
  option_id: number;
  mrkwrt: string;
  option_description: string;
}

export interface Template {
  id: number;
  company_id: number;
  machine_id: number;
  matnrk: string;
  machine_description: string;
  name: string;
  created_at: string;
  updated_at: string;
  lines?: TemplateLine[];
}

export interface CreateTemplatePayload {
  company_id: number;
  machine_id: number;
  name: string;
  lines: { characteristic_id: number; option_id: number }[];
}
