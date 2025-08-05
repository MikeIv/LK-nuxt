<script setup lang="ts">
  const handleBack = () => {
    console.log("Back");
    navigateTo("/record/1");
  };

  const saveData = () => {
    console.log("Save data");
  };

  const { report, isLoading, error, fetchReport } = useReport();

  const tableKkt = computed(() => report.value?.report?.kkts || {});

  console.log("tableKkt", tableKkt.value);

  const validateAndNext = () => {
    console.log("Next");
    navigateTo("/record/3");
  };

  onMounted(async () => {
    await fetchReport();

    console.log("reportKKT", report);
  });
</script>

<template>
  <div>
    <StepsCoreHeader
      step-title="Суммы, подлежащие включению в размер Денежного оборота в Помещении"
      :step-current="2"
      :step-total="4"
    />

    <StepsCoreMain>
      <section :class="$style.wrapper">
        <StepsCoreContentTitle
          text="2.1 Денежный оборот, полученный при расчетах с использованием ККТ, установленных в Помещении"
        />
        <div class="table-container">
          <StepsTablesKkt
            :headers="tableKkt?.header"
            :initial-data="tableKkt?.body"
            :added-rows-indices="addedKktRowsIndices"
            :loading="isLoading"
            :error="error"
            @update:table-data="handleKktDataUpdate"
            @update:total-summ="
              (val) => handleKktTotalsUpdate(val, kktTotals.totalVAT)
            "
            @update:total-v-a-t="
              (val) => handleKktTotalsUpdate(kktTotals.totalSumm, val)
            "
            @rows-added="handleKktRowsAdded"
            @rows-removed="handleKktRowsRemoved"
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
  </div>
</template>

<style module lang="scss">
  .wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: rem(18);
  }
</style>
