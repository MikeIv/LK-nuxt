<script setup lang="ts"></script>

<template>
  <section :class="$style.main">
    <slot />
  </section>
</template>

<style module lang="scss">
  .main {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
</style>
