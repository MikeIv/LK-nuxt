<script setup lang="ts">
  import type { RefundsTableRow, FileData } from "~/types/tables";
  import { useKktInput } from "~/composables/tables/useKktInput";
  import { useNumberFields } from "~/composables/tables/useNumberFields";
  import { useRefundsCalculations } from "~/composables/tables/useRefundsCalculations";
  import { useSaveFile } from "~/composables/useSaveFile";
  import { useFileHandling } from "~/composables/useFileHandling";

  interface RefundsTableProps {
    headers?: unknown[];
    initialData?: RefundsTableRow[];
    initialAddedRowsIndices?: number[];
    loading?: boolean;
    error?: string | boolean;
  }

  const props = withDefaults(defineProps<RefundsTableProps>(), {
    headers: () => [],
    initialData: () => [],
    initialAddedRowsIndices: () => [],
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
    editableRows: [...props.initialData] as RefundsTableRow[],
    kktErrors: {} as Record<number, string>,
    numberErrors: {} as Record<number, string>,
    addedRowsCount: 0,
    addedRowsIndices: [] as number[],
    tableMessage: "",
  });

  const {
    editableRows,
    kktErrors,
    numberErrors,
    addedRowsCount,
    addedRowsIndices,
    tableMessage,
  } = toRefs(state);

  const { loading: fileLoading } = useSaveFile();

  if (editableRows.value.length === 0) {
    editableRows.value.push(createEmptyRow());
  }

  function createEmptyRow(): RefundsTableRow {
    return {
      id: "",
      name: "",
      registration_number: "",
      returns_goods_services_with_nds: "",
      returns_goods_services_nds: "",
      gift_certificates_sold_with_nds: "",
      gift_certificates_sold_nds: "",
      file_ids: [],
      files: [],
    };
  }

  const showRemoveButton = ref(false);

  const addRow = (): void => {
    showRemoveButton.value = true;
    const newRow = createEmptyRow();
    newRow.name = `Основание ${editableRows.value.length + 1}`;
    editableRows.value.push(newRow);
    addedRowsIndices.value.push(editableRows.value.length - 1);
    addedRowsCount.value++;
    tableMessage.value = "Добавлено основание";
    emit("rows-added", [...addedRowsIndices.value]);
  };

  const removeLastRow = (): void => {
    if (editableRows.value.length > 1 && addedRowsIndices.value.length > 0) {
      const lastAddedIndex = addedRowsIndices.value.pop();
      if (lastAddedIndex !== undefined) {
        showRemoveButton.value = false;
        editableRows.value.splice(lastAddedIndex, 1);
        addedRowsIndices.value = addedRowsIndices.value.map((i) =>
          i > lastAddedIndex ? i - 1 : i,
        );
        emit("rows-removed", lastAddedIndex);
      }
      addedRowsCount.value--;
      tableMessage.value = "Основание удалено";
    }
  };

  const { totalWithVAT, totalVAT } = useRefundsCalculations(editableRows);

  watch(
    () => props.initialData,
    (newData) => {
      if (JSON.stringify(newData) !== JSON.stringify(editableRows.value)) {
        editableRows.value = newData?.length
          ? newData.map((row, index) => ({
              ...createEmptyRow(),
              ...row,
              name: row.name || `Основание ${index + 1}`,
              returns_goods_services_with_nds:
                row.returns_goods_services_with_nds || "",
              returns_goods_services_nds: row.returns_goods_services_nds || "",
              gift_certificates_sold_with_nds:
                row.gift_certificates_sold_with_nds || "",
              gift_certificates_sold_nds: row.gift_certificates_sold_nds || "",
            }))
          : [createEmptyRow()];

        addedRowsIndices.value = props.initialAddedRowsIndices || [];
      }
    },
    { immediate: true },
  );

  const {
    handleKktInput,
    validateKktNumber,
    shouldShowError: shouldShowErrorKkt,
  } = useKktInput(editableRows, kktErrors, emit);

  const fieldValidations = {
    returns_goods_services_with_nds: { required: true, min: 0 },
    returns_goods_services_nds: { required: true, min: 0 },
    gift_certificates_sold_with_nds: { required: true, min: 0 },
    gift_certificates_sold_nds: { required: true, min: 0 },
  } as const;

  const { handleNumberInput, handleNumberBlur, shouldShowError } =
    useNumberFields(editableRows, numberErrors, fieldValidations);

  const { handleFileUploaded, handleFileRemoved } =
    useFileHandling<RefundsTableRow>({
      editableRows,
      emit,
      getFileIds: (row) => row.file_ids,
      setFileData: (row, fileData) => ({
        ...row,
        files: fileData,
        file_ids: fileData.map((file) => Number(file.id)),
      }),
    });

  const getTableData = () => ({
    rows: [...editableRows.value],
    totals: {
      withVAT: Number(totalWithVAT.value),
      VAT: Number(totalVAT.value),
    },
  });

  const setData = (newData: RefundsTableRow[]) => {
    editableRows.value = [...newData];
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
    grid-template-columns="44px 120px 160px 300px 300px 240px"
    :loading="loading"
    :error="error"
    :message="tableMessage"
    add-button-text="Добавить основание"
    remove-button-text="Отменить добавление"
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
        <span v-if="row.name">{{ row.name }}</span>
        <span v-else>Основание {{ index + 1 }}</span>
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
            { [$style.errorInput]: shouldShowErrorKkt(index) },
          ]"
          @input="handleKktInput($event, index)"
          @blur="validateKktNumber(index)"
        />
        <div v-if="shouldShowErrorKkt(index)" :class="$style.errorMessage">
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
              (e) => {
                const value = e.target.value.replace(',', '.');
                handleNumberInput(
                  { target: { value } },
                  'returns_goods_services_with_nds',
                  index,
                );
              }
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
          :index="index"
          prefix="refunds-file"
          :loading="fileLoading"
          :multiple="true"
          :max-files="10"
          :files="row.files || []"
          :file-ids="row.file_ids || []"
          :is-required="true"
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
