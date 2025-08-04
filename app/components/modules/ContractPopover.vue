<script setup lang="ts">
  import { Popover, PopoverButton, PopoverPanel } from "@headlessui/vue";

  defineProps({
    isLoading: { type: Boolean, default: false },
    hasContractsToShow: { type: Boolean, default: false },
    filteredContracts: { type: Array, default: () => [] },
  });

  const emit = defineEmits(["change"]);

  const handleContractChange = (contractId: number, close: () => void) => {
    emit("change", contractId);
    close();
  };
</script>

<template>
  <Popover v-slot="{ close }" :class="$style.popover">
    <PopoverButton
      :class="[$style.btn, $style.btnSwitch]"
      :disabled="!hasContractsToShow || isLoading"
      aria-label="Переключиться между договорами"
    >
      <UIcon name="i-switch" :class="$style.iconSwitch" />
      <span :class="$style.btnText">Переключиться</span>
    </PopoverButton>

    <PopoverPanel v-if="hasContractsToShow" :class="$style.popoverBlock">
      <ul :class="$style.switchList">
        <li
          v-for="contract in filteredContracts"
          :key="`contract-${contract.id}`"
          class="hover:bg-primary-300 p-6 text-[26px] transition-colors main-header__switch-item"
          aria-role="button"
          @click="() => handleContractChange(contract.id, close)"
        >
          {{ contract?.name || `Договор ${contract.id}` }}
        </li>
      </ul>
    </PopoverPanel>
  </Popover>
</template>

<style module lang="scss">
  @use "@/assets/styles/variables/_z-index.scss" as z;

  .popover {
    display: flex;
    width: 100%;
  }

  .btn {
    display: flex;
    align-items: center;
    width: 100%;
    padding: rem(10) rem(12);
    font-size: rem(16);
    font-weight: bold;
    transition: background-color 0.2s ease;

    &:focus {
      outline: none;
      box-shadow: 0 0 0 1px var(--a-bgAccent);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .btnSwitch {
    border: 1px solid var(--a-bgAccent);
    border-radius: 0 0 rem(8) rem(8);
    cursor: pointer;

    &:hover:not(:disabled) {
      background-color: var(--a-bgAccent);
    }
  }

  .btnText {
    margin-left: rem(10);
  }

  .iconSwitch {
    display: flex;
    justify-content: center;
    align-items: center;
    width: rem(24);
    height: rem(24);
    color: var(--a-white);
  }

  .popoverBlock {
    position: absolute;
    right: rem(40);
    top: rem(108);
    border: 1px solid var(--a-borderAccentLight);
    border-radius: rem(8);
    background-color: var(--a-mainBg);
    z-index: z.z(modal, nav-menu);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .switchList {
    display: flex;
    flex-direction: column;
    max-height: 60vh;
    overflow-y: auto;
  }
</style>
