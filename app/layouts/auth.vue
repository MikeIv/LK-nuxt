<script setup lang="ts"></script>

<template>
  <section :class="$style.auth">
    <TheHeader />
    <slot />
  </section>
</template>

<style module lang="scss">
  .auth {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    height: 100vh;
    background-color: var(--a-white);
  }
</style>

