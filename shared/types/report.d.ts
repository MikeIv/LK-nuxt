interface Kkt {
  name: string;
  registration_number: string;
  start_meter_reading: number;
  end_meter_reading: number;
  amount_without_advance_with_nds: number;
  amount_without_advance_nds: number;
  advance_without_certificates_with_nds: number;
  advance_without_certificates_nds: number;
  file_id: number;
}

interface CashTurnoverWithoutKkt {
  name: string;
  settlement_account_number: string;
  amount_with_nds: number;
  amount_nds: number;
}

interface CashTurnoverNonCash {
  name: string;
  amount_with_nds: number;
  amount_nds: number;
  file_id: number;
}

interface CashTurnoverOther {
  name: string;
  amount_with_nds: number;
  amount_nds: number;
  file_id: number;
}

interface KktExclusion {
  name: string;
  registration_number: string;
  returns_goods_services_with_nds: number;
  returns_goods_services_nds: number;
  gift_certificates_sold_with_nds: number;
  gift_certificates_sold_nds: number;
  file_id: number;
}

interface CashTurnoverExclusionOther {
  name: string;
  amount_with_nds: number;
  amount_nds: number;
  file_id: number;
}

interface Period {
  start: string;
  end: string;
}

interface Report {
  visitors_count: number;
  receipts_count: number;
  comparison_base: number;
  rent_percentage: number;
  kkts: Kkt[];
  cash_turnovers_without_kkt: CashTurnoverWithoutKkt[];
  cash_turnovers_non_cash: CashTurnoverNonCash[];
  cash_turnovers_other: CashTurnoverOther[];
  kkts_exclusions: KktExclusion[];
  cash_turnover_exclusions_other: CashTurnoverExclusionOther[];
  period: Period;
}

export interface ReportPayload {
  status: "Draft" | "Submitted";
  report: Report;
}

export interface SaveReportResponse {
  success: boolean;
  message?: string;
  reportId?: number;
}
