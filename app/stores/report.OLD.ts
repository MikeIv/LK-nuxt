import { defineStore } from "pinia";

export interface BlockData {
  amountWithoutKkt: number | string;
  vatAmountWithoutKkt: number | string;
  amountNonCash: number | string;
  vatAmountNonCash: number | string;
  id: number;
  title: string;
  isEditingTitle: boolean;
  isCustom: boolean;
}

interface FormData {
  signDate: Date | string | null;
  dateRange: [Date, Date] | null;
  visitorsCount: number | string;
  checksCount: number | string;
  totalWithVAT: number | string;
  totalVAT: number | string;
  amountWithoutKkt: number | string;
  vatAmountWithoutKkt: number | string;
  amountNonCash: number | string;
  vatAmountNonCash: number | string;
  CashierRegNumber: number | string;
  kktData: KktRow[];
  totalReturns: number | string;
  comparisonBase: number | string;
  currentReportId: number | string;
  blocksWithoutKkt: BlockData[];
  blocksNonCash: BlockData[];
}

interface KktRow {
  id?: number | string;
  name?: number | string;
  registration_number?: number | string;
  start_meter_reading?: number | string;
  end_meter_reading?: number | string;
  refund_amount?: number | string;
  revenue_with_vat?: number | string;
  vat?: number | string;
}

export const useReportStore = defineStore("report", {
  state: (): FormData => ({
    signDate: null,
    dateRange: null,
    visitorsCount: "",
    checksCount: "",
    totalWithVAT: "",
    totalVAT: "",
    amountWithoutKkt: "",
    vatAmountWithoutKkt: "",
    amountNonCash: "",
    vatAmountNonCash: "",
    CashierRegNumber: "",
    kktData: [],
    totalReturns: "",
    comparisonBase: "",
    currentReportId: "",
    blocksWithoutKkt: [],
    blocksNonCash: [],
  }),
  actions: {
    saveSignDate(date: Date | string | null) {
      this.signDate = date;
    },
    saveFormData(data: Partial<FormData>) {
      Object.assign(this, data);
    },
    saveTotalWithVAT(value: number | string) {
      this.totalWithVAT = value;
    },
    saveTotalVAT(value: number | string) {
      this.totalVAT = value;
    },
    saveCurrentReportId(id: number | string) {
      this.currentReportId = id;
    },
    clearFormData() {
      this.$reset();
    },
  },
  persist: true,
});
