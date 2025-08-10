export const useKktInput = (
  editableRows: Ref<unknown[]>,
  kktErrors: Ref<Record<number, string>>,
  // emit?: (event: string, ...args: any[]) => void,
) => {
  const validateRequired = (value: string): boolean => {
    return value.trim().length >= 0;
  };

  const handleKktInput = (event: Event, index: number): void => {
    const target = event.target as HTMLInputElement;
    const cursorPosition = target.selectionStart;
    const currentValue = editableRows.value[index].registration_number || "";
    const cleanedValue = target.value.replace(/\D/g, "").slice(0, 16);

    if (cleanedValue === currentValue) return;

    editableRows.value[index].registration_number = cleanedValue;

    if (target.value !== cleanedValue) {
      target.value = cleanedValue;

      if (cursorPosition !== null) {
        const newCursorPosition = Math.min(cursorPosition, cleanedValue.length);
        requestAnimationFrame(() => {
          target.setSelectionRange(newCursorPosition, newCursorPosition);
        });
      }
    }

    if (kktErrors.value[index]) {
      kktErrors.value[index] = undefined;
    }

    // Валидация при полном вводе
    if (cleanedValue.length === 16) {
      validateKktNumber(index);
    }
  };

  const checkForDuplicates = (index: number): boolean => {
    const currentNumber = editableRows.value[index].registration_number;
    if (!currentNumber) return false;

    return editableRows.value.some(
      (row, i) => row.registration_number === currentNumber && i !== index,
    );
  };

  const validateKktNumber = (index: number): boolean => {
    const kktNumber = editableRows.value[index].registration_number || "";

    // Валидация на обязательность поля
    if (!validateRequired(kktNumber)) {
      kktErrors.value[index] = "Поле обязательно для заполнения";
      return false;
    }

    if (kktNumber.length !== 16) {
      kktErrors.value[index] = "Номер ККТ должен содержать ровно 16 цифр";
      return false;
    }

    if (checkForDuplicates(index)) {
      kktErrors.value[index] = "Этот номер ККТ уже есть в отчете";
      return false;
    }

    kktErrors.value[index] = undefined;
    return true;
  };

  const shouldShowError = (index: number): boolean => {
    const value = editableRows.value[index]?.registration_number;
    return !value || !!kktErrors.value[index];
  };

  return {
    handleKktInput,
    validateKktNumber,
    shouldShowError,
  };
};
