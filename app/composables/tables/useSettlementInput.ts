export const useSettlementInput = <
  T extends { settlement_account_number: string | null },
>(
  editableRows: Ref<T[]>,
  validateCallback?: (index: number) => void,
) => {
  const handleSettlementInput = (event: Event, index: number) => {
    const target = event.target as HTMLInputElement;
    editableRows.value[index].settlement_account_number = target.value || null;
    validateCallback?.(index);
  };

  const handleSettlementBlur = (index: number) => {
    if (editableRows.value[index].settlement_account_number === null) {
      editableRows.value[index].settlement_account_number = "";
    }
    validateCallback?.(index);
  };

  return {
    handleSettlementInput,
    handleSettlementBlur,
  };
};
