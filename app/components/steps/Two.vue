<script setup lang="ts">
  import { useTablesStore } from "~/stores/stepTwo";

  const handleBack = () => {
    console.log("Back");
    navigateTo("/record/1");
  };

  const saveData = () => {
    console.log("Save data");
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

  const tablesStore = useTablesStore();

  const kktTableRef = ref();
  const cashKktTableRef = ref();
  const nonCashTableRef = ref();
  const otherSumTableRef = ref();

  const validateAndNext = () => {
    const tablesData = {
      kkt: kktTableRef.value?.getTableData() || {
        rows: [],
        totals: { withVAT: 0, VAT: 0 },
      },
      cashKkt: cashKktTableRef.value?.getTableData() || {
        rows: [],
        totals: { withVAT: 0, VAT: 0 },
      },
      nonCash: nonCashTableRef.value?.getTableData() || {
        rows: [],
        totals: { withVAT: 0, VAT: 0 },
      },
      otherSum: otherSumTableRef.value?.getTableData() || {
        rows: [],
        totals: { withVAT: 0, VAT: 0 },
      },
    };

    const validateTablesData = (data: {
      kkt: { rows: unknown[]; totals: { withVAT: number; VAT: number } };
      cashKkt: { rows: unknown[]; totals: { withVAT: number; VAT: number } };
      nonCash: { rows: unknown[]; totals: { withVAT: number; VAT: number } };
      otherSum: { rows: unknown[]; totals: { withVAT: number; VAT: number } };
    }): boolean => {
      // 1. Проверка на пустые таблицы (если требуется)
      if (data.kkt.rows.length === 0) {
        console.warn("Таблица ККТ пуста");
        return false;
      }

      if (isNaN(data.kkt.totals.withVAT) || data.kkt.totals.withVAT < 0) {
        console.warn("Некорректная сумма в таблице ККТ");
        return false;
      }

      // 3. Добавьте другие проверки по необходимости...
      // Например:
      // - Проверка обязательных полей в строках
      // - Проверка формата данных
      // - Сравнение итоговых сумм

      return true;
    };

    if (!validateTablesData(tablesData)) {
      console.error("Ошибка: Данные таблиц невалидны");
      // Можно добавить UI-уведомление (например, через toast)
      return;
    }

    try {
      tablesStore.saveAllTables(tablesData);
      console.log("Данные успешно сохранены:", tablesData);
      navigateTo("/record/3");
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      // Обработка ошибки (например, показать сообщение пользователю)
    }
  };

  onMounted(async () => {
    try {
      await loadReport("/tenants/reports/-1");

      await nextTick();

      if (tablesStore.kkt.rows.length > 0) {
        kktTableRef.value?.setData?.(tablesStore.kkt.rows);
      }
      if (tablesStore.cashKkt.rows.length > 0) {
        cashKktTableRef.value?.setData?.(tablesStore.cashKkt.rows);
      }
      if (tablesStore.nonCash.rows.length > 0) {
        nonCashTableRef.value?.setData?.(tablesStore.nonCash.rows);
      }
      if (tablesStore.otherSum.rows.length > 0) {
        otherSumTableRef.value?.setData?.(tablesStore.otherSum.rows);
      }
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
    }
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
