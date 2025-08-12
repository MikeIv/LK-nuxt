export const useCashiersTableMethods = (block: Ref<unknown>, emit: unknown) => {
  const editingTitle = ref(false);
  const titleInput = ref<HTMLInputElement | null>(null);

  const updateLocalBlock = (field: string, value: unknown) => {
    const updatedBlock = {
      ...block.value,
      [field]: value,
      isDirty: true,
    };
    block.value = JSON.parse(JSON.stringify(updatedBlock));
    emit("update:block", updatedBlock);
  };

  const startTitleEditing = () => {
    editingTitle.value = true;
    nextTick(() => {
      titleInput.value?.focus();
      titleInput.value?.setSelectionRange(0, titleInput.value.value.length);
    });
  };

  const handleTitleEditEnd = () => {
    if (!block.value.name?.trim()) {
      updateLocalBlock("name", `Касса ${block.value.order}`);
    }
    editingTitle.value = false;
  };

  // const validateDigitsInput = (event: Event, field: string) => {
  //   const input = event.target as HTMLInputElement;
  //   const value = input.value.replace(/\D/g, "");
  //   input.value = value;
  //   updateLocalBlock(field, value);
  // };
  //
  // const handleDateChange = (field: string, date: Date | null) => {
  //   updateLocalBlock(field, date);
  // };

  const emitRemoveBlock = () => {
    emit("removeBlock", block.value);
  };

  return {
    editingTitle,
    titleInput,
    startTitleEditing,
    handleTitleEditEnd,
    emitRemoveBlock,
    updateLocalBlock,
  };
};
