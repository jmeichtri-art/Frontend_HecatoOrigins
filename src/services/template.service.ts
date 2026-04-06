import api from './api';
import { Template, CreateTemplatePayload } from '@/types/template';

export async function getTemplates(companyId: number): Promise<Template[]> {
  const response = await api.get(`/api/v1/templates?companyId=${companyId}`);
  return response.data.data;
}

export async function getTemplateById(id: number): Promise<Template> {
  const response = await api.get(`/api/v1/templates/${id}`);
  return response.data.data;
}

export async function createTemplate(payload: CreateTemplatePayload): Promise<Template> {
  const response = await api.post('/api/v1/templates', payload);
  return response.data.data;
}
