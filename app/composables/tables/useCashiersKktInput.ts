export const useCashiersKktInput = (
  initialValue: string,
  isFromApi: boolean,
) => {
  const localValue = ref(initialValue);
  const isInvalid = ref(false);

  const validateRegistrationNumber = (event: Event) => {
    if (isFromApi) {
      event.preventDefault();
      return;
    }

    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, "");

    if (value.length > 16) {
      value = value.slice(0, 16);
    }

    localValue.value = value;
    input.value = value;
    isInvalid.value = value.length > 0 && value.length !== 16;
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (isFromApi) {
      event.preventDefault();
      return;
    }

    const allowedKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "Escape",
      "Enter",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
    ];

    if (
      allowedKeys.includes(event.key) ||
      (event.key >= "0" && event.key <= "9") ||
      (event.ctrlKey && ["a", "c", "v", "x"].includes(event.key.toLowerCase()))
    ) {
      return;
    }

    event.preventDefault();
  };

  const inputClasses = computed(() => ({
    "readonly-input": isFromApi,
    "error-field": isInvalid.value && !isFromApi,
  }));

  return {
    localValue,
    isInvalid,
    validateRegistrationNumber,
    handleKeyDown,
    inputClasses,
  };
};
