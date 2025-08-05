<script setup lang="ts">
  interface Props {
    text?: string;
  }

  withDefaults(defineProps<Props>(), {
    text: "Заголовок блока",
  });
</script>

<template>
  <p :class="$style.header">{{ text }}</p>
</template>

<style module lang="scss">
  .header {
    margin-bottom: rem(12);
    font-size: rem(14);
  }
</style>
