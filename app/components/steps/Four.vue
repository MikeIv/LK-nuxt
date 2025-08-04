<script setup lang="ts">
  const handleBack = () => {
    console.log("Back");
    navigateTo("/record/2");
  };
  const saveData = () => {
    console.log("Save data");
  };
</script>

<template>
  <div class="wrapper">
    <h1>Шаг 4</h1>
    <StepsNavigation :step="4" :show-back="true" :show-next="false">
      <template #back>
        <button class="btn" @click="handleBack">Назад</button>
      </template>
      <template #action>
        <button class="btn" @click="saveData">Сохранить</button>
      </template>
      <template #next />
    </StepsNavigation>
  </div>
</template>

<style module lang="scss"></style>
