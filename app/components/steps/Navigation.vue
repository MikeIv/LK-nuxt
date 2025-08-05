<script setup lang="ts">
  interface Props {
    step: string | number;
    showBack?: boolean;
    showNext?: boolean;
  }

  withDefaults(defineProps<Props>(), {
    showBack: true,
    showNext: true,
  });

  defineOptions({
    inheritAttrs: true,
  });
</script>

<template>
  <div v-bind="$attrs" :class="$style.navigation">
    <slot name="back">
      <NuxtLink
        v-if="showBack"
        :to="`/record/${Math.max(1, Number(step) - 1)}`"
        class="btn"
      >
        Назад
      </NuxtLink>
    </slot>

    <slot name="action" />

    <slot name="next">
      <NuxtLink v-if="showNext" :to="`/record/${Number(step) + 1}`" class="btn">
        Далее
      </NuxtLink>
    </slot>
  </div>
</template>

<style module lang="scss">
  .navigation {
    display: flex;
    gap: rem(20);
    align-items: center;
    margin-top: auto;
    font-size: rem(14);
    font-weight: 600;
  }
</style>
