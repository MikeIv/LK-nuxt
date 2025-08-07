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

  const {
    callApi: loadReport,
    data: report,
    isLoading,
    error,
  } = useApi<UserData>();

  const tableRefunds = computed(
    () => report.value?.report?.kkts_exclusions || {},
  );
  const tableOtherAmouts = computed(
    () => report.value?.report?.cash_turnover_exclusions_other || {},
  );

  onMounted(async () => {
    await loadReport("/tenants/reports/-1");

    console.log("reportKKT", report);
  });
</script>

<template>
  <StepsCoreHeader
    step-title="Суммы, подлежащие исключению из размера Денежного оборота в Помещении"
    :step-current="3"
    :step-total="4"
  />

  <StepsCoreMain>
    <section :class="$style.wrapper">
      <StepsCoreContentTitle
        text="2.1 Денежный оборот, полученный при расчетах с использованием ККТ, установленных в Помещении"
      />
      <div class="table-container">
        <StepsTablesRefunds
          :headers="tableRefunds?.header"
          :initial-data="tableRefunds?.body"
          :loading="isLoading"
          :error="error"
        />
      </div>
    </section>

    <section :class="$style.wrapper">
      <StepsCoreContentTitle
        text="2.4 Иные суммы, подлежащие включению в Денежный оборот в Помещении"
      />
      <div class="table-container">
        <StepsTablesOtherAmounts
          :headers="tableOtherAmouts?.header"
          :initial-data="tableOtherAmouts?.body"
          :loading="isLoading"
          :error="error"
        />
      </div>
    </section>
  </StepsCoreMain>

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

<style module lang="scss">
  .wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: rem(18);
  }
</style>
