import api from './api';
import { AppUser, CreateUserPayload, UpdateUserPayload } from '@/types/user';

export async function getUsers(): Promise<AppUser[]> {
  const response = await api.get('/api/v1/users');
  return response.data.data;
}

export async function createUser(payload: CreateUserPayload): Promise<AppUser> {
  const response = await api.post('/api/v1/users', payload);
  return response.data.data;
}

export async function updateUser(id: number, payload: UpdateUserPayload): Promise<AppUser> {
  const response = await api.put(`/api/v1/users/${id}`, payload);
  return response.data.data;
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/api/v1/users/${id}`);
}
