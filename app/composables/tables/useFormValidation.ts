export const useFormValidation = (
  tableRefs: Record<string, Ref<unknown>>,
  stepType: "stepTwo" | "stepThree",
) => {
  const validateForm = () => {
    const tablesData: Record<string, unknown> = {};

    // Получаем данные из всех таблиц
    for (const [tableName, tableRef] of Object.entries(tableRefs)) {
      tablesData[tableName] = tableRef.value?.getTableData?.() || { rows: [] };
    }

    if (stepType === "stepTwo") {
      // Валидация для stepTwo
      for (const [tableName, tableData] of Object.entries(tablesData)) {
        for (const [index, row] of tableData.rows.entries()) {
          if (!row.name?.trim()) {
            return {
              isValid: false,
              error: `В таблице ${getTableName(tableName)} (строка ${index + 1}): не заполнено поле "Наименование"`,
            };
          }

          if (tableName === "kkt" && !row.registration_number?.trim()) {
            return {
              isValid: false,
              error: `В таблице ККТ (строка ${index + 1}): не заполнено поле "Регистрационный номер"`,
            };
          }

          if (
            tableName === "cashKkt" &&
            !row.settlement_account_number?.trim()
          ) {
            return {
              isValid: false,
              error: `В таблице безналичных расчетов (строка ${index + 1}): не заполнено поле "Расчетный счет"`,
            };
          }
        }
      }
    } else if (stepType === "stepThree") {
      // Валидация для stepThree
      for (const [index, row] of tablesData.refunds?.rows.entries() || []) {
        if (!row.name?.trim()) {
          return {
            isValid: false,
            error: `В таблице возвратов (строка ${index + 1}): не заполнено поле "Наименование"`,
          };
        }
        if (!row.registration_number?.trim()) {
          return {
            isValid: false,
            error: `В таблице возвратов (строка ${index + 1}): не заполнено поле "Регистрационный номер"`,
          };
        }
      }

      for (const [index, row] of tablesData.otherAmounts?.rows.entries() ||
        []) {
        if (!row.name?.trim()) {
          return {
            isValid: false,
            error: `В таблице иных сумм (строка ${index + 1}): не заполнено поле "Наименование"`,
          };
        }
      }
    }

    return { isValid: true, error: "" };
  };

  const getTableName = (tableKey: string): string => {
    const tableNames: Record<string, string> = {
      kkt: "ККТ",
      cashKkt: "безналичных расчетов",
      nonCash: "неденежных форм расчетов",
      otherSum: "иных сумм",
      refunds: "возвратов",
      otherAmounts: "иных сумм исключений",
    };
    return tableNames[tableKey] || tableKey;
  };

  return { validateForm };
};
