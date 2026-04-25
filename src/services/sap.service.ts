import api from './api';

export interface SapCustomer {
  CardCode: string;
  CardName: string;
}

export async function getSapCustomers(companyId: number): Promise<SapCustomer[]> {
  const response = await api.get('/api/v1/sap/customers', { params: { companyId } });
  return response.data.data;
}
