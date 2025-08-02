<script setup lang="ts"></script>

<template>
  <div :class="$style.main">
    <h2>Главная</h2>
  </div>
</template>

<style module lang="scss">
  .main {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    width: 100%;
    color: red;
  }
</style>
