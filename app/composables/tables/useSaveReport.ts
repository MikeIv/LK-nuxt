// app/composables/tables/useSaveReport.ts
import type { TableData } from "~/composables/tables/useFormValidationStepTwo";

interface StepOneStore {
  visitorsCount: number;
  checksCount: number;
  dateRange: [Date | string | null, Date | string | null] | null;
}

interface StepTwoStore {
  kkt: { rows: unknown[]; withVAT: number; VAT: number };
  cashKkt: { rows: unknown[]; withVAT: number; VAT: number };
  nonCash: { rows: unknown[]; withVAT: number; VAT: number };
  otherSum: { rows: unknown[]; withVAT: number; VAT: number };
}

interface StoreWithUpdate {
  updateTable: (
    tableName: string,
    data: { rows: unknown[]; withVAT: number; VAT: number },
  ) => void;
}

interface SaveReportParams {
  tableRefs: Record<string, Ref<unknown>>;
  stepOneStore: StepOneStore;
  stepTwoStore: StepTwoStore;
  store: StoreWithUpdate;
  loadReport: (url: string, options?: unknown) => Promise<unknown>;
  stepType: "stepTwo" | "stepThree";
}

export const useSaveReport = ({
  tableRefs,
  stepOneStore,
  stepTwoStore,
  store,
  loadReport,
  stepType,
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
      const tablesData: Record<string, TableData> = {};

      // Получаем данные из всех переданных таблиц
      for (const [tableName, tableRef] of Object.entries(tableRefs)) {
        tablesData[tableName] = getTableData(tableRef);
      }

      const startDate = stepOneStore.dateRange?.[0]
        ? getSafeDate(stepOneStore.dateRange[0])
        : new Date().toISOString();

      const endDate = stepOneStore.dateRange?.[1]
        ? getSafeDate(stepOneStore.dateRange[1])
        : new Date().toISOString();

      // Базовая структура отчета
      const reportData: unknown = {
        status,
        report: {
          visitors_count: stepOneStore.visitorsCount || 0,
          receipts_count: stepOneStore.checksCount || 0,
          period: {
            start: startDate,
            end: endDate,
          },
        },
      };

      // Добавляем данные из второго шага (если есть)
      if (stepTwoStore) {
        reportData.report = {
          ...reportData.report,
          comparison_base: 0,
          rent_percentage: 0,
          kkts:
            stepTwoStore.kkt?.rows.map((row: unknown) => ({
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
            })) || [],
          cash_turnovers_without_kkt:
            stepTwoStore.cashKkt?.rows.map((row: unknown) => ({
              name: row.name || "",
              settlement_account_number: row.settlement_account_number || "",
              amount_with_nds: parseFloat(row.amount_with_nds) || 0,
              amount_nds: parseFloat(row.amount_nds) || 0,
              file_ids: row.file_ids || [],
            })) || [],
          cash_turnovers_non_cash:
            stepTwoStore.nonCash?.rows.map((row: unknown) => ({
              name: row.name || "",
              amount_with_nds: parseFloat(row.amount_with_nds) || 0,
              amount_nds: parseFloat(row.amount_nds) || 0,
              file_ids: row.file_ids || [],
            })) || [],
          cash_turnovers_other:
            stepTwoStore.otherSum?.rows.map((row: unknown) => ({
              name: row.name || "",
              amount_with_nds: parseFloat(row.amount_with_nds) || 0,
              amount_nds: parseFloat(row.amount_nds) || 0,
              file_ids: row.file_ids || [],
            })) || [],
        };
      }

      // Добавляем данные третьего шага
      if (stepType === "stepThree") {
        reportData.report = {
          ...reportData.report,
          kkts_exclusions:
            tablesData.refunds?.rows.map((row: unknown) => ({
              name: row.name || "",
              registration_number: row.registration_number || "",
              returns_goods_services_with_nds:
                parseFloat(row.returns_goods_services_with_nds) || 0,
              returns_goods_services_nds:
                parseFloat(row.returns_goods_services_nds) || 0,
              gift_certificates_sold_with_nds:
                parseFloat(row.gift_certificates_sold_with_nds) || 0,
              gift_certificates_sold_nds:
                parseFloat(row.gift_certificates_sold_nds) || 0,
              file_id: row.file_id || null,
            })) || [],
          cash_turnover_exclusions_other:
            tablesData.otherAmounts?.rows.map((row: unknown) => ({
              name: row.name || "",
              amount_with_nds: parseFloat(row.amount_with_nds) || 0,
              amount_nds: parseFloat(row.amount_nds) || 0,
              file_id: row.file_id || null,
            })) || [],
        };
      }

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
    if (store.updateTable) {
      for (const [tableName, tableData] of Object.entries(tablesData)) {
        store.updateTable(tableName, {
          rows: tableData.rows || [],
          withVAT: tableData.totals?.withVAT || 0,
          VAT: tableData.totals?.VAT || 0,
        });
      }
    }
  };

  return {
    isSaving,
    saveReport,
    updateStores,
  };
};
