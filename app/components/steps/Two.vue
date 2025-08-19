<script setup lang="ts">
  import { useStepTwoStore } from "~/stores/stepTwo";
  import { useStepOneStore } from "~/stores/stepOne";

  const handleBack = () => {
    console.log("Back");
    navigateTo("/record/1");
  };

  const {
    callApi: loadReport,
    data: report,
    isLoading,
    error,
  } = useApi<UserData>();

  const tableKkt = computed(() => report.value?.report?.kkts || {});
  const tableCashKkt = computed(
    () => report.value?.report?.cash_turnovers_without_kkt || {},
  );
  const tableNonCash = computed(
    () => report.value?.report?.cash_turnovers_non_cash || {},
  );
  const tableOtherSum = computed(
    () => report.value?.report?.cash_turnovers_other || {},
  );

  const stepOneStore = useStepOneStore();
  const stepTwoStore = useStepTwoStore();

  const kktTableRef = ref();
  const cashKktTableRef = ref();
  const nonCashTableRef = ref();
  const otherSumTableRef = ref();

  const { validateForm } = useFormValidation(
    kktTableRef,
    cashKktTableRef,
    nonCashTableRef,
    otherSumTableRef,
  );

  const validationResult = computed(() => validateForm());

  const isFormValid = computed(() => validationResult.value.isValid);
  const validationError = ref("");

  watch(
    validationResult,
    (result) => {
      validationError.value = result.error;
    },
    { immediate: true },
  );

  const { isSaving, saveReport, updateStores } = useSaveReport({
    kktTableRef,
    cashKktTableRef,
    nonCashTableRef,
    otherSumTableRef,
    stepOneStore,
    stepTwoStore,
    loadReport,
  });

  const validateAndNext = () => {
    if (!isFormValid.value) {
      console.error("Ошибка валидации данных:", validationError.value);
      return;
    }

    const tablesData = {
      kkt: kktTableRef.value?.getTableData(),
      cashKkt: cashKktTableRef.value?.getTableData(),
      nonCash: nonCashTableRef.value?.getTableData(),
      otherSum: otherSumTableRef.value?.getTableData(),
    };

    console.log("tablesData@@@", tablesData);

    updateStores(tablesData);
    navigateTo("/record/3");
  };

  const saveSuccess = ref(false);
  const saveSuccessMessage = ref("");

  const saveData = async () => {
    const saved = await saveReport("Draft");
    if (saved) {
      const tablesData = {
        kkt: kktTableRef.value?.getTableData(),
        cashKkt: cashKktTableRef.value?.getTableData(),
        nonCash: nonCashTableRef.value?.getTableData(),
        otherSum: otherSumTableRef.value?.getTableData(),
      };
      updateStores(tablesData);

      saveSuccess.value = true;
      saveSuccessMessage.value = "Данные успешно сохранены как черновик";

      setTimeout(() => {
        saveSuccess.value = false;
        saveSuccessMessage.value = "";
      }, 3000);
    }
  };

  const isDataChanged = ref(false);

  const checkDataChanges = () => {
    isDataChanged.value = true;
  };

  const handleTableChange = () => {
    checkDataChanges();
  };

  onMounted(async () => {
    try {
      await loadReport("/tenants/reports/-1");
      await nextTick();

      if (stepTwoStore.kkt.rows.length > 0) {
        kktTableRef.value?.setData?.(stepTwoStore.kkt.rows);
      } else if (tableKkt.value?.body?.length > 0) {
        kktTableRef.value?.setData?.(tableKkt.value.body);
      }

      if (stepTwoStore.cashKkt.rows.length > 0) {
        cashKktTableRef.value?.setData?.(stepTwoStore.cashKkt.rows);
      } else if (tableCashKkt.value?.body?.length > 0) {
        cashKktTableRef.value?.setData?.(tableCashKkt.value.body);
      }

      if (stepTwoStore.nonCash.rows.length > 0) {
        nonCashTableRef.value?.setData?.(stepTwoStore.nonCash.rows);
      } else if (tableNonCash.value?.body?.length > 0) {
        nonCashTableRef.value?.setData?.(tableNonCash.value.body);
      }

      if (stepTwoStore.otherSum.rows.length > 0) {
        otherSumTableRef.value?.setData?.(stepTwoStore.otherSum.rows);
      } else if (tableOtherSum.value?.body?.length > 0) {
        otherSumTableRef.value?.setData?.(tableOtherSum.value.body);
      }

      kktTableRef.value?.$el?.addEventListener("change", handleTableChange);
      cashKktTableRef.value?.$el?.addEventListener("change", handleTableChange);
      nonCashTableRef.value?.$el?.addEventListener("change", handleTableChange);
      otherSumTableRef.value?.$el?.addEventListener(
        "change",
        handleTableChange,
      );
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
    }
  });

  onBeforeUnmount(() => {
    kktTableRef.value?.$el?.removeEventListener("change", handleTableChange);
    cashKktTableRef.value?.$el?.removeEventListener(
      "change",
      handleTableChange,
    );
    nonCashTableRef.value?.$el?.removeEventListener(
      "change",
      handleTableChange,
    );
    otherSumTableRef.value?.$el?.removeEventListener(
      "change",
      handleTableChange,
    );
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
            ref="kktTableRef"
            :headers="tableKkt?.header"
            :initial-data="tableKkt?.body"
            :loading="isLoading"
            :error="error"
          />
        </div>
      </section>

      <section :class="$style.wrapper">
        <StepsCoreContentTitle
          text="2.2 Денежный оборот, полученный на расчетные счета Арендатора без использования ККТ, установленных в Помещении"
        />
        <div class="table-container">
          <StepsTablesCashKkt
            ref="cashKktTableRef"
            :headers="tableCashKkt?.header"
            :initial-data="tableCashKkt?.body"
            :loading="isLoading"
            :error="error"
          />
        </div>
      </section>

      <section :class="$style.wrapper">
        <StepsCoreContentTitle
          text="2.3 Денежный оборот, полученный в качестве неденежных форм расчетов"
        />
        <div class="table-container">
          <StepsTablesNonCash
            ref="nonCashTableRef"
            :headers="tableNonCash?.header"
            :initial-data="tableNonCash?.body"
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
          <StepsTablesOtherSum
            ref="otherSumTableRef"
            :headers="tableOtherSum?.header"
            :initial-data="tableOtherSum?.body"
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
        <UTooltip :text="!isFormValid && !isDataChanged ? validationError : ''">
          <UButton
            class="steps-nav-btn ghost"
            :loading="isSaving"
            :disabled="!isDataChanged && !isFormValid"
            @click="saveData"
          >
            Сохранить как черновик
          </UButton>
        </UTooltip>
      </template>
      <template #next>
        <UTooltip :text="!isFormValid ? validationError : ''">
          <UButton
            class="steps-nav-btn solid"
            :disabled="!isFormValid"
            @click="validateAndNext"
          >
            Далее
          </UButton>
        </UTooltip>

        <transition
          enter-active-class="transition-opacity duration-300"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition-opacity duration-300"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="saveSuccess"
            class="flex items-center text-green-600 text-sm font-medium"
          >
            <UIcon name="i-heroicons-check-circle" class="w-5 h-5 mr-1" />
            {{ saveSuccessMessage }}
          </div>
        </transition>
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
