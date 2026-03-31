import api from './api';
import { Machine, MachineOptions } from '@/types/equipment';

export async function getMachines(): Promise<Machine[]> {
  const response = await api.get('/api/v1/equipment/machines');
  return response.data.data;
}

export async function getMachineOptions(machineId: number): Promise<MachineOptions> {
  const response = await api.get(`/api/v1/equipment/machines/${machineId}/options`);
  return response.data.data;
}
