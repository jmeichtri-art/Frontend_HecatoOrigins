import api from './api';
import { Item, CreateItemPayload, UpdateItemPayload } from '@/types/item';

export async function getItems(companyId: number): Promise<Item[]> {
  const response = await api.get('/api/v1/items', { params: { companyId } });
  return response.data.data;
}

export async function createItem(payload: CreateItemPayload): Promise<Item> {
  const response = await api.post('/api/v1/items', payload);
  return response.data.data;
}

export async function updateItem(id: number, payload: UpdateItemPayload): Promise<Item> {
  const response = await api.put(`/api/v1/items/${id}`, payload);
  return response.data.data;
}

export async function deleteItem(id: number, companyId: number): Promise<void> {
  await api.delete(`/api/v1/items/${id}`, { params: { companyId } });
}
