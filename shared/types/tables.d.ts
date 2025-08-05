export interface KktTableRow {
  id?: number | string;
  name?: number | string;
  registration_number?: number | string;
  start_meter_reading?: number | string;
  end_meter_reading?: number | string;
  amount_without_advance_with_nds?: number | string;
  amount_without_advance_nds?: number | string;
  advance_without_certificates_with_nds?: number | string;
  advance_without_certificates_nds?: number | string;
  file_ids: number[];
  files?: FileData[];
}

export interface CashTableRow {
  id?: number | string;
  name?: string;
  settlement_account_number?: string;
  amount_with_nds?: number | string;
  amount_nds?: number | string;
  file_ids: number[];
  files?: FileData[];
  isNew?: boolean;
}

export interface NonCashTableRow {
  id?: number | string;
  name?: string;
  amount_with_nds?: number | string;
  amount_nds?: number | string;
  file_ids: number[];
  files?: FileData[];
  isNew?: boolean;
}

export interface OverSumTableRow {
  id?: number | string;
  name?: string;
  amount_with_nds?: number | string;
  amount_nds?: number | string;
  file_ids: number[];
  files?: FileData[];
  isNew?: boolean;
}

export interface RefundsTableRow {
  id?: number | string;
  name?: string;
  registration_number?: string;
  returns_goods_services_with_nds?: number | string;
  returns_goods_services_nds?: number | string;
  gift_certificates_sold_with_nds?: number | string;
  gift_certificates_sold_nds?: number | string;
  file_ids: number[];
  files?: FileData[];
  isNew?: boolean;
}

export interface OtherAmountsTableRow {
  id?: number | string;
  name?: string;
  amount_with_nds?: number | string;
  amount_nds?: number | string;
  file_ids: number[];
  files?: FileData[];
  isNew?: boolean;
}

interface FileUploadResponse {
  id: number;
  name: string;
  url: string;
  mime_type: string;
  size: number;
  created_at: string;
  updated_at: string;
}

interface FileData {
  id: string;
  name: string;
  url?: string;
  mime_type?: string;
  size?: number;
  created_at?: string;
  updated_at?: string;
}
