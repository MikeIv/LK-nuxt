<script setup lang="ts"></script>

<template>
  <div>
    <TheHeader />
    <section class="auth">
      <slot name="heading" />
      <slot />
    </section>
  </div>
</template>

<style lang="scss">
  .auth {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;

    width: 100%;
    height: 100vh;
    background-color: var(--a-white);
  }
</style>
