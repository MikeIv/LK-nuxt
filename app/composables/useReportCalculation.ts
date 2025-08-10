import { useApi } from "~/composables/useApi";
import { useStepOneStore } from "~/stores/stepOne";

export const useReportCalculation = () => {
  const {
    callApi: loadReport,
    data: reportData,
    isLoading,
    error,
  } = useApi<UserData>();
  const stepOneStore = useStepOneStore();
  const tablesStore = useTablesStore();

  const hasChanges = ref(false);
  const baseComparisonValue = ref(0);
  const isSaving = ref(false);

  const rentPercentage = computed(() => {
    return reportData.value?.report.rent_percentage ?? 0;
  });

  const percentageWithVAT = computed(() => {
    return (
      ((tablesStore.totalWithVAT || 0) * (rentPercentage.value || 0)) / 100
    );
  });

  const percentageWithoutVAT = computed(() => {
    return (
      ((tablesStore.totalWithoutVAT || 0) * (rentPercentage.value || 0)) / 100
    );
  });

  const paymentWithVAT = computed(() => {
    return percentageWithVAT.value - baseComparisonValue.value;
  });

  const paymentWithoutVAT = computed(() => {
    return (percentageWithVAT.value - baseComparisonValue.value) * 1.2;
  });

  const formatCurrency = (value: number | string): string => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(isNaN(numValue) ? 0 : numValue);
  };

  const handleBaseInput = (event: Event) => {
    const input = event.target as HTMLInputElement;
    baseComparisonValue.value =
      parseFloat(input.value.replace(/[^\d.]/g, "")) || 0;
    hasChanges.value = true;
  };

  const formatBaseValue = () => {
    if (!isNaN(baseComparisonValue.value)) {
      baseComparisonValue.value = parseFloat(
        baseComparisonValue.value.toFixed(2),
      );
    }
  };

  const savingReport = async () => {
    isSaving.value = true;
    try {
      const reportData = {
        status: "Submitted",
        report: {
          visitors_count: stepOneStore.visitorsCount,
          receipts_count: stepOneStore.checksCount,
          comparison_base: baseComparisonValue.value,
          rent_percentage: rentPercentage.value,
          kkts: tablesStore.kkt.rows.map((row) => ({
            name: row.name,
            registration_number: row.registration_number,
            start_meter_reading: Number(row.start_meter_reading) || 0,
            end_meter_reading: Number(row.end_meter_reading) || 0,
            amount_without_advance_with_nds:
              Number(row.amount_without_advance_with_nds) || 0,
            amount_without_advance_nds:
              Number(row.amount_without_advance_nds) || 0,
            advance_without_certificates_with_nds:
              Number(row.advance_without_certificates_with_nds) || 0,
            advance_without_certificates_nds:
              Number(row.advance_without_certificates_nds) || 0,
            file_ids: row.file_ids || [],
          })),
          cash_turnovers_without_kkt: tablesStore.cashKkt.rows.map((row) => ({
            name: row.name,
            settlement_account_number: row.settlement_account_number,
            amount_with_nds: Number(row.amount_with_nds) || 0,
            amount_nds: Number(row.amount_nds) || 0,
            file_ids: row.file_ids || [],
          })),
          cash_turnovers_non_cash: tablesStore.nonCash.rows.map((row) => ({
            name: row.name,
            amount_with_nds: Number(row.amount_with_nds) || 0,
            amount_nds: Number(row.amount_nds) || 0,
            file_ids: row.file_ids || [],
          })),
          cash_turnovers_other: tablesStore.otherSum.rows.map((row) => ({
            name: row.name,
            amount_with_nds: Number(row.amount_with_nds) || 0,
            amount_nds: Number(row.amount_nds) || 0,
            file_ids: row.file_ids || [],
          })),
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
        console.log("Отчет успешно отправлен");
      }
    } catch (error) {
      console.error("Ошибка при отправке отчета:", error);
    } finally {
      isSaving.value = false;
    }
  };

  return {
    hasChanges,
    baseComparisonValue,
    isSaving,
    rentPercentage,
    percentageWithVAT,
    percentageWithoutVAT,
    paymentWithVAT,
    paymentWithoutVAT,
    formatCurrency,
    handleBaseInput,
    formatBaseValue,
    savingReport,
    loadReport,
    isLoading,
    error,
    reportData,
    tablesStore,
  };
};
