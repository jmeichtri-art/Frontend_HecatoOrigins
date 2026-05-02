import api from './api';
import { PriceList, CreatePriceListPayload, UpdatePriceListPayload, PriceListOptionPrice } from '@/types/price-list';

export async function getPriceLists(): Promise<PriceList[]> {
  const response = await api.get('/api/v1/price-lists');
  return response.data.data;
}

export async function createPriceList(payload: CreatePriceListPayload): Promise<PriceList> {
  const response = await api.post('/api/v1/price-lists', payload);
  return response.data.data;
}

export async function updatePriceList(id: number, payload: UpdatePriceListPayload): Promise<PriceList> {
  const response = await api.post(`/api/v1/price-lists/${id}`, payload);
  return response.data.data;
}

export async function deletePriceList(id: number): Promise<void> {
  await api.delete(`/api/v1/price-lists/${id}`);
}

export async function getPriceListPrices(
  priceListId: number,
  companyId: number,
  characteristicOptionIds: number[]
): Promise<PriceListOptionPrice[]> {
  const response = await api.post('/api/v1/price-lists/prices', {
    price_list_id: priceListId,
    company_id: companyId,
    characteristic_option_ids: characteristicOptionIds,
  });
  return response.data.data;
}
