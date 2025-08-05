import type {
  CashTableRow,
  KktTableRow,
  NonCashTableRow,
  OverSumTableRow,
} from "@/types/tables";

export interface Step1Data {
  dateRange: [Date, Date] | null;
  visitorsCount: number | null;
  checksCount: number | null;
  isValid: boolean;
}
export interface Step2Data {
  kktTableData: KktTableRow[];
  cashKktTableData: CashTableRow[];
  nonCashTableData: NonCashTableRow[];
  otherSumTableData: OverSumTableRow[];
  amountWithNds?: number;
  amountWithOutNds?: number;
  isValid: boolean;
}
