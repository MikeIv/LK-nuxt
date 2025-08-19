<script setup lang="ts">
  import VueDatePicker from "@vuepic/vue-datepicker";
  import "@vuepic/vue-datepicker/dist/main.css";
  import { formatDate } from "~/utils/date";

  const props = defineProps<{
    modelValue: [Date, Date] | null;
  }>();

  const emit = defineEmits(["update:modelValue"]);

  const dateValue = computed({
    get: () => props.modelValue,
    set: (val) => emit("update:modelValue", val),
  });

  const formatDisplayValue = (dates: Date[] | null): string => {
    if (!dates || dates.length !== 2) return "Выберите период";
    return `${formatDate(dates[0])} - ${formatDate(dates[1])}`;
  };
</script>

<template>
  <VueDatePicker
    v-model="dateValue"
    range
    :enable-time-picker="false"
    :format="formatDisplayValue"
    locale="ru"
    :max-range="365"
    :max-date="new Date()"
    cancel-text="Отмена"
    select-text="Выбрать"
    :input-class-name="'custom-datepicker-input'"
    placeholder="выберите период"
    class="date-range-picker"
  >
    <template #input-value="{ value: inputValue }">
      <span v-if="inputValue?.length === 2">
        {{ formatDisplayValue(inputValue) }}
      </span>
      <span v-else> Выберите период </span>
    </template>
  </VueDatePicker>
</template>

<style lang="scss">
  .date-range-picker {
    position: relative;
    display: flex;
    max-width: rem(280);
    padding: 0;

    & .dp__input_wrap {
      display: flex;
      flex-grow: 1;
      width: 100%;
      color: var(--a-mainText);
    }

    & .dp__outer_menu_wrap {
      left: 0 !important;
    }

    & .dp__input {
      display: flex;
      width: 100%;
      padding: 0.125rem 1.5rem 0.125rem 2.25rem;
      font-size: 0.75rem;
      font-weight: 600;
      font-family: Montserrat, sans-serif;
      border: none;

      :hover {
        border-color: var(--a-borderAccent);
        outline: none;
        transition: all 0.4s ease-in-out;
      }

      ::placeholder {
        font-size: rem(12);
        font-weight: 500;
        font-family: "Montserrat", sans-serif;
        color: var(--a-bgDark);

        &:hover {
          color: var(--a-bgDark);
          transition: all 0.4s ease-in-out;
        }
      }

      &.dp__pointer {
        color: var(--a-mainText);
        background-color: var(--a-mainBg);

        &:hover {
          color: var(--a-accentTextExDark);
        }
      }
    }

    .dp__today {
      background-color: var(--a-mainBg);
      border: 1px solid var(--a-borderAccent);
    }

    .dp--header-wrap {
      background-color: var(--a-mainBg);
    }

    .dp__range_start {
      background-color: var(--a-bgAccentDark);
    }

    .dp__range_end {
      background-color: var(--a-bgAccentDark);
    }

    .dp__icon {
      &:hover {
        fill: var(--a-bgWarning);
      }
    }

    .dp__action_buttons {
      display: flex;
      align-items: center;
      gap: rem(12);

      & .dp__action_button {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: rem(28);
        padding: rem(8) rem(12);
        border: none;
      }

      & .dp__action_cancel {
        font-weight: 600;
        color: var(--a-lightText);
        background-color: var(--a-bgWarning);

        &:hover {
          color: var(--a-mainText);
          background-color: var(--a-bgWarningHover);
        }
      }

      & .dp__action_select {
        font-weight: 600;
        background-color: var(--a-bgAccentDark);

        &:hover {
          color: var(--a-mainText);
          background-color: var(--a-bgAccent);
        }
      }
    }
  }

  .date-text {
    font-size: rem(12);
    font-weight: 600;
    font-family: "Montserrat", sans-serif;
  }
</style>
