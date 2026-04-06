import api from './api';
import { Company, CreateCompanyPayload, UpdateCompanyPayload } from '@/types/company';

export async function getCompanies(): Promise<Company[]> {
  const response = await api.get('/api/v1/companies');
  return response.data.data;
}

export async function createCompany(payload: CreateCompanyPayload): Promise<Company> {
  const response = await api.post('/api/v1/companies', payload);
  return response.data.data;
}

export async function updateCompany(id: number, payload: UpdateCompanyPayload): Promise<Company> {
  const response = await api.put(`/api/v1/companies/${id}`, payload);
  return response.data.data;
}

export async function deleteCompany(id: number): Promise<void> {
  await api.delete(`/api/v1/companies/${id}`);
}
