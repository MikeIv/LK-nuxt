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
  <StepsHeader
    step-title="Суммы, подлежащие включению в размер Денежного оборота в Помещении"
    :step-current="2"
    :step-total="4"
  />

  <StepsNavigation :step="2" :show-back="true" :show-next="true">
    <template #back>
      <UButton class="steps-nav-btn ghost" @click="handleBack">Назад</UButton>
    </template>
    <template #action>
      <UButton class="steps-nav-btn ghost" @click="saveData"
        >Сохранить
      </UButton>
    </template>
    <template #next>
      <UButton class="steps-nav-btn solid" @click="validateAndNext"
        >Далее
      </UButton>
    </template>
  </StepsNavigation>
</template>

<style module lang="scss">
  .wrapper {
    /* Ваши стили */
  }
</style>
