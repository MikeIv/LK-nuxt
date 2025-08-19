export const useKktInput = (
  editableRows: Ref<unknown[]>,
  kktErrors: Ref<Record<number, string>>,
) => {
  const validateRequired = (value: string): boolean => {
    return value.length > 0; // Просто проверяем длину, без trim()
  };

  const preventNonNumericInput = (event: KeyboardEvent): boolean => {
    const allowedKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
      "Enter",
    ];

    if (allowedKeys.includes(event.key)) {
      return true;
    }

    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
      return false;
    }

    return true;
  };

  const handleKktInput = (event: Event, index: number): void => {
    const target = event.target as HTMLInputElement;
    const cursorPosition = target.selectionStart;

    const cleanedValue = target.value.replace(/\D/g, "").slice(0, 16);

    const previousValue = editableRows.value[index].registration_number || "";

    // Всегда очищаем ошибку при вводе, даже если значение не изменилось
    if (kktErrors.value[index]) {
      kktErrors.value[index] = undefined;
    }

    if (cleanedValue === previousValue) return;

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
      kktErrors.value[index] = "Ровно 16 цифр";
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
    preventNonNumericInput,
  };
};
