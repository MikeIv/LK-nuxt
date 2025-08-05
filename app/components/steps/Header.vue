<script setup lang="ts">
  interface Props {
    mainTitle?: string;
    stepTitle?: string;
    stepText?: string;
    stepCurrent?: number;
    stepTotal?: number;
    infoText?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    mainTitle: "Формирование отчета",
    stepTitle: "",
    stepText: "Шаг {current} из {total}",
    stepCurrent: 1,
    stepTotal: 4,
    infoText: "",
  });

  const computedStepText = computed(() => {
    return props.stepText
      .replace("{current}", props.stepCurrent.toString())
      .replace("{total}", props.stepTotal.toString());
  });
</script>

<template>
  <header :class="$style.wrapper">
    <h2 :class="$style.header">{{ mainTitle }}</h2>
    <h3 :class="$style.title">{{ stepTitle }}</h3>
    <div :class="$style.step">
      <span>{{ computedStepText }}</span>
    </div>
    <p :class="$style.info">
      {{ infoText }}
    </p>
  </header>
</template>

<style module lang="scss">
  .wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  .header {
    margin-bottom: rem(14);
    font-size: rem(26);
    font-weight: bold;
    color: var(--a-accentTextDark);
    text-transform: uppercase;
  }

  .title {
    margin-bottom: rem(8);
    font-size: rem(18);
    font-weight: bold;
    color: var(--a-mainText);
  }

  .step {
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
  }

  .info {
    margin-bottom: rem(20);
    font-size: rem(16);
    font-weight: 600;
  }
</style>
