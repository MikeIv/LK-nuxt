export interface UserContract {
  id: number;
  name: string;
}

export interface UserData {
  id: number;
  tenant_name: string;
  brand: string;
  room_number: string;
  contract_number: string;
  contract_type: string;
  contract_date: string;
  kkts: string[];
  debt: string;
  contracts: UserContract[];
}

export interface UserApiResponse {
  success: boolean;
  message: string;
  payload: UserData;
}
