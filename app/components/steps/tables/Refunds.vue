<script setup lang="ts">
  import type { RefundsTableRow } from "~/types/tables";
  import { useKktInput } from "~/composables/tables/useKktInput";
  import { useNumberFields } from "~/composables/tables/useNumberFields";
  import { useCashCalculations } from "~/composables/tables/useCashCalculations";

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
      value: number | RefundsTableRow[],
    ): void;
    (e: "rows-added", indices: number[]): void;
    (e: "rows-removed", index: number): void;
    (
      e: "files-uploaded",
      payload: { index: number; filesData: FileData },
    ): void;
    (e: "file-removed", payload: { index: number }): void;
  }>();

  // Реактивные данные
  const editableRows = ref<RefundsTableRow[]>([]);
  const addedRowsIndices = ref<number[]>([]);
  const editingNameIndex = ref<number | null>(null);
  const nameInputRefs = ref<HTMLInputElement[]>([]);
  const tableMessage = ref("");
  const showRemoveButton = ref(false);
  const invalidFields = ref<Record<number, string[]>>({});
  const kktErrors = ref<Record<number, string>>({});

  // Composable
  const fieldValidations = {
    returns_goods_services_with_nds: { required: true, min: 0 },
    returns_goods_services_nds: { required: true, min: 0 },
    gift_certificates_sold_with_nds: { required: true, min: 0 },
    gift_certificates_sold_nds: { required: true, min: 0 },
  } as const;

  const numberErrors = ref<Record<number, string>>({});

  const { handleNumberInput, handleNumberBlur, shouldShowError } =
    useNumberFields(editableRows, numberErrors, fieldValidations);
  const { loading: fileLoading } = useSaveFile();
  const { handleFileUploaded, handleFileRemoved } =
    useFileHandling<RefundsTableRow>({
      editableRows,
      emit,
      getFileId: (row) => row.file_id,
      setFileData: (row, fileData) => ({
        ...row,
        file: fileData ? { ...fileData } : undefined,
        file_id: fileData ? Number(fileData.id) : null,
      }),
    });

  const {
    handleKktInput,
    validateKktNumber,
    shouldShowError: shouldShowErrorKkt,
  } = useKktInput(editableRows, kktErrors, emit);

  const validateRow = (index: number) => {
    const errors: string[] = [];
    const row = editableRows.value[index];

    if (!row.name?.trim()) errors.push("name");
    if (shouldShowErrorKkt(index)) errors.push("registration_number");

    const fieldsToValidate = [
      "returns_goods_services_with_nds",
      "returns_goods_services_nds",
      "gift_certificates_sold_with_nds",
      "gift_certificates_sold_nds",
    ];

    fieldsToValidate.forEach((field) => {
      if (shouldShowError(index, field)) errors.push(field);
    });

    invalidFields.value = {
      ...invalidFields.value,
      [index]: errors,
    };

    return errors.length === 0;
  };

  const { totalWithVAT, totalVAT } = useCashCalculations(editableRows);

  // Методы
  const createEmptyRow = (): RefundsTableRow => ({
    id: "",
    name: "",
    registration_number: "",
    returns_goods_services_with_nds: "",
    returns_goods_services_nds: "",
    gift_certificates_sold_with_nds: "",
    gift_certificates_sold_nds: "",
    file_id: null,
    file: undefined,
    isNew: true,
  });

  const normalizeRowData = (row: RefundsTableRow): RefundsTableRow => ({
    ...createEmptyRow(),
    ...row,
    isNew: false,
  });

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
    if (
      editableRows.value.length === 0 ||
      addedRowsIndices.value.length === 0
    ) {
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
    validateRow(index);
  };

  const finishNameEditing = (index: number) => {
    editingNameIndex.value = null;
    validateRow(index);
  };

  // Watchers
  watch(
    () => props.initialData,
    (newData) => {
      if (JSON.stringify(newData) !== JSON.stringify(editableRows.value)) {
        editableRows.value = newData?.length
          ? newData.map(normalizeRowData)
          : [createEmptyRow()];
        addedRowsIndices.value = [];
        invalidFields.value = {};
        showRemoveButton.value = false;
      }
    },
    { immediate: true },
  );

  watch(totalWithVAT, () => emitUpdate());
  watch(totalVAT, () => emitUpdate());
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
        <template v-if="row.isNew || editingNameIndex === index">
          <input
            :ref="(el) => (nameInputRefs[index] = el as HTMLInputElement)"
            type="text"
            :value="row.name"
            placeholder="Введите название"
            class="name-input"
            :class="[
              'name-input',
              { [$style.errorInput]: invalidFields[index]?.includes('name') },
            ]"
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
          required
          :class="[
            $style.inputField,
            {
              [$style.errorInput]: invalidFields[index]?.includes(
                'registration_number',
              ),
            },
          ]"
          @input="handleKktInput($event, index)"
          @blur="validateKktNumber(index)"
        />
        <div
          v-if="invalidFields[index]?.includes('registration_number')"
          :class="$style.errorMessage"
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
            required
            :class="[
              $style.inputField,
              {
                [$style.errorInput]: shouldShowError(
                  index,
                  'returns_goods_services_with_nds',
                ),
                [$style.requiredField]:
                  fieldValidations['returns_goods_services_with_nds']?.required,
              },
            ]"
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
            required
            :class="[
              $style.inputField,
              {
                [$style.errorInput]: shouldShowError(
                  index,
                  'returns_goods_services_nds',
                ),
                [$style.requiredField]:
                  fieldValidations['returns_goods_services_nds']?.required,
              },
            ]"
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
            required
            :class="[
              $style.inputField,
              {
                [$style.errorInput]: shouldShowError(
                  index,
                  'gift_certificates_sold_with_nds',
                ),
                [$style.requiredField]:
                  fieldValidations['gift_certificates_sold_with_nds']?.required,
              },
            ]"
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
            required
            :class="[
              $style.inputField,
              {
                [$style.errorInput]: shouldShowError(
                  index,
                  'gift_certificates_sold_nds',
                ),
                [$style.requiredField]:
                  fieldValidations['gift_certificates_sold_nds']?.required,
              },
            ]"
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
          @file-uploaded="
            ({ fileData }) => handleFileUploaded({ index, filesData: fileData })
          "
          @file-removed="() => handleFileRemoved({ index })"
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

  .editable {
    cursor: pointer;
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

  .requiredField:not(:focus):placeholder-shown {
    border-color: var(--a-borderError);
  }

  .errorInput {
    border-color: var(--a-borderError);
  }

  .errorMessage {
    color: var(--a-errorText);
    font-size: rem(10);
    margin-top: rem(4);
  }
</style>
