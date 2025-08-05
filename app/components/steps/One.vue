<script setup lang="ts">
  const validateAndNext = () => {
    console.log("Save data");
    navigateTo("/record/2");
  };
</script>

<template>
  <div class="wrapper">
    <h2>Шаг 1: Ввод данных</h2>
    <StepsNavigation :step="1" :show-back="false">
      <template #next>
        <button class="steps-nav-btn solid" @click="validateAndNext">
          Далее
        </button>
      </template>
    </StepsNavigation>
  </div>
</template>

<style module lang="scss"></style>
