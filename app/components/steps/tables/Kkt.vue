<script setup lang="ts">
  import { useNumberInput } from "~/composables/useNumberInput";
  import { useSaveFile } from "~/composables/useSaveFile";
  import type { FileData, KktTableRow } from "~/types/tables";
  import { useFileHandling } from "~/composables/useFileHandling";

  interface KktTableProps {
    headers?: unknown[];
    initialData?: KktTableRow[];
    initialAddedRowsIndices?: number[];
    loading?: boolean;
    error?: string | boolean;
  }

  const props = withDefaults(defineProps<KktTableProps>(), {
    headers: () => [],
    initialData: () => [],
    initialAddedRowsIndices: () => [],
    addedRowsIndices: () => [],
    loading: false,
    error: false,
  });

  console.log("HEADER KktTable", props.headers);

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
    editableRows: [...props.initialData] as KktTableRow[],
    kktErrors: {} as Record<number, string>,
    addedRowsCount: 0,
    addedRowsIndices: [] as number[],
    tableMessage: "",
  });

  const {
    editableRows,
    kktErrors,
    addedRowsCount,
    addedRowsIndices,
    tableMessage,
  } = toRefs(state);

  const { handleNumberInput, handleNumberBlur } = useNumberInput(editableRows);
  const { saveFile, loading: fileLoading, error: fileError } = useSaveFile();
  console.log(saveFile);
  console.log(fileError);

  if (editableRows.value.length === 0) {
    editableRows.value.push(createEmptyRow());
  }

  function createEmptyRow(): KktTableRow {
    return {
      id: "",
      name: "",
      registration_number: "",
      start_meter_reading: "",
      end_meter_reading: "",
      amount_without_advance_with_nds: "",
      amount_without_advance_nds: "",
      advance_without_certificates_with_nds: "",
      advance_without_certificates_nds: "",
      file_ids: [],
      files: [],
    };
  }

  const totalWithVAT = computed<number>(() => {
    return editableRows.value.reduce((sum, row) => {
      const xzWithNds = calculateWithNds(row);
      const xzxzWithNds =
        Number(row.advance_without_certificates_with_nds) || 0;
      return sum + xzWithNds + xzxzWithNds;
    }, 0);
  });

  const totalVAT = computed<number>(() => {
    return editableRows.value.reduce((sum, row) => {
      const xzNds = Number(row.amount_without_advance_nds) || 0;
      const zxzxNds = Number(row.advance_without_certificates_nds) || 0;
      return sum + xzNds + zxzxNds;
    }, 0);
  });

  const totalSumm = computed<number>(() => totalWithVAT.value);

  const calculateWithNds = (row: KktTableRow): number => {
    const end = Number(row.end_meter_reading) || 0;
    const start = Number(row.start_meter_reading) || 0;
    return end - start;
  };

  const addRow = (): void => {
    const newRow = createEmptyRow();
    newRow.name = `Касса${editableRows.value.length + 1}`;
    editableRows.value.push(newRow);
    addedRowsIndices.value.push(editableRows.value.length - 1);
    addedRowsCount.value++;
    tableMessage.value = "Добавлена касса";
    emit("rows-added", [...addedRowsIndices.value]);
  };

  const removeLastRow = (): void => {
    if (editableRows.value.length > 1 && addedRowsIndices.value.length > 0) {
      const lastAddedIndex = addedRowsIndices.value.pop();
      if (lastAddedIndex !== undefined) {
        editableRows.value.splice(lastAddedIndex, 1);
        addedRowsIndices.value = addedRowsIndices.value.map((i) =>
          i > lastAddedIndex ? i - 1 : i,
        );
        emit("rows-removed", lastAddedIndex);
      }
      addedRowsCount.value--;
      tableMessage.value = "Касса удалена";
    }
  };

  const handleKktInput = (event: Event, index: number): void => {
    const target = event.target as HTMLInputElement;
    const cursorPosition = target.selectionStart;
    let cleanedValue = target.value.replace(/\D/g, "");
    cleanedValue = cleanedValue.slice(0, 16);

    editableRows.value[index].registration_number = cleanedValue;
    target.value = cleanedValue;

    if (cursorPosition !== null) {
      const newCursorPosition = Math.min(cursorPosition, cleanedValue.length);
      target.setSelectionRange(newCursorPosition, newCursorPosition);
    }

    if (kktErrors.value[index]) {
      kktErrors.value[index] = undefined;
    }

    if (cleanedValue.length === 16) {
      validateKktNumber(index);
    }
  };

  const checkForDuplicates = (index: number): boolean => {
    const currentNumber = editableRows.value[index].registration_number;
    if (!currentNumber) return false;

    return editableRows.value.some(
      (row, i) => row.registration_number === currentNumber && i !== index,
    );
  };

  const validateKktNumber = (index: number): boolean => {
    const kktNumber = editableRows.value[index].registration_number || "";

    if (kktNumber === "") {
      kktErrors.value[index] = undefined;
      return false;
    }

    if (kktNumber.length !== 16) {
      kktErrors.value[index] = "Номер ККТ должен содержать ровно 16 цифр";
      return false;
    }

    if (checkForDuplicates(index)) {
      kktErrors.value[index] = "Этот номер ККТ уже есть в отчете";
      return false;
    }

    kktErrors.value[index] = undefined;
    return true;
  };

  watch(
    () => props.initialData,
    (newData) => {
      if (JSON.stringify(newData) !== JSON.stringify(editableRows.value)) {
        editableRows.value = newData?.length
          ? newData.map((row, index) => ({
              ...createEmptyRow(),
              ...row,
              name: row.name || `Касса${index + 1}`,
              start_meter_reading: row.start_meter_reading || "",
              end_meter_reading: row.end_meter_reading || "",
              amount_without_advance_with_nds:
                row.amount_without_advance_with_nds || "",
              amount_without_advance_nds: row.amount_without_advance_nds || "",
              advance_without_certificates_with_nds:
                row.advance_without_certificates_with_nds || "",
              advance_without_certificates_nds:
                row.advance_without_certificates_nds || "",
            }))
          : [createEmptyRow()];

        addedRowsIndices.value = props.addedRowsIndices || [];
      }
    },
    { immediate: true },
  );

  const { handleFileUploaded, handleFileRemoved } =
    useFileHandling<KktTableRow>({
      editableRows,
      emit,
      getFileIds: (row) => row.file_ids,
      setFileData: (row, fileData) => ({
        ...row,
        files: fileData,
        file_ids: fileData.map((file) => Number(file.id)),
      }),
    });

  const validateMeterReadings = (index: number): void => {
    const startStr = editableRows.value[index].start_meter_reading;
    const endStr = editableRows.value[index].end_meter_reading;

    if (!startStr || !endStr) {
      if (kktErrors.value[index]?.includes("Начальное значение")) {
        kktErrors.value[index] = undefined;
      }
      return;
    }

    const start = parseFloat(startStr.replace(",", ".")) || 0;
    const end = parseFloat(endStr.replace(",", ".")) || 0;

    if (start > end) {
      kktErrors.value[index] =
        "Начальное значение не может быть больше конечного";
    } else if (
      kktErrors.value[index] ===
      "Начальное значение не может быть больше конечного"
    ) {
      kktErrors.value[index] = undefined;
    }
  };

  const handleNumberBlurWrapper = (field: keyof KktTableRow, index: number) => {
    handleNumberBlur(field, index);

    if (field === "start_meter_reading" || field === "end_meter_reading") {
      validateMeterReadings(index);
    }
  };
