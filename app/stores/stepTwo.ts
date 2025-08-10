import { defineStore } from "pinia";
import type {
  KktTableRow,
  CashTableRow,
  NonCashTableRow,
  OtherSumTableRow,
} from "~/types/tables";

interface TableTotals {
  withVAT: number;
  VAT: number;
}

interface TableData<T> {
  rows: T[];
  totals: TableTotals;
}

interface TablesState {
  kkt: TableData<KktTableRow>;
  cashKkt: TableData<CashTableRow>;
  nonCash: TableData<NonCashTableRow>;
  otherSum: TableData<OtherSumTableRow>;
}

export const useTablesStore = defineStore("tables", {
  state: (): TablesState => ({
    kkt: {
      rows: [],
      totals: { withVAT: 0, VAT: 0 },
    },
    cashKkt: {
      rows: [],
      totals: { withVAT: 0, VAT: 0 },
    },
    nonCash: {
      rows: [],
      totals: { withVAT: 0, VAT: 0 },
    },
    otherSum: {
      rows: [],
      totals: { withVAT: 0, VAT: 0 },
    },
  }),

  getters: {
    totalWithVAT(): number {
      return (
        this.kkt.totals.withVAT +
        this.cashKkt.totals.withVAT +
        this.nonCash.totals.withVAT +
        this.otherSum.totals.withVAT
      );
    },

    totalVAT(): number {
      return (
        this.kkt.totals.VAT +
        this.cashKkt.totals.VAT +
        this.nonCash.totals.VAT +
        this.otherSum.totals.VAT
      );
    },

    totalWithoutVAT(): number {
      return this.totalWithVAT - this.totalVAT;
    },
  },

  actions: {
    reset() {
      this.kkt = {
        rows: [],
        totals: { withVAT: 0, VAT: 0 },
      };
      this.cashKkt = {
        rows: [],
        totals: { withVAT: 0, VAT: 0 },
      };
      this.nonCash = {
        rows: [],
        totals: { withVAT: 0, VAT: 0 },
      };
      this.otherSum = {
        rows: [],
        totals: { withVAT: 0, VAT: 0 },
      };
    },

    saveKktData(rows: KktTableRow[], totals: TableTotals) {
      this.kkt = {
        rows: [...rows],
        totals: { ...totals },
      };
    },

    saveCashKktData(rows: CashTableRow[], totals: TableTotals) {
      this.cashKkt = {
        rows: [...rows],
        totals: { ...totals },
      };
    },

    saveNonCashData(rows: NonCashTableRow[], totals: TableTotals) {
      this.nonCash = {
        rows: [...rows],
        totals: { ...totals },
      };
    },

    saveOtherSumData(rows: OtherSumTableRow[], totals: TableTotals) {
      this.otherSum = {
        rows: [...rows],
        totals: { ...totals },
      };
    },

    saveAllTables(data: {
      kkt: { rows: KktTableRow[]; totals: TableTotals };
      cashKkt: { rows: CashTableRow[]; totals: TableTotals };
      nonCash: { rows: NonCashTableRow[]; totals: TableTotals };
      otherSum: { rows: OtherSumTableRow[]; totals: TableTotals };
    }) {
      this.saveKktData(data.kkt.rows, data.kkt.totals);
      this.saveCashKktData(data.cashKkt.rows, data.cashKkt.totals);
      this.saveNonCashData(data.nonCash.rows, data.nonCash.totals);
      this.saveOtherSumData(data.otherSum.rows, data.otherSum.totals);
    },

    getKktData(): TableData<KktTableRow> {
      return {
        rows: [...this.kkt.rows],
        totals: { ...this.kkt.totals },
      };
    },

    getCashKktData(): TableData<CashTableRow> {
      return {
        rows: [...this.cashKkt.rows],
        totals: { ...this.cashKkt.totals },
      };
    },

    getNonCashData(): TableData<NonCashTableRow> {
      return {
        rows: [...this.nonCash.rows],
        totals: { ...this.nonCash.totals },
      };
    },

    getOtherSumData(): TableData<OtherSumTableRow> {
      return {
        rows: [...this.otherSum.rows],
        totals: { ...this.otherSum.totals },
      };
    },

    getAllTablesData() {
      return {
        kkt: this.getKktData(),
        cashKkt: this.getCashKktData(),
        nonCash: this.getNonCashData(),
        otherSum: this.getOtherSumData(),
      };
    },
  },

  persist: {
    key: "tables-storage",
    paths: ["kkt", "cashKkt", "nonCash", "otherSum"],
  },
});
