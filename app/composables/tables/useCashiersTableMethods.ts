export const useCashiersTableMethods = (block: Ref<unknown>, emit: unknown) => {
  const editingTitle = ref(false);
  const titleInput = ref<HTMLInputElement | null>(null);

  const updateLocalBlock = (field: string, value: unknown) => {
    block.value = {
      ...block.value,
      [field]: value,
      isDirty: true,
    };
    emit("update:block", block.value);
  };

  const startTitleEditing = () => {
    editingTitle.value = true;
    nextTick(() => {
      titleInput.value?.focus();
      titleInput.value?.setSelectionRange(0, titleInput.value.value.length);
    });
  };

  const handleTitleEditEnd = () => {
    if (!block.value.name.trim()) {
      updateLocalBlock("name", `Касса ${block.value.order}`);
    }
    editingTitle.value = false;
  };

  const validateDigitsInput = (event: Event, field: string) => {
    const input = event.target as HTMLInputElement;
    updateLocalBlock(field, input.value.replace(/\D/g, ""));
  };

  const handleDateChange = (field: string, date: Date | null) => {
    updateLocalBlock(field, date);
  };

  const emitRemoveBlock = () => {
    emit("removeBlock", block.value);
  };

  return {
    editingTitle,
    titleInput,
    startTitleEditing,
    handleTitleEditEnd,
    validateDigitsInput,
    handleDateChange,
    emitRemoveBlock,
    updateLocalBlock,
  };
};
