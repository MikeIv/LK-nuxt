<script setup lang="ts">
  const handleBack = () => {
    console.log("Back");
    navigateTo("/record/2");
  };
  const saveData = () => {
    console.log("Save data");
  };
  const validateAndNext = () => {
    console.log("Next");
    navigateTo("/record/4");
  };
</script>

<template>
  <StepsCoreHeader
    step-title="Суммы, подлежащие исключению из размера Денежного оборота в Помещении"
    :step-current="3"
    :step-total="4"
  />

  <StepsCoreNavigation :step="2" :show-back="true" :show-next="true">
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
  </StepsCoreNavigation>
</template>

<style module lang="scss"></style>