</script>

<template>
  <StepsCoreEditableBlock
    title=""
    :headers="headers"
    :model-value="editableRows"
    grid-template-columns="40px 120px 160px minmax(140px, 250px) minmax(140px, 250px) minmax(280px, 1fr) minmax(280px, 1fr) 180px"
    :loading="loading"
    :error="error"
    :message="tableMessage"
    add-button-text="Добавить кассу"
    remove-button-text="Отменить добавление"
    is-table
    @add="addRow"
    @remove="removeLastRow"
  >
    <template #row="{ item: row, index }">
      <div class="cell body-cell" :class="$style.centre">{{ index + 1 }}</div>
      <div class="cell body-cell">
        <span v-if="row.name">{{ row.name }}</span>
        <span v-else>Касса {{ index + 1 }}</span>
      </div>
      <div class="cell body-cell">
        <input
          type="text"
          :value="row?.registration_number"
          placeholder="Ровно 16 цифр"
          maxlength="16"
          inputmode="numeric"
          pattern="[0-9]{16}"
          required
          class="required-field"
          :class="{ 'error-input': kktErrors[index] }"
          @input="handleKktInput($event, index)"
          @blur="validateKktNumber(index)"
        />
        <div
          v-if="
            kktErrors[index] &&
            (row?.registration_number || row?.registration_number === '')
          "
          class="body-row__error-message"
        >
          {{ kktErrors[index] }}
        </div>
      </div>
      <div class="cell body-cell">
        <input
          :value="row.start_meter_reading"
          placeholder="0,00"
          pattern="^-?\d*\,?\d*$"
          required
          class="required-field"
          :class="{
            'error-input':
              kktErrors[index] ===
              'Начальное значение не может быть больше конечного',
          }"
          @input="handleNumberInput($event, 'start_meter_reading', index)"
          @blur="handleNumberBlurWrapper('start_meter_reading', index)"
        />
        <div
          v-if="
            kktErrors[index] ===
            'Начальное значение не может быть больше конечного'
          "
          :class="$style.errorMessage"
        >
          {{ kktErrors[index] }}
        </div>
      </div>
      <div class="cell body-cell">
        <input
          :value="row.end_meter_reading"
          placeholder="0,00"
          pattern="^-?\d*\,?\d*$"
          required
          class="required-field"
          :class="{
            'error-input':
              kktErrors[index] ===
              'Начальное значение не может быть больше конечного',
          }"
          @input="handleNumberInput($event, 'end_meter_reading', index)"
          @blur="handleNumberBlurWrapper('end_meter_reading', index)"
        />
        <div
          v-if="
            kktErrors[index] ===
            'Начальное значение не может быть больше конечного'
          "
          :class="$style.errorMessage"
        >
          {{ kktErrors[index] }}
        </div>
      </div>
      <div class="cell" :class="$style.cellRow">
        <div :class="$style.subCell">
          <span>{{ calculateWithNds(row).toFixed(2).replace(".", ",") }}</span>
        </div>
        <div :class="$style.subCell">
          <input
            type="text"
            :value="row.amount_without_advance_nds"
            placeholder="0,00"
            pattern="^-?\d*\,?\d*$"
            required
            @input="
              handleNumberInput($event, 'amount_without_advance_nds', index)
            "
            @blur="handleNumberBlur('amount_without_advance_nds', index)"
          />
        </div>
      </div>
      <div class="cell" :class="$style.cellRow">
        <div>
          <input
            type="text"
            :value="row.advance_without_certificates_with_nds"
            placeholder="0,00"
            pattern="^-?\d*\,?\d*$"
            required
            @input="
              handleNumberInput(
                $event,
                'advance_without_certificates_with_nds',
                index,
              )
            "
            @blur="
              handleNumberBlur('advance_without_certificates_with_nds', index)
            "
          />
        </div>
        <div>
          <input
            type="text"
            :value="row.advance_without_certificates_nds"
            placeholder="0,00"
            pattern="^-?\d*\,?\d*$"
            required
            @input="
              handleNumberInput(
                $event,
                'advance_without_certificates_nds',
                index,
              )
            "
            @blur="handleNumberBlur('advance_without_certificates_nds', index)"
          />
        </div>
      </div>
      <div class="cell body-cell">
        <StepsCoreFileUploader
          :index="index"
          prefix="kkt-file"
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
        :total-summ="Number(totalSumm)"
        :total-v-a-t="Number(totalVAT)"
      />
    </template>
  </StepsCoreEditableBlock>
</template>

<style module lang="scss">
  .cellRow {
    display: flex;
    align-items: center;
    gap: rem(8);
    font-size: rem(12);
    font-weight: bold;
    border-right: 1px solid var(--a-borderLght);
    background-color: var(--a-bgTable);
    border-bottom: 1px solid var(--a-borderAccentLight);

    & input {
      width: 100%;
      padding: 0.25rem 0.375rem;
      border: 1px solid var(--a-borderAccentLight);
      background-color: var(--a-mainBg);
      border-radius: 0.25rem;
      box-sizing: border-box;
    }
  }

  .subCell {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 50%;
  }

  .centre {
    align-items: center;
  }

  .errorMessage {
    color: var(--a-errorText);
    font-size: rem(10);
    margin-top: rem(4);
  }
</style>
