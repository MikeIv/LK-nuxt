import type {
  CashTableRow,
  KktTableRow,
  NonCashTableRow,
  OtherAmountsTableRow,
  OverSumTableRow,
  RefundsTableRow,
} from "@/types/tables";

export interface Step1Data {
  dateRange: [Date, Date] | null;
  visitorsCount: number | null;
  checksCount: number | null;
  isValid: boolean;
}

// interface Step2Amounts {
//   totalSumm: number;
//   totalVAT: number;
//   totalWithoutVAT: number;
// }

export interface Step2Data {
  kktTableData: KktTableRow[];
  cashKktTableData: CashTableRow[];
  nonCashTableData: NonCashTableRow[];
  otherSumTableData: OverSumTableRow[];
  amountWithNds?: number;
  amountWithOutNds?: number;
  kktAmounts?: Step2Amounts;
  cashKktAmounts?: Step2Amounts;
  nonCashAmounts?: Step2Amounts;
  otherSumAmounts?: Step2Amounts;
  grandTotals?: Step2Amounts;
  isValid: boolean;
}

export interface Step3Amounts {
  totalSummRefunds?: number;
  totalVATRefunds?: number;
  totalSummOtherAmounts?: number;
  totalVATOtherAmounts?: number;
}

export interface Step3Data {
  refundsTableData: RefundsTableRow[];
  otherAmountsTableData: OtherAmountsTableRow[];
  amounts?: Step3Amounts;
  isValid: boolean;
}
