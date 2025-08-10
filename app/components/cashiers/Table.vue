<script setup lang="ts">
  import VueDatePicker from "@vuepic/vue-datepicker";
  import "@vuepic/vue-datepicker/dist/main.css";
  import { formatDate } from "~/utils/date";
  import { useCashiersKktInput } from "~/composables/tables/useCashiersKktInput";
  import { useCashiersTableMethods } from "~/composables/tables/useCashiersTableMethods";

  interface Block {
    id?: string;
    name: string;
    order: number;
    registration_number: string;
    serial_number: string;
    fn_number: string;
    registered_at: Date | null;
    installed_at: Date | null;
    isDirty?: boolean;
  }

  interface Props {
    block: Block;
    invalidFields: Record<string, boolean>;
    index: number;
    isFromApi: boolean;
  }

  const props = defineProps<Props>();
  const emit = defineEmits([
    "update:block",
    "removeBlock",
    "update:invalidFields",
  ]);

  const localBlock = ref<Block>({ ...props.block });
  const index = ref(props.index);

  const isFromApi = computed(() => props.isFromApi);

  const {
    localValue: registrationNumber,
    isInvalid,
    validateRegistrationNumber,
    handleKeyDown,
    inputClasses,
  } = useCashiersKktInput(
    props.block.registration_number || "",
    isFromApi.value,
  );

  const {
    editingTitle,
    titleInput,
    startTitleEditing,
    handleTitleEditEnd,
    validateDigitsInput,
    handleDateChange,
    emitRemoveBlock,
  } = useCashiersTableMethods(localBlock, emit, index);

  watch(
    () => props.block,
    (newVal) => {
      localBlock.value = { ...newVal };
    },
    { deep: true },
  );
</script>

<template>
  <div :class="cashes.table">
    <div :class="cashes.titleWrapper">
      <input
        v-if="editingTitle"
        ref="titleInput"
        v-model="localBlock.name"
        :class="[
          {
            'cashes.editing': editingTitle,
            'error-field': invalidFields[`name-${index}`],
          },
          cashes.titleInput,
        ]"
        type="text"
        placeholder="Введите название кассы"
        @keyup.enter="handleTitleEditEnd"
        @blur="handleTitleEditEnd"
      />
      <p v-else :class="cashes.titleText">
        {{ localBlock.name || "Не указано" }}
      </p>

      <button
        v-if="editingTitle"
        :class="cashes.okBtn"
        type="button"
        @click.stop="handleTitleEditEnd"
      >
        OK
      </button>

      <button
        v-if="!editingTitle"
        :class="cashes.editBtn"
        type="button"
        @click.stop="startTitleEditing"
      >
        <UIcon name="i-edit-icon" :class="cashes.editIcon" />
      </button>
    </div>

    <div :class="cashes.row">
      <div :class="cashes.column">
        <span :class="cashes.colTitle">Регистрационный номер ККТ</span>
        <template v-if="isFromApi">
          <span :class="[cashes.kkt, cashes.kkt]">
            {{ block.registration_number || "Не указан" }}
          </span>
        </template>
        <template v-else>
          <input
            :value="registrationNumber"
            :class="[inputClasses, cashes.input]"
            type="text"
            placeholder="Введите 16 цифр"
            maxlength="16"
            inputmode="numeric"
            pattern="\d{16}"
            @input="validateRegistrationNumber($event)"
            @keydown="handleKeyDown"
          />
          <small v-if="isInvalid" :class="cashes.errorKkt">
            Номер содержит ровно 16 цифр
          </small>
        </template>
      </div>

      <div :class="cashes.column">
        <span :class="cashes.colTitle">Заводской номер ККТ</span>
        <input
          :value="localBlock.serial_number"
          :class="[
            {
              'error-field':
                invalidFields[`serialNum-${index}`] &&
                !localBlock.serial_number?.trim(),
            },
            cashes.input,
          ]"
          type="text"
          placeholder="Введите номер"
          inputmode="numeric"
          pattern="[0-9]*"
          @input="validateDigitsInput($event, 'serial_number')"
        />
      </div>

      <div :class="cashes.column">
        <span :class="cashes.colTitle">Номер фискального накопителя</span>
        <input
          :value="localBlock.fn_number"
          :class="[
            {
              'error-field':
                invalidFields[`fnNum-${index}`] &&
                !localBlock.fn_number?.trim(),
            },
            cashes.input,
          ]"
          type="text"
          placeholder="Введите номер"
          inputmode="numeric"
          pattern="[0-9]*"
          @input="validateDigitsInput($event, 'fn_number')"
        />
      </div>

      <div :class="cashes.column">
        <span :class="cashes.colTitle">Дата постановки на учёт</span>
        <VueDatePicker
          :model-value="localBlock.registered_at"
          :enable-time-picker="false"
          :format="formatDate"
          locale="ru"
          :max-date="new Date()"
          cancel-text="Отмена"
          select-text="Выбрать"
          :input-class-name="
            invalidFields[`regDate-${index}`]
              ? 'custom-datepicker-input error-field'
              : 'custom-datepicker-input'
          "
          placeholder="Выберите дату"
          class="cashes-picker"
          :class="cashes.inputDate"
          @update:model-value="
            (date) => handleDateChange('registered_at', date)
          "
        />
      </div>

      <div :class="cashes.column">
        <span :class="cashes.colTitle">Дата установки в помещении</span>
        <VueDatePicker
          :model-value="localBlock.installed_at"
          :enable-time-picker="false"
          :format="formatDate"
          locale="ru"
          :max-date="new Date()"
          cancel-text="Отмена"
          select-text="Выбрать"
          :input-class-name="
            invalidFields[`instDate-${index}`]
              ? 'custom-datepicker-input error-field'
              : 'custom-datepicker-input'
          "
          placeholder="Выберите дату"
          class="cashes-picker"
          :class="cashes.inputDate"
          @update:model-value="(date) => handleDateChange('installed_at', date)"
        />
      </div>

      <button type="button" :class="cashes.deleteBtn" @click="emitRemoveBlock">
        <UIcon name="i-close-btn" :class="cashes.icon" />
      </button>
    </div>
  </div>
