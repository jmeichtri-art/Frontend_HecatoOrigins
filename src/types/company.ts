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
