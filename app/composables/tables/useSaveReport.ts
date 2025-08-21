import type { TableData } from "~/composables/tables/useFormValidationStepTwo";

interface StepOneStore {
  visitorsCount: number;
  checksCount: number;
  dateRange: [Date | string | null, Date | string | null] | null;
  // добавьте другие свойства если есть
}

interface StepTwoStore {
  updateTable: (
    tableName: string,
    data: { rows: unknown[]; withVAT: number; VAT: number },
  ) => void;
  kkt: { rows: unknown[] };
  cashKkt: { rows: unknown[] };
  nonCash: { rows: unknown[] };
  otherSum: { rows: unknown[] };
}

interface SaveReportParams {
  kktTableRef: Ref<unknown>;
  cashKktTableRef: Ref<unknown>;
  nonCashTableRef: Ref<unknown>;
  otherSumTableRef: Ref<unknown>;
  stepOneStore: StepOneStore;
  stepTwoStore: StepTwoStore;
  loadReport: (url: string, options?: unknown) => Promise<unknown>;
}

export const useSaveReport = ({
  kktTableRef,
  cashKktTableRef,
  nonCashTableRef,
  otherSumTableRef,
  stepOneStore,
  stepTwoStore,
  loadReport,
}: SaveReportParams) => {
  const isSaving = ref(false);

  const getTableData = (ref: Ref<unknown>): TableData => {
    return (
      ref.value?.getTableData?.() || {
        rows: [],
        totals: { withVAT: 0, VAT: 0 },
      }
    );
  };

  const getSafeDate = (date: Date | string | null): string => {
    if (!date) return new Date().toISOString();

    try {
      const dateObj = new Date(date);
      return isNaN(dateObj.getTime())
        ? new Date().toISOString()
        : dateObj.toISOString();
    } catch {
      return new Date().toISOString();
    }
  };

  const saveReport = async (status: "Draft" | "Final") => {
    isSaving.value = true;
    try {
      const tablesData = {
        kkt: getTableData(kktTableRef),
        cashKkt: getTableData(cashKktTableRef),
        nonCash: getTableData(nonCashTableRef),
        otherSum: getTableData(otherSumTableRef),
      };

      // Безопасное получение дат
      const startDate = stepOneStore.dateRange?.[0]
        ? getSafeDate(stepOneStore.dateRange[0])
        : new Date().toISOString();

      const endDate = stepOneStore.dateRange?.[1]
        ? getSafeDate(stepOneStore.dateRange[1])
        : new Date().toISOString();

      const reportData = {
        status,
        report: {
          visitors_count: stepOneStore.visitorsCount || 0,
          receipts_count: stepOneStore.checksCount || 0,
          comparison_base: 0,
          rent_percentage: 0,
          kkts: tablesData.kkt.rows.map((row) => ({
            name: row.name || "",
            registration_number: row.registration_number || "",
            start_meter_reading: parseFloat(row.start_meter_reading) || 0,
            end_meter_reading: parseFloat(row.end_meter_reading) || 0,
            amount_without_advance_with_nds:
              parseFloat(row.amount_without_advance_with_nds) || 0,
            amount_without_advance_nds:
              parseFloat(row.amount_without_advance_nds) || 0,
            advance_without_certificates_with_nds:
              parseFloat(row.advance_without_certificates_with_nds) || 0,
            advance_without_certificates_nds:
              parseFloat(row.advance_without_certificates_nds) || 0,
            file_ids: row.file_ids || [],
          })),
          cash_turnovers_without_kkt: tablesData.cashKkt.rows.map((row) => ({
            name: row.name || "",
            settlement_account_number: row.settlement_account_number || "",
            amount_with_nds: parseFloat(row.amount_with_nds) || 0,
            amount_nds: parseFloat(row.amount_nds) || 0,
            file_ids: row.file_ids || [],
          })),
          cash_turnovers_non_cash: tablesData.nonCash.rows.map((row) => ({
            name: row.name || "",
            amount_with_nds: parseFloat(row.amount_with_nds) || 0,
            amount_nds: parseFloat(row.amount_nds) || 0,
            file_ids: row.file_ids || [],
          })),
          cash_turnovers_other: tablesData.otherSum.rows.map((row) => ({
            name: row.name || "",
            amount_with_nds: parseFloat(row.amount_with_nds) || 0,
            amount_nds: parseFloat(row.amount_nds) || 0,
            file_ids: row.file_ids || [],
          })),
          kkts_exclusions: [],
          cash_turnover_exclusions_other: [],
          period: {
            start: startDate,
            end: endDate,
          },
        },
      };

      const response = await loadReport("/tenants/reports", {
        method: "POST",
        body: reportData,
      });

      if (response) {
        console.log(
          `${status === "Draft" ? "Черновик" : "Отчет"} успешно сохранён`,
        );
        updateStores(tablesData);
        return true;
      }
      return false;
    } catch (error) {
      console.error(
        `Ошибка при сохранении ${status === "Draft" ? "черновика" : "отчета"}:`,
        error,
      );
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  const updateStores = (tablesData: Record<string, TableData>) => {
    if (stepTwoStore.updateTable) {
      stepTwoStore.updateTable("kkt", {
        rows: tablesData.kkt.rows || [],
        withVAT: tablesData.kkt.totals?.withVAT || 0,
        VAT: tablesData.kkt.totals?.VAT || 0,
      });
      stepTwoStore.updateTable("cashKkt", {
        rows: tablesData.cashKkt.rows || [],
        withVAT: tablesData.cashKkt.totals?.withVAT || 0,
        VAT: tablesData.cashKkt.totals?.VAT || 0,
      });
      stepTwoStore.updateTable("nonCash", {
        rows: tablesData.nonCash.rows || [],
        withVAT: tablesData.nonCash.totals?.withVAT || 0,
        VAT: tablesData.nonCash.totals?.VAT || 0,
      });
      stepTwoStore.updateTable("otherSum", {
        rows: tablesData.otherSum.rows || [],
        withVAT: tablesData.otherSum.totals?.withVAT || 0,
        VAT: tablesData.otherSum.totals?.VAT || 0,
      });
    }
  };

  return {
    isSaving,
    saveReport,
    updateStores,
  };
};
