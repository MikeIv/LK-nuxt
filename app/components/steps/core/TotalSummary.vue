<script setup lang="ts">
  const props = defineProps({
    totalSumm: {
      type: Number,
      required: true,
      validator: (value: unknown) => typeof value === "number",
    },
    totalVAT: {
      type: Number,
      required: true,
      validator: (value: unknown) => typeof value === "number",
    },
  });

  const formatCurrency = (value: number): string => {
    if (typeof value !== "number" || isNaN(value)) {
      return formatCurrency(0);
    }
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
      .format(value)
      .replace("₽", "руб.");
  };

  const totalWithoutVAT = computed(() => {
    const sum = Number(props.totalSumm) || 0;
    const vat = Number(props.totalVAT) || 0;
    return sum - vat;
  });
</script>

<template>
  <div :class="$style.summary">
    <span :class="$style.label">Итого сумма:</span>

    <div :class="$style.item">
      <span :class="$style.description">с учетом НДС</span>
      <span :class="$style.value">{{ formatCurrency(totalSumm) }}</span>
    </div>
    <div :class="$style.item">
      <span :class="$style.description">без учета НДС</span>
      <span :class="$style.value">{{ formatCurrency(totalWithoutVAT) }}</span>
    </div>

    <div :class="$style.item">
      <span :class="$style.description">НДС</span>
      <span :class="$style.value">{{ formatCurrency(totalVAT) }}</span>
    </div>
  </div>
</template>

<style module lang="scss">
  .summary {
    display: flex;
    align-items: center;
    gap: rem(24);
    padding: rem(12);
    background-color: var(--color-primary-50);
    border-radius: rem(4);
  }

  .label {
    font-size: rem(16);
    font-weight: 600;
  }

  .item {
    display: flex;
    align-items: center;
    gap: rem(8);
  }

  .description {
    font-size: rem(14);
    font-weight: 600;
    color: var(--a-mainText);
  }

  .value {
    font-size: rem(18);
    font-weight: 600;
    color: var(--a-bgAccentDark);
  }
</style>
