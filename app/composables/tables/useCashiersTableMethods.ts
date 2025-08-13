export const useCashiersTableMethods = (block: Ref<unknown>, emit: unknown) => {
  const editingTitle = ref(false);
  const titleInput = ref<HTMLInputElement | null>(null);

  const updateLocalBlock = (field: string, value: unknown) => {
    const updatedBlock = {
      ...block.value,
      [field]: value,
      isDirty: true,
    };
    block.value = updatedBlock;
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
    } else if (block.value.name !== block.value._originalName) {
      block.value.isDirty = true;
      emit("update:block", { ...block.value });
    }

    editingTitle.value = false;
  };

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
