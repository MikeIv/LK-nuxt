<script setup lang="ts">
  const props = defineProps({
    addButtonText: {
      type: String,
      default: "Добавить",
    },
    removeButtonText: {
      type: String,
      default: "Удалить",
    },
    messageButton: {
      type: String,
      default: "",
    },
    rowCount: {
      type: Number,
      required: true,
    },
    minRows: {
      type: Number,
      default: 1,
    },
    showRemove: {
      type: Boolean,
      default: undefined,
    },
  });

  const internalMessage = ref("");
  const internalIsError = ref(false);
  let timeoutId: number | null = null;

  const showTableMessage = (message: string, error = false) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    internalMessage.value = message;
    internalIsError.value = error;

    timeoutId = setTimeout(() => {
      internalMessage.value = "";
      timeoutId = null;
    }, 1000);
  };

  watch(
    () => props.messageButton,
    (newValue) => {
      if (newValue) {
        showTableMessage(newValue);
      }
    },
    { immediate: true },
  );

  const emit = defineEmits(["add", "remove"]);
</script>

<template>
  <div v-if="addButtonText" :class="$style.row">
    <div :class="$style.actions">
      <button :class="[$style.button, $style.accentBtn]" @click="emit('add')">
        {{ addButtonText }}
      </button>
    </div>
    <div
      v-if="showRemove !== false && (showRemove === true || rowCount > minRows)"
      :class="$style.actions"
    >
      <button
        :class="[$style.button, $style.secondBtn]"
        :disabled="rowCount <= minRows"
        @click="emit('remove')"
      >
        {{ removeButtonText }}
      </button>
    </div>
    <transition name="fade">
      <div
        v-if="internalMessage"
        :class="[
          $style.button,
          $style.messageBtn,
          {
            error: internalIsError,
          },
        ]"
      >
        {{ internalMessage }}
      </div>
    </transition>
  </div>
</template>

<style module lang="scss">
  .row {
    position: relative;
    display: flex;
    align-items: center;
    gap: rem(18);
  }

  .actions {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .button {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: rem(4) rem(12);
    font-size: rem(14);
    font-weight: 600;
    color: var(--a-white);
    border-radius: rem(4);
    cursor: pointer;
  }

  .accentBtn {
    background-color: var(--a-bgAccentLight);

    &:hover {
      color: var(--a-white);
      background-color: var(--a-bgAccentDark);
      transition: background-color 0.3s;
    }
  }

  .secondBtn {
    background-color: var(--a-bgGray);

    &:hover {
      color: var(--a-white);
      background-color: var(--a-bgGrayDark);
      transition: background-color 0.3s;
    }
  }

  .messageBtn {
    background-color: var(--a-bgGreen);
    cursor: none;

    &.error {
      background-color: var(--a-errorText);
    }
  }
</style>

<style lang="scss">
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
