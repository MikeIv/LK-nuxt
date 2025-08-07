<script setup lang="ts">
  import { useSaveFile } from "~/composables/useSaveFile";
  import type { RefundsTableRow } from "~/types/tables";
  import { useFileHandling } from "~/composables/useFileHandling";

  interface RefundsTableProps {
    headers?: unknown[];
    initialData?: RefundsTableRow[];
    loading?: boolean;
    error?: string | boolean;
  }

  const props = withDefaults(defineProps<RefundsTableProps>(), {
    headers: () => [],
    initialData: () => [],
    loading: false,
    error: false,
  });

  const emit = defineEmits<{
    (
      e: "update:totalSumm" | "update:totalVAT" | "update:tableData",
      value: number | KktTableRow[],
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

  const state = reactive({
    editableRows: [...props.initialData],
    kktErrors: {} as Record<number, string>,
    addedRowsCount: 0,
    addedRowsIndices: [] as number[],
    tableMessage: "",
  });

  const editingNameIndex = ref<number | null>(null);
  const nameInputRefs = ref<HTMLInputElement[]>([]);
  const {
    editableRows,
    kktErrors,
    addedRowsCount,
    addedRowsIndices,
    tableMessage,
  } = toRefs(state);

  const { handleNumberInput, handleNumberBlur } = useNumberInput(editableRows);
  const { loading: fileLoading } = useSaveFile();

  if (editableRows.value.length === 0) {
    editableRows.value.push(createEmptyRow());
  }

  function createEmptyRow(): RefundsTableRow {
    return {
      id: "",
      name: "",
      registration_number: "",
      returns_goods_services_with_nds: "0",
      returns_goods_services_nds: "0",
      gift_certificates_sold_with_nds: "0",
      gift_certificates_sold_nds: "0",
      file_id: null,
    };
  }

  const { handleKktInput, validateKktNumber } = useKktInput(
    editableRows,
    kktErrors,
    emit,
  );

  const totalWithVAT = computed<number>(() => {
    return editableRows.value.reduce((sum, row) => {
      const xzWithNds = Number(row.returns_goods_services_with_nds) || 0;
      const xzxzWithNds = Number(row.gift_certificates_sold_with_nds) || 0;
      return sum + xzWithNds + xzxzWithNds;
    }, 0);
  });

  const totalVAT = computed<number>(() => {
    return editableRows.value.reduce((sum, row) => {
      const xzNds = Number(row.returns_goods_services_nds) || 0;
      const zxzxNds = Number(row.gift_certificates_sold_nds) || 0;
      return sum + xzNds + zxzxNds;
    }, 0);
  });

  const totalSumm = computed<number>(() => totalWithVAT.value);

  const showRemoveButton = computed<boolean>(() => {
    return addedRowsIndices.value.length > 0;
  });

  const addRow = (): void => {
    const newRow = createEmptyRow();
    editableRows.value.push(newRow);
    addedRowsIndices.value.push(editableRows.value.length - 1);
    addedRowsCount.value++;
    tableMessage.value = "Добавлено основание";
  };

  const removeLastRow = (): void => {
    if (editableRows.value.length > 1 && addedRowsIndices.value.length > 0) {
      const lastAddedIndex = addedRowsIndices.value.pop();
      if (lastAddedIndex !== undefined) {
        editableRows.value.splice(lastAddedIndex, 1);
        addedRowsIndices.value = addedRowsIndices.value.map((i) =>
          i > lastAddedIndex ? i - 1 : i,
        );
      }
      addedRowsCount.value--;
      tableMessage.value = "Основание удалено";
    }
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

  watch(
    () => props.initialData,
    (newData) => {
      if (JSON.stringify(newData) !== JSON.stringify(editableRows.value)) {
        editableRows.value = newData?.length
          ? [...newData]
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

  watch(
    editableRows,
    (newRows) => {
      emit("update:tableData", newRows);
    },
    { deep: true },
  );

  const { handleFileUploaded, handleFileRemoved } =
    useFileHandling<KktTableRow>({
      editableRows,
      emit,
      getFileId: (row) => row.file_id,
      setFileData: (row, fileData) => ({
        ...row,
        file: fileData ? { ...fileData } : undefined,
        file_id: fileData ? Number(fileData.id) : null,
      }),
    });
</script>

<template>
  <StepsCoreEditableBlock
    title=""
    :headers="headers"
    :model-value="editableRows"
    grid-template-columns="44px 120px 160px 300px 300px 240px"
    :loading="loading"
    :error="error"
    :message="tableMessage"
    add-button-text="Добавить основание"
    remove-button-text="Удалить основание"
    :show-remove-button="showRemoveButton"
    is-table
    @add="addRow"
    @remove="removeLastRow"
  >
    <template #row="{ item: row, index }">
      <div class="cell body-cell" :class="$style.centre">
        {{ index + 1 }}
      </div>
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
      <div class="cell body-cell">
        <input
          type="text"
          :value="row?.registration_number"
          placeholder="Ровно 16 цифр"
          maxlength="16"
          inputmode="numeric"
          pattern="[0-9]{16}"
          :class="{ 'error-input': kktErrors[index] }"
          @input="handleKktInput($event, index)"
          @blur="validateKktNumber(index)"
        />
        <div
          v-if="kktErrors[index] && row?.registration_number"
          class="body-row__error-message"
        >
          {{ kktErrors[index] }}
        </div>
      </div>
      <div class="cell" :class="$style.cellRow">
        <div>
          <input
            type="text"
            :value="row.returns_goods_services_with_nds"
            placeholder="0,00"
            pattern="^-?\d*\.?\d*$"
            required
            @input="
              handleNumberInput(
                $event,
                'returns_goods_services_with_nds',
                index,
              )
            "
            @blur="handleNumberBlur('returns_goods_services_with_nds', index)"
          />
        </div>
        <div>
          <input
            type="text"
            :value="row.returns_goods_services_nds"
            placeholder="0,00"
            pattern="^-?\d*\.?\d*$"
            required
            @input="
              handleNumberInput($event, 'returns_goods_services_nds', index)
            "
            @blur="handleNumberBlur('returns_goods_services_nds', index)"
          />
        </div>
      </div>
      <div class="cell" :class="$style.cellRow">
        <div>
          <input
            type="text"
            :value="row.gift_certificates_sold_with_nds"
            placeholder="0,00"
            pattern="^-?\d*\.?\d*$"
            required
            @input="
              handleNumberInput(
                $event,
                'gift_certificates_sold_with_nds',
                index,
              )
            "
            @blur="handleNumberBlur('gift_certificates_sold_with_nds', index)"
          />
        </div>
        <div>
          <input
            type="text"
            :value="row.gift_certificates_sold_nds"
            placeholder="0,00"
            pattern="^-?\d*\.?\d*$"
            required
            @input="
              handleNumberInput($event, 'gift_certificates_sold_nds', index)
            "
            @blur="handleNumberBlur('gift_certificates_sold_nds', index)"
          />
        </div>
      </div>
      <div class="cell body-cell">
        <StepsCoreFileUploader
          :file="row.file"
          :file-id="row.file_id"
          :index="index"
          prefix="refunds-file"
          :loading="fileLoading"
          @file-uploaded="handleFileUploaded"
          @file-removed="handleFileRemoved"
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
    gap: rem(8);
    font-size: rem(12);
    font-weight: bold;
    border-right: 1px solid var(--a-borderLght);
    background-color: var(--a-bgTable);
    border-bottom: 1px solid var(--a-borderAccentLight);
  }

  .editable {
    cursor: pointer;
  }

  .centre {
    align-items: center;
  }
</style>

<style lang="scss">
  .required {
    border: 1px solid var(--a-errorText) !important;
    border-radius: rem(4);
    box-shadow: 0 0 0 1px var(--a-errorText);
  }
</style>
