<script setup lang="ts">
  interface Props {
    mainTitle?: string;
    stepTitle?: string;
    infoText?: string;
  }

  const {
    mainTitle = "Мои кассы",
    stepTitle = "Добавляйте и редактируйте информацию о Ваших кассах",
    infoText = "",
  } = defineProps<Props>();
</script>

<template>
  <header class="cashiers-header">
    <h2 class="cashiers-header__title">{{ mainTitle }}</h2>
    <h3 class="cashiers-header__step-title">{{ stepTitle }}</h3>
    <p class="cashiers-header__info">
      {{ infoText }}
    </p>
  </header>
</template>

<style scoped lang="scss">
  .cashiers-header {
    &__title {
      margin-bottom: rem(14);
      font-size: rem(26);
      font-weight: bold;
      color: var(--a-accentTextDark);
      text-transform: uppercase;
    }

    &__step {
      display: flex;
      justify-content: center;
      align-content: center;
      width: max-content;
      flex-shrink: 0;
      margin-bottom: rem(30);
      padding: rem(2) rem(12);
      font-size: rem(14);
      font-weight: 600;
      border: 1px solid var(--a-borderAccent);
      border-radius: rem(4);

      &-title {
        margin-bottom: rem(8);
        font-size: rem(18);
        font-weight: bold;
        color: var(--a-mainText);
      }
    }

    &__info {
      margin-bottom: rem(20);
      font-size: rem(16);

      &.bold {
        font-weight: bold;
      }
    }
  }
</style>
