type NumericField<T> = {
  [K in keyof T]: T[K] extends number | string ? K : never;
}[keyof T];

export const useNumberInput = <T extends Record<string, unknown>>(
  editableRows: Ref<T[]>,
) => {
  const handleKeyPress = (event: KeyboardEvent) => {
    const allowedKeys = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      ".",
      ",",
    ];
    const isCtrlPressed = event.ctrlKey || event.metaKey;

    if (!allowedKeys.includes(event.key) && !isCtrlPressed) {
      event.preventDefault();
    }

    const input = event.target as HTMLInputElement;
    const currentValue = input.value;
    if (
      (event.key === "." || event.key === ",") &&
      (currentValue.includes(".") || currentValue.includes(","))
    ) {
      event.preventDefault();
    }
  };

  const handleNumberInput = (
    event: Event,
    field: NumericField<T>,
    index: number,
  ) => {
    const target = event.target as HTMLInputElement;
    const cursorPosition = target.selectionStart;
    let value = target.value;

    value = value.replace(/[^\d.,]/g, "");

    value = value.replace(/\./g, ",");

    const commaIndex = value.indexOf(",");
    if (commaIndex !== -1) {
      value =
        value.substring(0, commaIndex + 1) +
        value.substring(commaIndex + 1).replace(/,/g, "");
    }

    if (value.startsWith(",")) value = "0" + value;

    const parts = value.split(",");
    if (parts[1]?.length > 2) {
      value = parts[0] + "," + parts[1].slice(0, 2);
    }

    editableRows.value[index][field] = (
      value === "" ? "0" : value
    ) as T[NumericField<T>];
    target.value = value;

    nextTick(() => {
      const newCursorPos = cursorPosition
        ? Math.min(cursorPosition, value.length)
        : value.length;
      target.setSelectionRange(newCursorPos, newCursorPos);
    });
  };

  const handleNumberBlur = (field: NumericField<T>, index: number) => {
    const value = editableRows.value[index][field];
    if (typeof value === "string") {
      // Заменяем запятую на точку для корректного парсинга числа
      const numericValue = parseFloat(value.replace(",", ".")) || 0;

      const formattedValue = numericValue.toFixed(2).replace(".", ",");

      editableRows.value[index][field] = formattedValue as T[NumericField<T>];
    }
  };

  return {
    handleKeyPress,
    handleNumberInput,
    handleNumberBlur,
  };
};
