<!-- pages/record/[step].vue -->
<script setup>
  const route = useRoute();
  const step = route.params.step;

  // Валидация шага (опционально)
  if (!["1", "2", "3", "4"].includes(step)) {
    throw createError({ statusCode: 404, statusMessage: "Шаг не найден" });
  }
</script>

<template>
  <div :class="$style.container">
    <StepsOne v-if="step === '1'" :class="$style.wrapper" />
    <StepsTwo v-if="step === '2'" :class="$style.wrapper" />
    <StepsThree v-if="step === '3'" :class="$style.wrapper" />
    <StepsFour v-if="step === '4'" :class="$style.wrapper" />
  </div>
</template>

<style module lang="scss">
  .container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    flex-grow: 1;
  }
</style>
