<script setup lang="ts">
  import { useStepThreeStore } from "~/stores/stepThree";

  const handleBack = () => {
    console.log("Back");
    navigateTo("/record/2");
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

  const refundsTableRef = ref();
  const otherAmountsTableRef = ref();

  const isSaving = ref(false);
  const stepOneStore = useStepOneStore();
  const tablesStore = useStepThreeStore();

  const saveData = async () => {
    isSaving.value = true;
    try {
      const tablesData = {
        refunds: refundsTableRef.value?.getTableData() || {
          rows: [],
          totals: { withVAT: 0, VAT: 0 },
        },
        otherAmounts: otherAmountsTableRef.value?.getTableData() || {
          rows: [],
          totals: { withVAT: 0, VAT: 0 },
        },
      };

      console.log("Подготовка данных для отправки:", tablesData); // Логируем данные

      const reportData = {
        status: "Draft",
        report: {
          visitors_count: stepOneStore.visitorsCount,
          receipts_count: stepOneStore.checksCount,
          kkts_exclusions: tablesData.refunds.rows.map((row) => ({
            name: row.name,
            registration_number: row.registration_number,
            returns_goods_services_with_nds:
              Number(row.returns_goods_services_with_nds) || 0,
            returns_goods_services_nds:
              Number(row.returns_goods_services_nds) || 0,
            gift_certificates_sold_with_nds:
              Number(row.gift_certificates_sold_with_nds) || 0,
            gift_certificates_sold_nds:
              Number(row.gift_certificates_sold_nds) || 0,
            file_id: row.file_id || null,
          })),
          cash_turnover_exclusions_other: tablesData.otherAmounts.rows.map(
            (row) => ({
              name: row.name,
              amount_with_nds: Number(row.amount_with_nds) || 0,
              amount_nds: Number(row.amount_nds) || 0,
              file_id: row.file_id || null,
            }),
          ),
          period: {
            start: new Date(stepOneStore.dateRange[0]).toISOString(),
            end: new Date(stepOneStore.dateRange[1]).toISOString(),
          },
        },
      };

      console.log("Отправка данных на сервер:", reportData); // Логируем полные данные

      const response = await loadReport("/tenants/reports", {
        method: "POST",
        body: reportData,
      });

      if (!response) {
        throw new Error("Пустой ответ от сервера");
      }

      console.log("Черновик успешно сохранён", response);
      // Добавляем уведомление об успешном сохранении
      useToast().add({
        title: "Черновик сохранен",
        description: "Данные успешно сохранены как черновик",
        color: "green",
      });
    } catch (error) {
      console.error("Ошибка при сохранении черновика:", error);
      // Добавляем уведомление об ошибке
      useToast().add({
        title: "Ошибка сохранения",
        description: error.message || "Не удалось сохранить черновик",
        color: "red",
      });
    } finally {
      isSaving.value = false;
    }
  };

  const validateAndNext = () => {
    const tablesData = {
      refunds: refundsTableRef.value?.getTableData() || {
        rows: [],
        totals: { withVAT: 0, VAT: 0 },
      },
      otherAmounts: otherAmountsTableRef.value?.getTableData() || {
        rows: [],
        totals: { withVAT: 0, VAT: 0 },
      },
    };

    const validateTablesData = (data: {
      refunds: { rows: unknown[]; totals: { withVAT: number; VAT: number } };
      otherAmounts: {
        rows: unknown[];
        totals: { withVAT: number; VAT: number };
      };
    }): boolean => {
      // Проверка на обязательные поля
      for (const row of data.refunds.rows) {
        if (!row.name || !row.registration_number) {
          console.warn("Не заполнены обязательные поля в таблице Возвратов");
          return false;
        }
      }

      for (const row of data.otherAmounts.rows) {
        if (!row.name) {
          console.warn("Не заполнены обязательные поля в таблице Иных сумм");
          return false;
        }
      }

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
      navigateTo("/record/4");
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      // Обработка ошибки (например, показать сообщение пользователю)
    }
  };

  onMounted(async () => {
    try {
      await loadReport("/tenants/reports/-1");

      await nextTick();

      if (tablesStore.refunds.rows.length > 0) {
        refundsTableRef.value?.setData?.(tablesStore.refunds.rows);
      }
      if (tablesStore.otherAmounts.rows.length > 0) {
        otherAmountsTableRef.value?.setData?.(tablesStore.otherAmounts.rows);
      }
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
    }
  });
</script>

<template>
  <div>
    <StepsCoreHeader
      step-title="Суммы, подлежащие исключению из размера Денежного оборота в Помещении"
      :step-current="3"
      :step-total="4"
    />

    <StepsCoreMain>
      <section :class="$style.wrapper">
        <StepsCoreContentTitle text="3.1 Возвраты" />
        <div class="table-container">
          <StepsTablesRefunds
            ref="refundsTableRef"
            :headers="tableRefunds?.header"
            :initial-data="tableRefunds?.body"
            :loading="isLoading"
            :error="error"
          />
        </div>
      </section>

      <section :class="$style.wrapper">
        <StepsCoreContentTitle
          text="3.2 Иные суммы, подлежащие исключению из Денежного оборота"
        />
        <div class="table-container">
          <StepsTablesOtherAmounts
            ref="otherAmountsTableRef"
            :headers="tableOtherAmouts?.header"
            :initial-data="tableOtherAmouts?.body"
            :loading="isLoading"
            :error="error"
          />
        </div>
      </section>
    </StepsCoreMain>

    <StepsCoreNavigation :step="3" :show-back="true" :show-next="true">
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
