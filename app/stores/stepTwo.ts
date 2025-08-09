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

  actions: {
    /**
     * Сохраняет данные таблицы ККТ
     */
    saveKktData(rows: KktTableRow[], totals: TableTotals) {
      this.kkt = {
        rows: [...rows],
        totals: { ...totals },
      };
    },

    /**
     * Сохраняет данные таблицы CashKkt
     */
    saveCashKktData(rows: CashTableRow[], totals: TableTotals) {
      this.cashKkt = {
        rows: [...rows],
        totals: { ...totals },
      };
    },

    /**
     * Сохраняет данные таблицы NonCash
     */
    saveNonCashData(rows: NonCashTableRow[], totals: TableTotals) {
      this.nonCash = {
        rows: [...rows],
        totals: { ...totals },
      };
    },

    /**
     * Сохраняет данные таблицы OtherSum
     */
    saveOtherSumData(rows: OtherSumTableRow[], totals: TableTotals) {
      this.otherSum = {
        rows: [...rows],
        totals: { ...totals },
      };
    },

    /**
     * Сохраняет данные всех таблиц сразу
     */
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

    /**
     * Получает данные таблицы ККТ
     */
    getKktData(): TableData<KktTableRow> {
      return {
        rows: [...this.kkt.rows],
        totals: { ...this.kkt.totals },
      };
    },

    /**
     * Получает данные таблицы CashKkt
     */
    getCashKktData(): TableData<CashTableRow> {
      return {
        rows: [...this.cashKkt.rows],
        totals: { ...this.cashKkt.totals },
      };
    },

    /**
     * Получает данные таблицы NonCash
     */
    getNonCashData(): TableData<NonCashTableRow> {
      return {
        rows: [...this.nonCash.rows],
        totals: { ...this.nonCash.totals },
      };
    },

    /**
     * Получает данные таблицы OtherSum
     */
    getOtherSumData(): TableData<OtherSumTableRow> {
      return {
        rows: [...this.otherSum.rows],
        totals: { ...this.otherSum.totals },
      };
    },

    /**
     * Получает данные всех таблиц
     */
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
