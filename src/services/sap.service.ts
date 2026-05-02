import api from './api';

export interface SapCustomer {
  CardCode: string;
  CardName: string;
}

export async function getSapCustomers(companyId: number): Promise<SapCustomer[]> {
  const response = await api.get('/api/v1/sap/customers', { params: { companyId } });
  return response.data.data;
}

export interface SapItem {
  ItemCode: string;
  ItemName: string;
}

export async function getSapItems(companyId: number): Promise<SapItem[]> {
  const response = await api.get('/api/v1/sap/items', { params: { companyId } });
  return response.data.data;
}
