import type { TableData } from "~/composables/tables/useFormValidationStepTwo";

interface SaveReportParams {
  kktTableRef: Ref<unknown>;
  cashKktTableRef: Ref<unknown>;
  nonCashTableRef: Ref<unknown>;
  otherSumTableRef: Ref<unknown>;
  stepOneStore: unknown;
  stepTwoStore: unknown;
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

  const getTableData = (ref: Ref<unknown>): TableData =>
    ref.value?.getTableData?.() || { rows: [], totals: { withVAT: 0, VAT: 0 } };

  const saveReport = async (status: "Draft" | "Final") => {
    isSaving.value = true;
    try {
      const tablesData = {
        kkt: getTableData(kktTableRef),
        cashKkt: getTableData(cashKktTableRef),
        nonCash: getTableData(nonCashTableRef),
        otherSum: getTableData(otherSumTableRef),
      };

      const reportData = {
        status,
        report: {
          visitors_count: stepOneStore.visitorsCount,
          receipts_count: stepOneStore.checksCount,
          comparison_base: 0,
          rent_percentage: 0,
          kkts: tablesData.kkt.rows.map((row) => ({
            name: row.name,
            registration_number: row.registration_number,
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
            name: row.name,
            settlement_account_number: row.settlement_account_number || "",
            amount_with_nds: parseFloat(row.amount_with_nds) || 0,
            amount_nds: parseFloat(row.amount_nds) || 0,
            file_ids: row.file_ids || [],
          })),
          cash_turnovers_non_cash: tablesData.nonCash.rows.map((row) => ({
            name: row.name,
            amount_with_nds: parseFloat(row.amount_with_nds) || 0,
            amount_nds: parseFloat(row.amount_nds) || 0,
            file_ids: row.file_ids || [],
          })),
          cash_turnovers_other: tablesData.otherSum.rows.map((row) => ({
            name: row.name,
            amount_with_nds: parseFloat(row.amount_with_nds) || 0,
            amount_nds: parseFloat(row.amount_nds) || 0,
            file_ids: row.file_ids || [],
          })),
          kkts_exclusions: [],
          cash_turnover_exclusions_other: [],
          period: {
            start: new Date(stepOneStore.dateRange[0]).toISOString(),
            end: new Date(stepOneStore.dateRange[1]).toISOString(),
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
    stepTwoStore.updateTable("kkt", {
      rows: tablesData.kkt.rows,
      withVAT: tablesData.kkt.totals.withVAT,
      VAT: tablesData.kkt.totals.VAT,
    });
    stepTwoStore.updateTable("cashKkt", {
      rows: tablesData.cashKkt.rows,
      withVAT: tablesData.cashKkt.totals.withVAT,
      VAT: tablesData.cashKkt.totals.VAT,
    });
    stepTwoStore.updateTable("nonCash", {
      rows: tablesData.nonCash.rows,
      withVAT: tablesData.nonCash.totals.withVAT,
      VAT: tablesData.nonCash.totals.VAT,
    });
    stepTwoStore.updateTable("otherSum", {
      rows: tablesData.otherSum.rows,
      withVAT: tablesData.otherSum.totals.withVAT,
      VAT: tablesData.otherSum.totals.VAT,
    });
  };

  return {
    isSaving,
    saveReport,
    updateStores,
  };
};
