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

export interface ImportEquipmentResult {
  machines:        { upserted: number };
  characteristics: { upserted: number };
  options:         { upserted: number };
  compatibility:   { upserted: number; skipped: number };
  prices?:         { upserted: number };
  duration_ms:     number;
}

export async function importEquipment(file: File, priceListId?: number): Promise<ImportEquipmentResult> {
  const formData = new FormData();
  formData.append('file', file);
  if (priceListId !== undefined) {
    formData.append('price_list_id', String(priceListId));
  }
  // Content-Type: undefined elimina el default 'application/json' de la instancia,
  // dejando que el browser setee multipart/form-data con el boundary correcto
  const response = await api.post('/api/v1/equipment/import', formData, {
    headers: { 'Content-Type': undefined },
    timeout: 60_000,
  });
  return response.data.data;
}
