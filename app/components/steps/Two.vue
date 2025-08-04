<script setup lang="ts">
  const handleBack = () => {
    console.log("Back");
    navigateTo("/record/1");
  };

  const saveData = () => {
    console.log("Save data");
  };

  const validateAndNext = () => {
    console.log("Next");
    navigateTo("/record/3");
  };
</script>

<template>
  <div class="wrapper">
    <h1>Шаг 2</h1>
    <StepsNavigation :step="2" :show-back="true" :show-next="true">
      <template #back>
        <button class="btn" @click="handleBack">Назад</button>
      </template>
      <template #action>
        <button class="btn" @click="saveData">Сохранить</button>
      </template>
      <template #next>
        <button class="btn" @click="validateAndNext">Далее</button>
      </template>
    </StepsNavigation>
  </div>
</template>

<style module lang="scss">
  .wrapper {
    /* Ваши стили */
  }
</style>
