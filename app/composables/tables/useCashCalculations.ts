export const useCashCalculations = (rows: Ref<CashTableRow[]>) => {
  const totalWithVAT = computed(() => {
    return rows.value.reduce((sum, row) => {
      return sum + parseFloat(row.amount_with_nds || "0");
    }, 0);
  });

  const totalVAT = computed(() => {
    return rows.value.reduce((sum, row) => {
      return sum + parseFloat(row.amount_nds || "0");
    }, 0);
  });

  return { totalWithVAT, totalVAT };
};
