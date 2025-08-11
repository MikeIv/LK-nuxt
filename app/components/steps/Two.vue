<script setup lang="ts">
  import { useStepTwoStore } from "~/stores/stepTwo";

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

  const isSaving = ref(false);

  const saveData = async () => {
    isSaving.value = true;
    try {
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

      const reportData = {
        status: "Draft",
        report: {
          visitors_count: stepOneStore.visitorsCount,
          receipts_count: stepOneStore.checksCount,
          comparison_base: 0,
          rent_percentage: 0,
          kkts: tablesData.kkt.rows.map((row) => ({
            name: row.name,
            registration_number: row.registration_number,
            start_meter_reading: parseFloat(row.start_meter_reading) || 0,
            end_meter_reading: parseFloat(row.end_meter_reading) || 0,
            amount_without_advance_with_nds:
              parseFloat(row.amount_without_advance_with_nds) || 0,
            amount_without_advance_nds:
              parseFloat(row.amount_without_advance_nds) || 0,
            advance_without_certificates_with_nds:
              parseFloat(row.advance_without_certificates_with_nds) || 0,
            advance_without_certificates_nds:
              parseFloat(row.advance_without_certificates_nds) || 0,
            file_ids: row.file_ids || [],
          })),
          cash_turnovers_without_kkt: tablesData.cashKkt.rows.map((row) => ({
            name: row.name,
            settlement_account_number: row.settlement_account_number,
            amount_with_nds: parseFloat(row.amount_with_nds) || 0,
            amount_nds: parseFloat(row.amount_nds) || 0,
            file_ids: row.file_ids || [],
          })),
          cash_turnovers_non_cash: tablesData.nonCash.rows.map((row) => ({
            name: row.name,
            amount_with_nds: parseFloat(row.amount_with_nds) || 0,
            amount_nds: parseFloat(row.amount_nds) || 0,
            file_ids: row.file_ids || [],
          })),
          cash_turnovers_other: tablesData.otherSum.rows.map((row) => ({
            name: row.name,
            amount_with_nds: parseFloat(row.amount_with_nds) || 0,
            amount_nds: parseFloat(row.amount_nds) || 0,
            file_ids: row.file_ids || [],
          })),
          period: {
            start: new Date(stepOneStore.dateRange[0]).toISOString(),
            end: new Date(stepOneStore.dateRange[1]).toISOString(),
          },
        },
      };

      const response = await loadReport("/tenants/reports", {
        method: "POST",
        body: reportData,
      });

      if (response) {
        console.log("Черновик успешно сохранён");
        // Обновляем данные в хранилище
        stepTwoStore.updateTable("kkt", {
          rows: tablesData.kkt.rows,
          withVAT: tablesData.kkt.totals.withVAT,
          VAT: tablesData.kkt.totals.VAT,
        });
        stepTwoStore.updateTable("cashKkt", {
          rows: tablesData.cashKkt.rows,
          withVAT: tablesData.cashKkt.totals.withVAT,
          VAT: tablesData.cashKkt.totals.VAT,
        });
        stepTwoStore.updateTable("nonCash", {
          rows: tablesData.nonCash.rows,
          withVAT: tablesData.nonCash.totals.withVAT,
          VAT: tablesData.nonCash.totals.VAT,
        });
        stepTwoStore.updateTable("otherSum", {
          rows: tablesData.otherSum.rows,
          withVAT: tablesData.otherSum.totals.withVAT,
          VAT: tablesData.otherSum.totals.VAT,
        });
      }
    } catch (error) {
      console.error("Ошибка при сохранении черновика:", error);
    } finally {
      isSaving.value = false;
    }
  };

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

    const validateTablesData = (data) => {
      if (data.kkt.rows.length === 0) {
        console.error("Таблица ККТ не может быть пустой");
        return false;
      }

      return true;
    };

    if (!validateTablesData(tablesData)) {
      console.error("Ошибка валидации данных");
      // Здесь можно добавить UI-уведомление об ошибке
      return;
    }

    try {
      // Сохраняем данные в хранилище перед переходом
      stepTwoStore.updateTable("kkt", {
        rows: tablesData.kkt.rows,
        withVAT: tablesData.kkt.totals.withVAT,
        VAT: tablesData.kkt.totals.VAT,
      });
      stepTwoStore.updateTable("cashKkt", {
        rows: tablesData.cashKkt.rows,
        withVAT: tablesData.cashKkt.totals.withVAT,
        VAT: tablesData.cashKkt.totals.VAT,
      });
      stepTwoStore.updateTable("nonCash", {
        rows: tablesData.nonCash.rows,
        withVAT: tablesData.nonCash.totals.withVAT,
        VAT: tablesData.nonCash.totals.VAT,
      });
      stepTwoStore.updateTable("otherSum", {
        rows: tablesData.otherSum.rows,
        withVAT: tablesData.otherSum.totals.withVAT,
        VAT: tablesData.otherSum.totals.VAT,
      });

      console.log("Данные успешно сохранены в хранилище");
      navigateTo("/record/3");
    } catch (error) {
      console.error("Ошибка при сохранении данных:", error);
    }
  };

  onMounted(async () => {
    try {
      await loadReport("/tenants/reports/-1");

      await nextTick();

      // Загружаем данные из хранилища, если они есть
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
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
    }
  });
</script>

<template>
  <!-- Остальная часть шаблона остается без изменений -->
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
        <UButton
          class="steps-nav-btn ghost"
          :loading="isSaving"
          @click="saveData"
          >Сохранить как черновик
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
