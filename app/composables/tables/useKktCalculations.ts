import type { KktTableRow } from "~/types/tables";

export function useKktCalculations(rows: Ref<KktTableRow[]>) {
  const calculateWithNds = (row: KktTableRow): number => {
    const end =
      typeof row.end_meter_reading === "string"
        ? parseFloat(row.end_meter_reading.replace(",", ".")) || 0
        : Number(row.end_meter_reading) || 0;

    const start =
      typeof row.start_meter_reading === "string"
        ? parseFloat(row.start_meter_reading.replace(",", ".")) || 0
        : Number(row.start_meter_reading) || 0;

    return end - start;
  };

  const totalWithVAT = computed<number>(() => {
    return rows.value.reduce((sum, row) => {
      const meterDifference = calculateWithNds(row);
      const advanceWithNds =
        typeof row.advance_without_certificates_with_nds === "string"
          ? Number(
              row.advance_without_certificates_with_nds.replace(",", "."),
            ) || 0
          : Number(row.advance_without_certificates_with_nds) || 0;
      return sum + meterDifference + advanceWithNds;
    }, 0);
  });

  const totalVAT = computed<number>(() => {
    const sum = rows.value.reduce((sum, row) => {
      const amountNds =
        typeof row.amount_without_advance_nds === "string"
          ? Number(row.amount_without_advance_nds.replace(",", ".")) || 0
          : Number(row.amount_without_advance_nds) || 0;

      const advanceNds =
        typeof row.advance_without_certificates_nds === "string"
          ? Number(row.advance_without_certificates_nds.replace(",", ".")) || 0
          : Number(row.advance_without_certificates_nds) || 0;

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
