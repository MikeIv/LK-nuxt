export interface TableData {
  rows: unknown[];
  totals: {
    withVAT: number;
    VAT: number;
  };
}

export interface ValidationResult {
  isValid: boolean;
  error: string;
}

export const useFormValidation = (
  kktTableRef: Ref<unknown>,
  cashKktTableRef: Ref<unknown>,
  nonCashTableRef: Ref<unknown>,
  otherSumTableRef: Ref<unknown>,
) => {
  const validateForm = (): ValidationResult => {
    const getTableData = (ref: Ref<unknown>): TableData =>
      ref.value?.getTableData?.() || {
        rows: [],
        totals: { withVAT: 0, VAT: 0 },
      };

    const tablesData = {
      kkt: getTableData(kktTableRef),
      cashKkt: getTableData(cashKktTableRef),
      nonCash: getTableData(nonCashTableRef),
      otherSum: getTableData(otherSumTableRef),
    };

    if (tablesData.kkt.rows.length === 0) {
      return { isValid: false, error: "Таблица ККТ не может быть пустой" };
    }

    const kktInvalid = tablesData.kkt.rows.some(
      (row) =>
        !row.registration_number ||
        row.registration_number.length !== 16 ||
        isNaN(parseFloat(row.start_meter_reading)) ||
        isNaN(parseFloat(row.end_meter_reading)) ||
        (row.file_ids?.length ?? 0) === 0,
    );

    if (kktInvalid) {
      return {
        isValid: false,
        error: "Заполните все обязательные поля в таблице ККТ",
      };
    }

    const validateNonEmptyTable = (
      table: TableData,
      tableName: string,
    ): string | null => {
      if (table.rows.length > 0) {
        const invalidRow = table.rows.find(
          (row) =>
            // !row.name ||
            isNaN(parseFloat(row.amount_with_nds)) ||
            isNaN(parseFloat(row.amount_nds)),
          // (row.file_ids?.length ?? 0) === 0,
        );

        return invalidRow
          ? `Заполните все обязательные поля в таблице ${tableName}`
          : null;
      }
      return null;
    };

    const cashKktError = validateNonEmptyTable(tablesData.cashKkt, "2.2");
    const nonCashError = validateNonEmptyTable(tablesData.nonCash, "2.3");
    const otherSumError = validateNonEmptyTable(tablesData.otherSum, "2.4");

    return {
      isValid: !cashKktError && !nonCashError && !otherSumError,
      error: cashKktError || nonCashError || otherSumError || "",
    };
  };

  return {
    validateForm,
  };
};
