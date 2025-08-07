<script setup lang="ts">
  import { useSaveFile } from "~/composables/useSaveFile";
  import { useFileHandling } from "~/composables/useFileHandling";
  import type { FileData, OverSumTableRow } from "~/types/tables";

  const props = defineProps({
    headers: {
      type: Array,
      default: () => [],
    },
    initialData: {
      type: Array as () => OverSumTableRow[],
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    error: {
      type: [String, Boolean],
      default: false,
    },
  });

  const emit = defineEmits<{
    (
      e: "update:totalSumm" | "update:totalVAT" | "update:tableData",
      value: number | OverSumTableRow[],
    ): void;
    (e: "rows-added", indices: number[]): void;
    (e: "rows-removed", index: number): void;
    (
      e: "files-uploaded",
      payload: {
        index: number;
        filesData: FileData[];
      },
    ): void;
    (
      e: "file-removed",
      payload: {
        index: number;
        fileIndex: number;
      },
    ): void;
  }>();

  const editableRows = ref<OverSumTableRow[]>([]);
  const addedRowsIndices = ref<number[]>([]);
  const editingNameIndex = ref<number | null>(null);
  const nameInputRefs = ref<HTMLInputElement[]>([]);
  const tableMessage = ref("");
  const { handleNumberInput, handleNumberBlur } = useNumberInput(editableRows);
  const { loading: fileLoading } = useSaveFile();
  const { handleFileUploaded, handleFileRemoved } =
    useFileHandling<OverSumTableRow>({
      editableRows,
      emit,
      getFileIds: (row) => row.file_ids,
      setFileData: (row, fileData) => ({
        ...row,
        files: fileData,
        file_ids: fileData.map((file) => Number(file.id)),
      }),
    });

  const totalWithVAT = computed(() => {
    return editableRows.value.reduce((sum, row) => {
      return sum + (Number(row.amount_with_nds) || 0);
    }, 0);
  });

  const totalVAT = computed(() => {
    return editableRows.value.reduce((sum, row) => {
      return sum + (Number(row.amount_nds) || 0);
    }, 0);
  });

  const totalSumm = computed(() => totalWithVAT.value);

  const normalizeRowData = (row: OverSumTableRow): OverSumTableRow => ({
    ...createEmptyRow(),
    ...row,
    amount_with_nds: row.amount_with_nds || "0",
    amount_nds: row.amount_nds || "0",
  });

  watch(
    () => props.initialData,
    (newData) => {
      if (JSON.stringify(newData) !== JSON.stringify(editableRows.value)) {
        editableRows.value = newData?.length
          ? newData.map((row) => ({
              ...normalizeRowData(row),
              isNew: false,
            }))
          : [createEmptyRow()];
        addedRowsIndices.value = [];
      }
    },
    { immediate: true },
  );

  watch(
    [totalSumm, totalVAT],
    ([newTotalSumm, newTotalVAT], [oldTotalSumm, oldTotalVAT]) => {
      if (newTotalSumm !== oldTotalSumm || newTotalVAT !== oldTotalVAT) {
        emit("update:totalSumm", newTotalSumm);
        emit("update:totalVAT", newTotalVAT);
      }
    },
  );

  const createEmptyRow = (): OverSumTableRow => ({
    id: "",
    name: "",
    amount_with_nds: "0",
    amount_nds: "0",
    file_ids: [],
    files: [],
    isNew: true,
  });

  const showRemoveButton = ref(false);

  const addRow = async () => {
    const newRow = createEmptyRow();
    editableRows.value.push(newRow);
    const newIndex = editableRows.value.length - 1;
    addedRowsIndices.value.push(newIndex);
    showRemoveButton.value = true;
    editingNameIndex.value = newIndex;
    await nextTick();
    if (nameInputRefs.value[newIndex]) {
      nameInputRefs.value[newIndex].focus();
    }
    tableMessage.value = "Основание добавлено";
    emitUpdate();
    emit("rows-added");
  };

  const removeLastRow = () => {
    console.log("addedRowsIndices", addedRowsIndices.value);
    if (editableRows.value.length === 0) return;

    // Удаляем последнюю строку
    editableRows.value.pop();

    if (editableRows.value.length === 0) {
      showRemoveButton.value = false;
      editableRows.value = [];
      addedRowsIndices.value = [];
    } else {
      const removedIndex = editableRows.value.length;
      const indexInAdded = addedRowsIndices.value.indexOf(removedIndex);
      if (indexInAdded !== -1) {
        addedRowsIndices.value.splice(indexInAdded, 1);
      }
      addedRowsIndices.value = addedRowsIndices.value
        .map((i) => (i > removedIndex ? i - 1 : i))
        .filter((i) => i >= 0);
    }
    console.log("addedRowsIndices.value", addedRowsIndices.value);
    tableMessage.value = "Основание удалено";
    emitUpdate();
    emit("rows-removed");
  };

  const handleNameChange = (index: number, event: Event) => {
    const target = event.target as HTMLInputElement;
    editableRows.value[index].name = target.value;
    emitUpdate();
  };

  const finishNameEditing = (index: number) => {
    console.log(index);
    editingNameIndex.value = null;
    emitUpdate();
  };

  // Эмитит обновленные данные
  const emitUpdate = () => {
    emit("update:tableData", [...editableRows.value]);
  };

  console.log("showRemoveButton", showRemoveButton.value);
</script>

<template>
  <StepsCoreEditableBlock
    title=""
    :headers="headers"
    :model-value="editableRows"
    grid-template-columns="44px 320px 400px 240px"
    :loading="loading"
    :error="error"
    :message="tableMessage"
    :min-rows="0"
    add-button-text="Добавить основание"
    remove-button-text="Удалить основание"
    :show-remove-button="showRemoveButton"
    is-table
    @add="addRow"
    @remove="removeLastRow"
  >
    <template #row="{ item: row, index }">
      <div class="cell body-cell" :class="$style.centre">{{ index + 1 }}</div>
      <div class="cell body-cell">
        <template v-if="editingNameIndex === index || row.isNew">
          <input
            :ref="(el) => (nameInputRefs[index] = el as HTMLInputElement)"
            type="text"
            :value="row.name"
            placeholder="Введите название"
            class="name-input"
            @input="handleNameChange(index, $event)"
            @blur="finishNameEditing(index)"
            @keyup.enter="finishNameEditing(index)"
          />
        </template>
        <template v-else>
          <span :class="$style.editable" @click="editingNameIndex = index">
            {{ row?.name }}
          </span>
        </template>
      </div>
      <div class="cell" :class="$style.cellRow">
        <div>
          <input
            type="text"
            :value="row.amount_with_nds"
            placeholder="0,00"
            pattern="^-?\d*\.?\d*$"
            required
            @input="handleNumberInput($event, 'amount_with_nds', index)"
            @blur="handleNumberBlur('amount_with_nds', index)"
          />
        </div>
        <div>
          <input
            type="text"
            :value="row.amount_nds"
            placeholder="0,00"
            pattern="^-?\d*\.?\d*$"
            required
            @input="handleNumberInput($event, 'amount_nds', index)"
            @blur="handleNumberBlur('amount_nds', index)"
          />
        </div>
      </div>
      <div class="cell body-cell">
        <StepsCoreFileUploader
          :index="index"
          prefix="other-sum-file"
          :loading="fileLoading"
          :multiple="true"
          :max-files="3"
          :files="row.files || []"
          :file-ids="row.file_ids || []"
          @files-uploaded="
            ({ filesData }) => handleFileUploaded({ index, filesData })
          "
          @file-removed="
            ({ fileIndex }) => handleFileRemoved({ index, fileIndex })
          "
        />
      </div>
    </template>

    <template #footer>
      <StepsCoreTotalSummary
        :total-summ="Number(totalSumm)"
        :total-v-a-t="Number(totalVAT)"
      />
    </template>
  </StepsCoreEditableBlock>
</template>

<style module lang="scss">
  .cellRow {
    display: flex;
    justify-content: space-around;
    align-items: center;
    gap: rem(8);
    font-size: rem(12);
    font-weight: bold;
    border-right: 1px solid var(--a-borderLght);
    background-color: var(--a-bgTable);
    border-bottom: 1px solid var(--a-borderAccentLight);
  }

  .centre {
    align-items: center;
  }

  .editable {
    cursor: pointer;
  }
</style>

<style lang="scss">
  .required {
    border: 1px solid var(--a-errorText) !important;
    border-radius: rem(4);
    box-shadow: 0 0 0 1px var(--a-errorText);
  }
</style>
