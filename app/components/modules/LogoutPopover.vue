<script setup lang="ts">
  import { Popover, PopoverButton, PopoverPanel } from "@headlessui/vue";

  defineProps({
    isLoading: { type: Boolean, default: false },
    showBg: { type: Boolean, default: false },
  });

  const emit = defineEmits(["confirm", "showConfirm"]);

  const handleConfirm = (proceed: boolean) => {
    emit("confirm", proceed);
  };
</script>

<template>
  <Popover v-slot="{ open, close }">
    <PopoverButton
      :class="$style.logout"
      aria-label="Выйти из аккаунта"
      :disabled="isLoading"
    >
      <UIcon name="i-logout" :class="$style.iconLogout" />
      <span :class="$style.btnText">Выйти из аккаунта</span>
    </PopoverButton>

    <div v-if="open" :class="$style.popupBg" @click="showBg" />

    <PopoverPanel v-if="open" :class="$style.confirm" static>
      <div :class="$style.content">
        <UIcon name="i-exclamation" :class="$style.icon" />
        <h3 :class="$style.title">Подтверждение выхода</h3>
        <p :class="$style.message">Все не сохраненные данные будут утеряны</p>

        <div :class="$style.buttons">
          <button
            :class="[$style.btn, $style.btnContinue]"
            @click="handleConfirm(true)"
          >
            Продолжить
          </button>
          <button :class="[$style.btn, $style.btnCancel]" @click="close">
            Вернуться
          </button>
        </div>
      </div>
    </PopoverPanel>
  </Popover>
</template>

<style module lang="scss">
  @use "@/assets/styles/variables/_z-index.scss" as z;

  .logout {
    display: flex;
    align-items: center;
    width: 100%;
    padding: rem(10) rem(12);
    font-size: rem(16);
    font-weight: bold;
    transition: background-color 0.2s ease;
    background-color: var(--a-bgAccentExLight);
    border-top-left-radius: rem(8);
    border-top-right-radius: rem(8);
    cursor: pointer;

    &:focus {
      outline: none;
      box-shadow: 0 0 0 1px var(--a-bgAccent);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &:hover:not(:disabled) {
      background-color: var(--a-bgAccent);
    }
  }

  .btnText {
    margin-left: rem(10);
  }

  .iconLogout {
    display: flex;
    justify-content: center;
    align-items: center;
    width: rem(24);
    height: rem(24);
    color: var(--a-white);
  }

  .confirm {
    position: fixed;
    top: 50%;
    left: 50%;
    max-width: rem(400);
    width: 90%;
    padding: rem(20);
    background: var(--a-mainBg);
    border-radius: rem(8);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    transform: translate(-50%, -50%);
    z-index: z.z(modal, content);
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .icon {
    width: rem(40);
    height: rem(40);
    color: var(--a-bgWarning);
    margin-bottom: rem(10);
  }

  .title {
    margin-bottom: rem(10);
    font-size: rem(18);
    font-weight: bold;
    color: var(--a-accentTextExDark);
  }

  .message {
    font-size: rem(14);
    font-weight: 600;
    margin-bottom: rem(40);
    color: var(--a-bgWarning);
  }

  .buttons {
    display: flex;
    gap: rem(18);
    width: 100%;
  }

  .btn {
    flex: 1;
    padding: rem(6) rem(14);
    border-radius: rem(4);
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btnContinue {
    background-color: var(--a-bgWarning);
    color: var(--a-white);

    &:hover {
      background-color: var(--a-bgWarningHover);
    }
  }

  .btnCancel {
    background-color: var(--a-bgAccentExLight);
    color: var(--a-accentTextExDark);

    &:hover {
      background-color: var(--a-bgAccentDark);
    }
  }

  .popupBg {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: z.z(modal, overlay);
  }
</style>
