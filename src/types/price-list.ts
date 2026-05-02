export interface PriceListItem {
  id: number;
  price_list_id: number;
  machine_id: number | null;
  article_id: number | null;
  unit_price: number;
  currency_id: number;
  currency_code?: string | null;
  currency_symbol?: string | null;
}

export interface PriceList {
  id: number;
  list_number: string;
  name: string;
  valid_from: string;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
  companies?: { id: number; name: string }[];
  items?: PriceListItem[];
}

export interface CreatePriceListItemPayload {
  machine_id?: number;
  article_id?: number;
  unit_price: number;
  currency_id: number;
}

export interface PriceListOptionPrice {
  characteristic_option_id: number;
  unit_price: number | null;
  currency_code?: string;
  currency_symbol?: string;
}

export interface CreatePriceListPayload {
  list_number: string;
  name: string;
  valid_from: string;
  valid_until?: string;
  company_ids?: number[];
  items?: CreatePriceListItemPayload[];
}

export interface UpdatePriceListItemPayload {
  characteristic_option_id?: number;
  article_id?: number;
  unit_price: number;
  currency_id: number;
}

export interface UpdatePriceListPayload {
  list_number: string;
  name: string;
  valid_from: string;
  valid_until?: string;
  company_ids?: number[];
  items?: UpdatePriceListItemPayload[];
}
