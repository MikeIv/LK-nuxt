import { defineStore } from "pinia";
import type {
  Step1Data,
  Step2Data,
  Step3Data,
  Step3Amounts,
} from "@/types/step-store";
import type {
  CashTableRow,
  KktTableRow,
  NonCashTableRow,
  OtherAmountsTableRow,
  OverSumTableRow,
  RefundsTableRow,
} from "@/types/tables";

export const useStepStore = defineStore("stepStore", {
  state: () => ({
    step1: {
      dateRange: null as [Date, Date] | null,
      visitorsCount: "" as number | string,
      checksCount: "" as number | string,
      isValid: false,
    } as Step1Data,

    step2: {
      kktTableData: [] as KktTableRow[],
      cashKktTableData: [] as CashTableRow[],
      nonCashTableData: [] as NonCashTableRow[],
      otherSumTableData: [] as OverSumTableRow[],
      addedKktRowsIndices: [] as number[],
      isValid: false,
    } as Step2Data,

    step3: {
      refundsTableData: [] as RefundsTableRow[],
      otherAmountsTableData: [] as OtherAmountsTableRow[],
      amounts: {
        totalSummRefunds: 0,
        totalVATRefunds: 0,
        totalSummOtherAmounts: 0,
        totalVATOtherAmounts: 0,
      } as Step3Amounts,
      isValid: false,
    } as Step3Data,

    currentStep: 1,
    isSubmitting: false,
    useApiDataOnly: false,
  }),

  actions: {
    updateStepData(
      step: number,
      data: Partial<Step1Data> | Partial<Step2Data>,
    ) {
      if (step === 1) {
        this.step1 = {
          ...this.step1,
          ...data,
          isValid: this.validateStep1(data as Partial<Step1Data>),
        };
      } else if (step === 2) {
        this.step2 = {
          ...this.step2,
          ...data,
          isValid: this.validateStep2(data as Partial<Step2Data>),
        };
      }
    },

    saveTablesData(data: {
      kktTableData: KktTableRow[];
      cashKktTableData: CashTableRow[];
      nonCashTableData: NonCashTableRow[];
      otherSumTableData: OverSumTableRow[];
    }) {
      // Полностью заменяем данные, а не мержим
      this.step2.kktTableData = data.kktTableData;
      this.step2.cashKktTableData = data.cashKktTableData;
      this.step2.nonCashTableData = data.nonCashTableData;
      this.step2.otherSumTableData = data.otherSumTableData;
      this.step2.isValid = this.validateStep2(data);
    },

    // Валидация шага 1
    validateStep1(data?: Partial<Step1Data>): boolean {
      const target = data || this.step1;
      return Boolean(
        target.dateRange &&
          !isNaN(Number(target.visitorsCount)) &&
          !isNaN(Number(target.checksCount)),
      );
    },

    // Валидация шага 2
    // validateStep2(data?: Partial<Step2Data>): boolean {
    //   // Здесь можно добавить проверку данных таблиц
    //   return true;
    // },

    setUseApiDataOnly(value: boolean) {
      this.useApiDataOnly = value;
      if (value) {
        this.step2.kktTableData = [];
        this.step2.cashKktTableData = [];
        this.step2.nonCashTableData = [];
        this.step2.otherSumTableData = [];
        this.step3.refundsTableData = [];
        this.step3.otherAmountsTableData = [];
      }
    },

    // updateStep3Data(data: Partial<Step3Data>) {
    //   this.step3 = {
    //     ...this.step3,
    //     ...data,
    //     amounts: {
    //       ...this.step3.amounts,
    //       ...(data.amounts || {}),
    //     },
    //     isValid: data.isValid !== undefined ? data.isValid : this.step3.isValid,
    //   };
    // },

    // Сохранение данных таблиц шага 3
    // saveStep3TablesData(data: {
    //   refundsTableData: RefundsTableRow[];
    //   otherAmountsTableData: OtherAmountsTableRow[];
    //   amounts?: Partial<Step3Amounts>;
    // }) {
    //   this.step3.refundsTableData = data.refundsTableData;
    //   this.step3.otherAmountsTableData = data.otherAmountsTableData;
    //
    //   if (data.amounts) {
    //     this.step3.amounts = {
    //       ...this.step3.amounts,
    //       ...data.amounts,
    //     };
    //   }
    //
    //   this.step3.isValid = this.validateStep3();
    // },

    // Валидация шага 3 (при необходимости можно добавить проверки)
    // validateStep3(data?: Partial<Step3Data>): boolean {
    //   return true;
    // },
  },
  persist: true,
});
