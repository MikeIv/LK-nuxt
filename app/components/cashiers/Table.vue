<script setup lang="ts">
  import VueDatePicker from "@vuepic/vue-datepicker";
  import "@vuepic/vue-datepicker/dist/main.css";

  const props = defineProps({
    block: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    invalidFields: {
      type: Object,
      required: true,
    },
  });

  const emit = defineEmits([
    "update:block",
    "removeBlock",
    "update:invalidFields",
  ]);

  const localBlock = ref({ ...props.block });
  const editingTitle = ref(false);
  const titleInput = ref<HTMLInputElement | null>(null);

  const isFromApi = computed(() => !!localBlock.value.id);

  watch(
    () => props.block,
    (newVal) => {
      localBlock.value = { ...newVal };
    },
    { deep: true },
  );

  const formatDate = (date: string | null): string => {
    if (!date) return "--.--.----";
    return new Date(date)
      .toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, ".");
  };

  const updateLocalBlock = (field: string, value: unknown) => {
    localBlock.value = {
      ...localBlock.value,
      [field]: value,
      isDirty: true,
    };
    emit("update:block", localBlock.value);
  };

  const startTitleEditing = () => {
    editingTitle.value = true;
    nextTick(() => {
      if (titleInput.value) {
        titleInput.value.focus();
        titleInput.value.setSelectionRange(0, titleInput.value.value.length);
      }
    });
  };

  const handleTitleEditEnd = () => {
    if (!localBlock.value.name.trim()) {
      updateLocalBlock("name", `Касса ${localBlock.value.order}`);
    }
    editingTitle.value = false;
    emit("update:block", localBlock.value);
  };

  const validateRegistrationNumber = (event: Event) => {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, "");

    if (value.length > 16) {
      value = value.slice(0, 16);
    }

    updateLocalBlock("registration_number", value);

    if (value.length === 16) {
      const updatedInvalidFields = Object.fromEntries(
        Object.entries(props.invalidFields).filter(
          ([key]) => key !== `regNum-${props.index}`,
        ),
      );
      emit("update:invalidFields", updatedInvalidFields);
    }
  };

  console.log(
    "Current registration number:",
    localBlock.value.registration_number,
  );
  console.log("Invalid fields:", props.invalidFields);

  const validateDigitsInput = (event: Event, field: string) => {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, "");
    updateLocalBlock(field, value);
  };

  const handleDateChange = (field: string, date: Date | null) => {
    updateLocalBlock(field, date);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!/[0-9]|Backspace|Delete|ArrowLeft|ArrowRight|Tab/.test(event.key)) {
      event.preventDefault();
    }
  };

  const emitRemoveBlock = () => {
    emit("removeBlock", localBlock.value);
  };
</script>

<template>
  <div :class="cashes.table">
    <div :class="cashes.titleWrapper">
      <input
        v-if="editingTitle"
        ref="titleInput"
        :value="localBlock.name"
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
        @input="updateLocalBlock('name', $event.target.value)"
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
        <input
          :value="localBlock.registration_number"
          :class="[
            {
              'readonly-input': isFromApi,
              'error-field':
                invalidFields[`regNum-${index}`] ||
                (localBlock.registration_number &&
                  localBlock.registration_number.length !== 16),
            },
            cashes.input,
          ]"
          type="text"
          placeholder="Введите 16 цифр"
          :readonly="isFromApi"
          maxlength="16"
          inputmode="numeric"
          pattern="\d{16}"
          @input="validateRegistrationNumber($event)"
          @keydown="handleKeyDown"
        />
        <small
          v-if="
            localBlock.registration_number &&
            localBlock.registration_number.length !== 16
          "
          class="casher-block__error-hint"
        >
          Номер содержит ровно 16 цифр
        </small>
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
          :class="[
            {
              'error-data-field': invalidFields[`regDate-${index}`],
            },
            cashes.inputDate,
          ]"
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
          :class="[
            {
              'error-data-field': invalidFields[`instDate-${index}`],
            },
            cashes.inputDate,
          ]"
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
    top: rem(24);
    right: rem(22);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon {
    width: rem(22);
    height: rem(22);
    background-color: var(--a-bgAccent);
  }

  .inputDate {
    display: flex;
    margin-right: rem(20);
    font-size: rem(12);
  }
</style>

<style lang="scss">
  .error-field {
    border-color: var(--a-error) !important;
  }

  .dp__input_wrap {
    .dp__input {
      width: rem(170) !important;
      padding-left: rem(34) !important;
      font-size: rem(12) !important;
      background-color: var(--a-mainBg) !important;
      border: 1px solid var(--a-borderAccentLight) !important;
      border-radius: rem(4) !important;

      &:focus {
        outline: none;
        border-color: var(--a-primary) !important;
      }
    }

    svg {
      padding: 0 rem(8) !important;
    }
  }

  .dp__action_button {
    background-color: var(--a-bgAccentLight) !important;

    &:hover {
      background-color: var(--a-bgAccentDark) !important;
    }
  }

  .dp__pointer {
    padding: 0 rem(10) !important;
    font-size: rem(13) !important;
    font-weight: 600 !important;
    background-color: var(--a-mainBg) !important;

    &:hover {
      color: var(--a-accentTextExDark) !important;
    }
  }
</style>
