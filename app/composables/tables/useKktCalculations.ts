import type { KktTableRow } from "~/types/tables";
import { computed } from "vue";

export function useKktCalculations(rows: Ref<KktTableRow[]>) {
  const calculateWithNds = (row: KktTableRow): number => {
    const end = parseFloat(row.end_meter_reading?.replace(",", ".")) || 0;
    const start = parseFloat(row.start_meter_reading?.replace(",", ".")) || 0;
    return end - start;
  };

  const totalWithVAT = computed<number>(() => {
    return rows.value.reduce((sum, row) => {
      const meterDifference = calculateWithNds(row);
      const advanceWithNds = Number(
        row.advance_without_certificates_with_nds?.replace(",", ".") || 0,
      );
      return sum + meterDifference + advanceWithNds;
    }, 0);
  });

  const totalVAT = computed<number>(() => {
    const sum = rows.value.reduce((sum, row) => {
      const amountNds = Number(
        row.amount_without_advance_nds?.replace(",", ".") || 0,
      );
      const advanceNds = Number(
        row.advance_without_certificates_nds?.replace(",", ".") || 0,
      );
      return sum + amountNds + advanceNds;
    }, 0);
    return parseFloat(sum.toFixed(2));
  });

  return {
    calculateWithNds,
    totalWithVAT,
    totalVAT,
  };
}
