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
  <div>
    <h1>Шаг {{ step }}</h1>

    <!-- Подключаем компоненты по шагам -->
    <StepsOne v-if="step === '1'" class="wrapper" />
    <StepsTwo v-if="step === '2'" class="wrapper" />
    <StepsThree v-if="step === '3'" class="wrapper" />
    <StepsFour v-if="step === '4'" class="wrapper" />

    <!-- Навигация -->
    <!--    <div class="navigation">-->
    <!--      <NuxtLink-->
    <!--        v-if="step !== '1'"-->
    <!--        :to="`/record/${Number(step) - 1}`"-->
    <!--        class="btn"-->
    <!--      >-->
    <!--        ← Назад-->
    <!--      </NuxtLink>-->
    <!--      <NuxtLink-->
    <!--        v-if="step !== '4'"-->
    <!--        :to="`/record/${Number(step) + 1}`"-->
    <!--        class="btn"-->
    <!--      >-->
    <!--        Далее →-->
    <!--      </NuxtLink>-->
    <!--    </div>-->
  </div>
</template>

<style scoped>
  .navigation {
    margin-top: 20px;
    display: flex;
    gap: 10px;
  }

  .btn {
    padding: 8px 16px;
    background: #42b983;
    color: white;
    border-radius: 4px;
    text-decoration: none;
  }
</style>
