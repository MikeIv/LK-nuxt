import { defineStore } from "pinia";
import type { RefundsTableRow, OtherAmountsTableRow } from "~/types/tables";

interface TableTotals {
  withVAT: number;
  VAT: number;
}

interface TableData<T> {
  rows: T[];
  totals: TableTotals;
}

interface TablesState {
  refunds: TableData<RefundsTableRow>;
  otherAmounts: TableData<OtherAmountsTableRow>;
}

export const useStepThreeStore = defineStore("stepThree", {
  state: (): TablesState => ({
    refunds: {
      rows: [],
      totals: { withVAT: 0, VAT: 0 },
    },
    otherAmounts: {
      rows: [],
      totals: { withVAT: 0, VAT: 0 },
    },
  }),

  getters: {
    totalWithVAT(): number {
      return this.refunds.totals.withVAT + this.otherAmounts.totals.withVAT;
    },

    totalVAT(): number {
      return this.refunds.totals.VAT + this.otherAmounts.totals.VAT;
    },

    totalWithoutVAT(): number {
      return this.totalWithVAT - this.totalVAT;
    },
  },

  actions: {
    reset() {
      this.refunds = {
        rows: [],
        totals: { withVAT: 0, VAT: 0 },
      };
      this.otherAmounts = {
        rows: [],
        totals: { withVAT: 0, VAT: 0 },
      };
    },

    saveRefundsData(rows: RefundsTableRow[], totals: TableTotals) {
      this.refunds = {
        rows: [...rows],
        totals: { ...totals },
      };
    },

    saveOtherAmountsData(rows: OtherAmountsTableRow[], totals: TableTotals) {
      this.otherAmounts = {
        rows: [...rows],
        totals: { ...totals },
      };
    },

    saveAllTables(data: {
      refunds: { rows: RefundsTableRow[]; totals: TableTotals };
      otherAmounts: { rows: OtherAmountsTableRow[]; totals: TableTotals };
    }) {
      this.saveRefundsData(data.refunds.rows, data.refunds.totals);
      this.saveOtherAmountsData(
        data.otherAmounts.rows,
        data.otherAmounts.totals,
      );
    },

    getRefundsData(): TableData<RefundsTableRow> {
      return {
        rows: [...this.refunds.rows],
        totals: { ...this.refunds.totals },
      };
    },

    getOtherAmountsData(): TableData<OtherAmountsTableRow> {
      return {
        rows: [...this.otherAmounts.rows],
        totals: { ...this.otherAmounts.totals },
      };
    },

    getAllTablesData() {
      return {
        refunds: this.getRefundsData(),
        otherAmounts: this.getOtherAmountsData(),
      };
    },
  },

  persist: {
    key: "step-three-storage",
    paths: ["refunds", "otherAmounts"],
  },
});