</template>

<style module="cashes" lang="scss">
  .table {
    position: relative;
    display: flex;
    flex-direction: column;
    max-width: rem(1000);
    min-height: rem(80);
    padding: rem(12) rem(24);
    background-color: var(--a-bgTable);
    border-radius: rem(12);
    margin-bottom: rem(20);
    transition: all 0.3s ease;
    -webkit-box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
    -moz-box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);

    &:last-child {
      margin-bottom: 0;
    }
  }

  .titleWrapper {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-right: auto;
    margin-bottom: rem(20);
  }

  .titleInput {
    flex: 1;
    margin-right: auto;
    padding: rem(4) rem(12);
    border: 1px solid var(--a-borderAccentLight);
    border-radius: rem(4);
    font-size: rem(12);
    font-weight: 600;
    background-color: var(--a-bgTable);
    transition: border-color 0.2s ease;

    &:focus {
      outline: none;
      border-color: var(--a-primary);
    }
  }

  .editing {
    background-color: var(--a-white);
  }

  .titleText {
    flex: 1;
    max-width: rem(800);
    margin: 0;
    padding: rem(8) rem(14);
    font-size: rem(13);
    font-weight: 600;
    line-height: 1.2;
    background-color: var(--a-white);
  }

  .okBtn {
    padding: rem(4) rem(12);
    margin-left: rem(8);
    background-color: var(--a-bgAccent);
    color: white;
    border: none;
    border-radius: rem(4);
    cursor: pointer;
    font-size: rem(12);
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--a-bgAccentDark);
    }
  }

  .editBtn {
    position: relative;
    top: -2px;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    width: rem(28);
    height: rem(28);
    background: none;
    border: none;
    cursor: pointer;
    padding: rem(4);
    color: var(--a-primary);
    transition: color 0.2s ease;

    &:hover {
      color: var(--a-primaryDark);
    }
  }

  .editIcon {
    width: rem(24);
    height: rem(24);
  }

  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .column {
    display: flex;
    flex-direction: column;
    align-content: space-between;
    flex: 1;
    gap: rem(10);
  }

  .colTitle {
    max-width: rem(140);
    margin-right: rem(8);
    font-size: rem(12);
    font-weight: 600;
    white-space: wrap;
    line-height: 1.2;
  }

  .kkt {
    display: flex;
    justify-content: center;
    align-content: center;
    max-width: rem(160);
    padding: rem(4) rem(12);
    font-size: rem(12);
    font-weight: 600;
    background-color: var(--a-mainBg);
    border-radius: rem(4);
    box-sizing: border-box;
    cursor: none;
  }

  .errorKkt {
    color: var(--a-errorText);
    font-size: 0.625rem;
    margin-top: 4px;
  }

  .input {
    display: flex;
    justify-content: center;
    align-content: center;
    width: max-content;
    flex-shrink: 0;
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 600;
    background-color: var(--a-mainBg);
    border-radius: 0.25rem;
    max-width: rem(160);
    border: 1px solid var(--a-borderAccentLight);
    box-sizing: border-box;
  }

  .deleteBtn {
    position: absolute;
    top: rem(14);
    right: rem(14);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    &:hover {
      transform: scale(1.1);
    }
  }

  .icon {
    width: rem(22);
    height: rem(22);
    background-color: var(--a-bgAccent);

    &:hover {
      background-color: var(--a-bgAccentDark);
    }
  }

  .inputDate {
    display: flex;
    margin-right: rem(20);
    font-size: rem(12);
  }
</style>

<style lang="scss">
  .error-field {
    border-color: var(--a-error);
  }

  .cashes-picker {
    .dp__input_wrap {
      .dp__input {
        width: rem(170);
        padding: rem(1) rem(12) rem(1) rem(36);
        font-size: rem(12);
        background-color: var(--a-mainBg);
        border: 1px solid var(--a-borderAccentLight);
        border-radius: rem(4);

        &:focus {
          outline: none;
          border-color: var(--a-primary);
        }
      }

      svg {
        padding: 0 rem(8);
      }
    }

    .dp__action_button {
      background-color: var(--a-bgAccentLight);

      &:hover {
        background-color: var(--a-bgAccentDark);
      }
    }

    .dp__pointer {
      padding: 0 rem(10);
      font-size: rem(13);
      font-weight: 600;
      background-color: var(--a-mainBg);

      &:hover {
        color: var(--a-accentTextExDark);
      }
    }
  }
</style>
