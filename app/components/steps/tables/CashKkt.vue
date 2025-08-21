<script setup lang="ts">
  import type { FileData, CashTableRow } from "~/types/tables";

  const props = defineProps({
    headers: {
      type: Array,
      default: () => [],
    },
    initialData: {
      type: Array as () => CashTableRow[],
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
      value: number | CashTableRow[],
    ): void;
    (e: "rows-added", indices: number[]): void;
    (e: "rows-removed", index: number): void;
    (
      e: "files-uploaded",
      payload: { index: number; filesData: FileData[] },
    ): void;
    (e: "file-removed", payload: { index: number; fileIndex: number }): void;
  }>();

  const editableRows = ref<CashTableRow[]>([]);
  const addedRowsIndices = ref<number[]>([]);
  const editingNameIndex = ref<number | null>(null);
  const nameInputRefs = ref<HTMLInputElement[]>([]);
  const tableMessage = ref("");
  const showRemoveButton = ref(false);
  const invalidFields = ref<Record<number, string[]>>({});
  const modifiedFields = ref<Record<number, Set<string>>>({});

  const markFieldAsModified = (index: number, field: string) => {
    if (!modifiedFields.value[index]) {
      modifiedFields.value[index] = new Set();
    }
    modifiedFields.value[index].add(field);
  };

  const fieldValidations = {
    amount_with_nds: (value: string) => {
      const num = parseFloat(value.replace(",", "."));
      return !isNaN(num) && num >= 0;
    },
    amount_nds: (value: string) => {
      const num = parseFloat(value.replace(",", "."));
      return !isNaN(num) && num >= 0;
    },
  } as const;

  const handleNumberInput = (
    event: Event,
    field: "amount_with_nds" | "amount_nds",
    index: number,
  ) => {
    const target = event.target as HTMLInputElement;
    let value = target.value;

    value = value.replace(/\./g, ",");

    value = value.replace(/[^\d,]/g, "");

    const decimalParts = value.split(",");
    if (decimalParts.length > 1 && decimalParts[1].length > 2) {
      decimalParts[1] = decimalParts[1].substring(0, 2);
      value = decimalParts.join(",");
    }

    const hasDecimal = /,/.test(value);
    if (hasDecimal) {
      value = value.replace(/,/g, (match, offset) => {
        return offset === value.indexOf(match) ? match : "";
      });
    }

    editableRows.value[index][field] = value;
    markFieldAsModified(index, field);
    validateRow(index);
    emitUpdate();
  };

  const handleNumberBlur = (
    field: "amount_with_nds" | "amount_nds",
    index: number,
  ) => {
    const value = editableRows.value[index][field];

    if (value) {
      let processedValue = value;

      const parts = processedValue.split(",");
      if (parts.length > 1 && parts[1].length > 2) {
        parts[1] = parts[1].substring(0, 2);
        processedValue = parts.join(",");
      }

      if (parts.length === 1 && parts[0] !== "") {
        processedValue = parts[0] + ",00";
      }

      if (processedValue.startsWith(",")) {
        processedValue = "0" + processedValue;
      }

      processedValue = processedValue.replace(/\./g, ",");

      editableRows.value[index][field] = processedValue;
    }

    markFieldAsModified(index, field);
    validateRow(index);
    emitUpdate();
  };

  const { loading: fileLoading } = useSaveFile();
  const { handleFileUploaded, handleFileRemoved } =
    useFileHandling<CashTableRow>({
      editableRows,
      emit,
      getFileIds: (row) => row.file_ids,
      setFileData: (row, fileData) => ({
        ...row,
        files: fileData,
        file_ids: fileData.map((file) => Number(file.id)),
      }),
    });

  const isRowFromAPI = (row: CashTableRow): boolean => {
    return !!(row.name && row.name.trim() !== "");
  };

  watch(
    editableRows,
    (newRows) => {
      console.log(
        "Rows data:",
        newRows.map((row) => ({
          id: row.id,
          isNew: row.isNew,
          isApiRow: isRowFromAPI(row),
          name: row.name,
        })),
      );
    },
    { immediate: true, deep: true },
  );

  const shouldShowNumberError = (index: number, field: string): boolean => {
    return invalidFields.value[index]?.includes(field) || false;
  };

  const validateRow = (index: number) => {
    const errors: string[] = [];
    const row = editableRows.value[index];

    const amountWithNds = row.amount_with_nds;
    const amountNds = row.amount_nds;
    const settlementAccount = row.settlement_account_number;
    const name = row.name;

    // Исправленные проверки - учитываем "0" как валидное значение
    const hasAmountWithNds =
      amountWithNds !== undefined &&
      amountWithNds !== "" &&
      amountWithNds !== "0";
    const hasAmountNds =
      amountNds !== undefined && amountNds !== "" && amountNds !== "0";
    const hasSettlementAccount =
      settlementAccount && settlementAccount.trim() !== "";
    const hasName = name && name.trim() !== "";
    const hasFileIds = row.file_ids && row.file_ids.length > 0;

    // Валидация числовых полей (только если они не пустые и не "0")
    if (
      amountWithNds &&
      amountWithNds !== "0" &&
      !fieldValidations.amount_with_nds(amountWithNds)
    ) {
      errors.push("amount_with_nds");
    }

    if (
      amountNds &&
      amountNds !== "0" &&
      !fieldValidations.amount_nds(amountNds)
    ) {
      errors.push("amount_nds");
    }

    const isNewlyAddedRow = addedRowsIndices.value.includes(index);
    if (isNewlyAddedRow) {
      if (!hasName) errors.push("name");
      if (!hasSettlementAccount) errors.push("settlement_account_number");
      if (!hasAmountWithNds) errors.push("amount_with_nds");
      if (!hasAmountNds) errors.push("amount_nds");
      if (!hasFileIds) errors.push("files");
    } else {
      // 3. ДЛЯ ОСТАЛЬНЫХ СТРОК: проверяем измененные поля
      let hasNonEmptyModifiedField = false;
      if (modifiedFields.value[index]) {
        for (const field of modifiedFields.value[index]) {
          if (field === "name" && hasName) hasNonEmptyModifiedField = true;
          if (field === "settlement_account_number" && hasSettlementAccount)
            hasNonEmptyModifiedField = true;
          if (field === "amount_with_nds" && hasAmountWithNds)
            hasNonEmptyModifiedField = true;
          if (field === "amount_nds" && hasAmountNds)
            hasNonEmptyModifiedField = true;
        }
      }

      if (hasNonEmptyModifiedField) {
        if (!hasName) errors.push("name");
        if (!hasSettlementAccount) errors.push("settlement_account_number");
        if (!hasAmountWithNds) errors.push("amount_with_nds");
        if (!hasAmountNds) errors.push("amount_nds");
        if (!hasFileIds) errors.push("files");
      }

      if (modifiedFields.value[index] && !hasNonEmptyModifiedField) {
        const { [index]: _, ...rest } = modifiedFields.value;
        modifiedFields.value = rest;
      }
    }

    invalidFields.value = {
      ...invalidFields.value,
      [index]: errors,
    };

    return errors.length === 0;
  };

  const hasAmountInRow = (row: CashTableRow, index: number): boolean => {
    // Для новых строк файлы всегда обязательны
    const isNewlyAddedRow = addedRowsIndices.value.includes(index);
    if (isNewlyAddedRow) return true;

    // Для остальных строк файлы обязательны только если есть непустые измененные поля
    let hasNonEmptyModifiedField = false;
    if (modifiedFields.value[index]) {
      const hasAmountWithNds =
        row.amount_with_nds &&
        row.amount_with_nds !== "" &&
        row.amount_with_nds !== "0";
      const hasAmountNds =
        row.amount_nds && row.amount_nds !== "" && row.amount_nds !== "0";
      const hasSettlementAccount =
        row.settlement_account_number &&
        row.settlement_account_number.trim() !== "";
      const hasName = row.name && row.name.trim() !== "";

      for (const field of modifiedFields.value[index]) {
        if (field === "name" && hasName) hasNonEmptyModifiedField = true;
        if (field === "settlement_account_number" && hasSettlementAccount)
          hasNonEmptyModifiedField = true;
        if (field === "amount_with_nds" && hasAmountWithNds)
          hasNonEmptyModifiedField = true;
        if (field === "amount_nds" && hasAmountNds)
          hasNonEmptyModifiedField = true;
      }
    }
    return hasNonEmptyModifiedField;
  };

  const handleSettlementInput = (event: Event, index: number) => {
    const target = event.target as HTMLInputElement;
    editableRows.value[index].settlement_account_number = target.value;
    markFieldAsModified(index, "settlement_account_number");
    validateRow(index);
    emitUpdate();
  };

  const handleSettlementBlur = (index: number) => {
    validateRow(index);
  };

  const { totalWithVAT, totalVAT } = useCashCalculations(editableRows);

  const createEmptyRow = (): CashTableRow => ({
    id: "",
    name: "",
    settlement_account_number: "",
    amount_with_nds: "0",
    amount_nds: "0",
    file_ids: [],
    files: [],
    isNew: true,
  });

  const normalizeRowData = (row: CashTableRow): CashTableRow => {
    const isApiData = !!(row.name && row.name.trim() !== "");
    return {
      ...row,
      isNew: !isApiData,
    };
  };

  const emitUpdate = () => {
    emit("update:tableData", [...editableRows.value]);
    emit("update:totalSumm", Number(totalWithVAT.value));
    emit("update:totalVAT", Number(totalVAT.value));
  };

  const addRow = async () => {
    const newRow = createEmptyRow();
    editableRows.value.push(newRow);
    const newIndex = editableRows.value.length - 1;
    addedRowsIndices.value.push(newIndex);
    showRemoveButton.value = true;

    editingNameIndex.value = newIndex;
    await nextTick();
    nameInputRefs.value[newIndex]?.focus();

    tableMessage.value = "Основание добавлено";
    emitUpdate();
    emit("rows-added", [newIndex]);
  };

  const removeLastRow = () => {
    if (editableRows.value.length <= 1 || addedRowsIndices.value.length === 0) {
      showRemoveButton.value = false;
      return;
    }

    const currentIndices = [...addedRowsIndices.value];
    const lastAddedIndex = currentIndices[currentIndices.length - 1];

    editableRows.value.splice(lastAddedIndex, 1);

    const { [lastAddedIndex]: _, ...rest } = invalidFields.value;
    invalidFields.value = rest;

    addedRowsIndices.value = currentIndices
      .filter((index) => index !== lastAddedIndex)
      .map((index) => (index > lastAddedIndex ? index - 1 : index));

    showRemoveButton.value = addedRowsIndices.value.length > 0;
    tableMessage.value = "Основание удалено";
    emitUpdate();
    emit("rows-removed", lastAddedIndex);
  };

  const handleNameChange = (index: number, event: Event) => {
    const target = event.target as HTMLInputElement;
    editableRows.value[index].name = target.value;
    markFieldAsModified(index, "name");
    validateRow(index);
    emitUpdate();
  };

  const finishNameEditing = (index: number) => {
    editingNameIndex.value = null;
    validateRow(index);
  };

  watch(
    () => props.initialData,
    (newData) => {
      if (JSON.stringify(newData) !== JSON.stringify(editableRows.value)) {
        editableRows.value = newData?.length
          ? newData.map(normalizeRowData)
          : [createEmptyRow()];
        addedRowsIndices.value = [];
        invalidFields.value = {};

        editableRows.value.forEach((_, index) => validateRow(index));
      }
    },
    { immediate: true },
  );

  const getTableData = () => ({
    rows: [...editableRows.value],
    totals: {
      withVAT: Number(totalWithVAT.value),
      VAT: Number(totalVAT.value),
    },
  });

  const setData = (newData: CashTableRow[]) => {
    editableRows.value = [...newData];
    invalidFields.value = {};
    editableRows.value.forEach((_, index) => validateRow(index));
  };

  defineExpose({
    getTableData,
    setData,
  });
</script>

<template>
  <StepsCoreEditableBlock
    title=""
    :headers="headers"
    :model-value="editableRows"
    grid-template-columns="44px 300px 170px 400px 240px"
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
        <template v-if="row.isNew || editingNameIndex === index">
          <input
            :ref="(el) => (nameInputRefs[index] = el as HTMLInputElement)"
            type="text"
            :value="row.name"
            placeholder="Введите название"
            class="name-input"
            :class="[
              'name-input',
              {
                [$style.errorInput]: invalidFields[index]?.includes('name'),
              },
            ]"
            @input="handleNameChange(index, $event)"
            @blur="finishNameEditing(index)"
            @keyup.enter="finishNameEditing(index)"
          />
        </template>
        <template v-else>
          <span>{{ row.name }}</span>
        </template>
      </div>

      <div class="cell body-cell">
        <input
          type="text"
          :value="row.settlement_account_number || ''"
          placeholder="введите номер"
          :class="{
            [$style.errorInput]: invalidFields[index]?.includes(
              'settlement_account_number',
            ),
          }"
          @input="handleSettlementInput($event, index)"
          @blur="handleSettlementBlur(index)"
        />
      </div>

      <div class="cell" :class="$style.cellRow">
        <div>
          <input
            type="text"
            :value="row.amount_with_nds"
            placeholder="0,00"
            pattern="[0-9]*[.,]?[0-9]*"
            :class="[
              $style.inputField,
              {
                [$style.errorInput]: shouldShowNumberError(
                  index,
                  'amount_with_nds',
                ),
              },
            ]"
            @input="handleNumberInput($event, 'amount_with_nds', index)"
            @blur="handleNumberBlur('amount_with_nds', index)"
          />
        </div>
        <div>
          <input
            type="text"
            :value="row.amount_nds"
            placeholder="0,00"
            pattern="[0-9]*[.,]?[0-9]*"
            :class="[
              $style.inputField,
              {
                [$style.errorInput]: shouldShowNumberError(index, 'amount_nds'),
              },
            ]"
            @input="handleNumberInput($event, 'amount_nds', index)"
            @blur="handleNumberBlur('amount_nds', index)"
          />
        </div>
      </div>

      <div class="cell body-cell">
        <StepsCoreFileUploader
          :index="index"
          prefix="cash-kkt-file"
          :loading="fileLoading"
          :multiple="true"
          :max-files="3"
          :files="row.files || []"
          :file-ids="row.file_ids || []"
          :is-required="hasAmountInRow(row, index)"
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
        :total-summ="Number(totalWithVAT)"
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

  .inputField {
    width: 100%;
    padding: 0.25rem 0.375rem;
    border: 1px solid var(--a-borderAccentLight);
    background-color: var(--a-mainBg);
    border-radius: 0.25rem;
    box-sizing: border-box;

    &:focus {
      outline: none;
      border-color: var(--a-borderAccent);
    }
  }

  .errorInput {
    border-color: var(--a-borderError) !important;
    background-color: var(--a-bgErrorLight) !important;
  }
</style>
