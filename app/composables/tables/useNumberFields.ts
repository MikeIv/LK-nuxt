type NumberField =
  | "start_meter_reading"
  | "end_meter_reading"
  | "amount_without_advance_nds"
  | "advance_without_certificates_with_nds"
  | "advance_without_certificates_nds";

type ValidationRules = {
  min?: number;
  max?: number;
  required?: boolean;
  allowZero?: boolean;
  customValidator?: (value: string) => string | null;
};

export const useNumberFields = (
  editableRows: Ref<unknown[]>,
  numberErrors: Ref<Record<number, string>>,
  fieldValidations: Partial<Record<NumberField, ValidationRules>> = {},
) => {
  /**
   * Форматирует ввод числа, оставляя только цифры, запятые и минус
   */
  const formatNumberInput = (value: string): string => {
    // Удаляем все символы, кроме цифр, минуса и запятой
    let cleaned = value.replace(/[^\d,-]/g, "");

    // Оставляем только первый минус
    const minusIndex = cleaned.indexOf("-");
    if (minusIndex > 0) {
      cleaned = cleaned.replace(/-/g, "");
      cleaned = "-" + cleaned;
    } else if (minusIndex === 0) {
      cleaned = "-" + cleaned.replace(/-/g, "");
    }

    // Оставляем только первую запятую
    const commaIndex = cleaned.indexOf(",");
    if (commaIndex !== -1) {
      cleaned =
        cleaned.slice(0, commaIndex + 1) +
        cleaned.slice(commaIndex + 1).replace(/,/g, "");
    }

    return cleaned;
  };

  /**
   * Форматирует число при потере фокуса
   */
  const formatNumberBlur = (value: string): string => {
    if (!value) return "";

    // Добавляем .00 если нет десятичной части
    if (!value.includes(",")) {
      return `${value},00`;
    }

    // Дополняем до 2 знаков после запятой
    const [integer, decimal] = value.split(",");
    const paddedDecimal = (decimal || "").padEnd(2, "0").slice(0, 2);
    return `${integer},${paddedDecimal}`;
  };

  /**
   * Обработчик ввода для числовых полей
   */
  const handleNumberInput = (
    event: Event,
    field: NumberField,
    index: number,
  ): void => {
    const target = event.target as HTMLInputElement;
    const cursorPosition = target.selectionStart;
    let value = target.value;

    // Форматируем ввод
    value = formatNumberInput(value);

    // Сохраняем новое значение
    editableRows.value[index][field] = value;
    target.value = value;

    // Восстанавливаем позицию курсора
    if (cursorPosition !== null) {
      requestAnimationFrame(() => {
        const newPosition = Math.max(0, Math.min(cursorPosition, value.length));
        target.setSelectionRange(newPosition, newPosition);
      });
    }

    // Сбрасываем ошибки для этого поля
    clearFieldError(index, field);
  };

  /**
   * Обработчик потери фокуса для числовых полей
   */
  const handleNumberBlur = (field: NumberField, index: number): void => {
    let value = editableRows.value[index][field];

    // Форматируем значение при потере фокуса
    value = formatNumberBlur(value);
    editableRows.value[index][field] = value;

    // Выполняем валидацию
    validateField(field, index);

    // Специальная валидация для показаний счетчика
    if (field === "start_meter_reading" || field === "end_meter_reading") {
      validateMeterReadings(index);
    }
  };

  /**
   * Валидация поля
   */
  const validateField = (field: NumberField, index: number): boolean => {
    const value = editableRows.value[index][field];
    const rules = fieldValidations[field] || {};
    let error: string | null = null;

    // Проверка на обязательность
    if (rules.required && !value) {
      error = "Поле обязательно для заполнения";
    }
    // Проверка на ноль (если не разрешено)
    // else if (value === "0,00" && !rules.allowZero && rules.required) {
    //   error = "Значение не может быть нулевым";
    // }
    // Проверка минимального значения
    else if (rules.min !== undefined) {
      const numValue = parseFloat(value.replace(",", ".") || 0);
      if (numValue < rules.min) {
        error = `Значение не может быть меньше ${rules.min.toFixed(2).replace(".", ",")}`;
      }
    }
    // Проверка максимального значения
    else if (rules.max !== undefined) {
      const numValue = parseFloat(value.replace(",", ".")) || 0;
      if (numValue > rules.max) {
        error = `Значение не может быть больше ${rules.max.toFixed(2).replace(".", ",")}`;
      }
    }
    // Кастомная валидация
    else if (rules.customValidator) {
      error = rules.customValidator(value);
    }

    if (error) {
      numberErrors.value[index] = error;
      return false;
    }

    return true;
  };

  /**
   * Специальная валидация для показаний счетчиков
   */
  const validateMeterReadings = (index: number): void => {
    const startStr = editableRows.value[index].start_meter_reading || "0,00";
    const endStr = editableRows.value[index].end_meter_reading || "0,00";

    const start = parseFloat(startStr.replace(",", "."));
    const end = parseFloat(endStr.replace(",", "."));

    if (start > end) {
      numberErrors.value[index] =
        "Начальное значение не может быть больше конечного";
    } else if (
      numberErrors.value[index] ===
      "Начальное значение не может быть больше конечного"
    ) {
      clearFieldError(index);
    }
  };

  /**
   * Сброс ошибки для поля
   */
  const clearFieldError = (index: number, field?: NumberField): void => {
    if (!field || numberErrors.value[index]?.includes(field)) {
      numberErrors.value[index] = undefined;
    }
  };

  /**
   * Проверка, нужно ли показывать ошибку для поля
   */
  const shouldShowError = (index: number, field: NumberField): boolean => {
    const value = editableRows.value[index][field];
    const error = numberErrors.value[index];
    const rules = fieldValidations[field] || {};

    // Показываем ошибку если:
    // 1. Есть явная ошибка валидации
    // 2. Поле обязательно и пустое
    // 3. Для полей счетчиков - специальная ошибка
    return (
      !!error ||
      (rules.required && !value) ||
      (field === "start_meter_reading" &&
        error === "Начальное значение не может быть больше конечного") ||
      (field === "end_meter_reading" &&
        error === "Начальное значение не может быть больше конечного")
    );
  };

  return {
    handleNumberInput,
    handleNumberBlur,
    shouldShowError,
    validateField,
  };
};
