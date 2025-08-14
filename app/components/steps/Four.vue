<script setup lang="ts">
  const handleBack = () => {
    console.log("Back");
    navigateTo("/record/3");
  };

  const {
    handleBaseInput,
    formatBaseValue,
    formatCurrency,
    savingReport,
    isSaving,
    sumWithVAT,
    sumWithoutVAT,
    baseComparisonValue,
    rentPercentage,
    percentageWithVAT,
    percentageWithoutVAT,
    paymentWithVAT,
    paymentWithoutVAT,
    loadReport,
    isLoading,
    reportData,
  } = useReportCalculation();

  console.log("loadReport", loadReport);
  console.log("isLoading", isLoading);

  const { downloadingReport, downloadReport } = useDownloadReport();

  const reportId = computed(() => reportData.value?.id);

  const resulTableData = ref({
    header: [
      { key: "name", label: "" },
      { key: "nds", label: "с НДС" },
      { key: "without_nds", label: "без НДС" },
    ],
    body: [
      {
        name: "Итого Денежный оборот в Помещении",
        with_nds: sumWithVAT || "0",
        without_nds: sumWithoutVAT || "0",
      },
      {
        name: "Процент с Денежного оборота, %",
        sum: rentPercentage || "0",
      },
      {
        name: "Процент с Денежного оборота, руб",
        with_nds: percentageWithVAT,
        without_nds: percentageWithoutVAT,
      },
      {
        name: "База сравнения за отчетный период",
        sum: "0",
      },
      {
        name: "Плата с Денежного оборота, руб.",
        with_nds: paymentWithVAT,
        without_nds: paymentWithoutVAT,
      },
    ],
  });

  onMounted(async () => {
    try {
      await loadReport("/tenants/reports/-1");
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
    }
  });

  const handleDownloadReport = async () => {
    if (!reportId.value) return;

    try {
      await downloadReport(reportId.value);
    } catch (error) {
      console.error("Ошибка при скачивании отчета:", error);
    }
  };
</script>

<template>
  <div>
    <StepsCoreHeader
      step-title="Расчет платы с Денежного оборота в Помещении"
      :step-current="4"
      :step-total="4"
    />

    <StepsCoreMain>
      <section :class="$style.section">
        <div :class="$style.table">
          <div :class="$style.tableRow">
            <div
              v-for="(col, index) in resulTableData?.header"
              :key="index"
              :class="[
                $style.tableHeaderCell,
                { [$style.spanColumns]: index === 0 },
              ]"
            >
              {{ col.label }}
            </div>
          </div>

          <div
            v-for="(row, rowIndex) in resulTableData?.body"
            :key="rowIndex"
            :class="$style.tableRow"
          >
            <div :class="[$style.tableCell, $style.nameCell]">
              {{ row.name }}
            </div>

            <template v-if="row.name === 'База сравнения за отчетный период'">
              <div :class="[$style.tableCell, $style.sumCell]" :colspan="2">
                <input
                  :value="baseComparisonValue"
                  type="text"
                  :class="$style.baseInput"
                  @input="handleBaseInput($event)"
                  @blur="formatBaseValue()"
                />
              </div>
            </template>
            <template v-else-if="row.name === 'Процент с Денежного оборота, %'">
              <div :class="[$style.tableCell, $style.sumCell]" :colspan="2">
                {{
                  Number(row.sum) === Math.floor(row.sum)
                    ? Math.floor(row.sum)
                    : row.sum
                }}%
              </div>
            </template>
            <template
              v-else-if="row.name === 'Процент с Денежного оборота, руб'"
            >
              <div :class="$style.tableCell">
                {{ row.with_nds ? formatCurrency(row.with_nds) : "" }}
              </div>
              <div :class="$style.tableCell">
                {{ row.without_nds ? formatCurrency(row.without_nds) : "" }}
              </div>
            </template>
            <template
              v-else-if="row.name === 'Плата с Денежного оборота, руб.'"
            >
              <div :class="$style.tableCell">
                {{ formatCurrency(row.with_nds) }}
              </div>
              <div :class="$style.tableCell">
                {{ formatCurrency(row.without_nds) }}
              </div>
            </template>
            <template v-else>
              <div :class="$style.tableCell">
                {{
                  row.with_nds ? formatCurrency(parseFloat(row.with_nds)) : ""
                }}
              </div>
              <div :class="$style.tableCell">
                {{
                  row.without_nds
                    ? formatCurrency(parseFloat(row.without_nds))
                    : ""
                }}
              </div>
            </template>
          </div>
        </div>
      </section>
    </StepsCoreMain>

    <StepsCoreNavigation :step="4" :show-back="true" :show-next="false">
      <template #back>
        <UButton class="steps-nav-btn ghost" @click="handleBack">Назад</UButton>
      </template>
      <template #action>
        <UButton
          class="steps-nav-btn ghost"
          :loading="isSaving"
          @click="savingReport"
        >
          {{ isSaving ? "Формирование..." : "Сформировать отчет" }}
        </UButton>
      </template>
      <template #next>
        <UButton
          class="steps-nav-btn solid"
          :disabled="downloadingReport || !reportId"
          @click="handleDownloadReport"
        >
          {{ downloadingReport ? "Скачивание..." : "Скачать отчет" }}
        </UButton>
      </template>
    </StepsCoreNavigation>
  </div>
</template>

<style module lang="scss">
  .section {
    margin-bottom: rem(24);
  }

  .table {
    display: grid;
    grid-template-columns: 1fr 240px 240px;
    max-width: rem(900);
    border: 1px solid var(--a-borderLght);
    font-size: rem(14);
  }

  .tableRow {
    display: contents;
  }

  .tableHeaderCell {
    display: flex;
    justify-content: center;
    padding: rem(12) rem(8);
    background-color: var(--a-bgAccentExLight);
    font-weight: bold;
    text-align: center;

    &:first-child {
      background-color: transparent;
    }
  }

  .tableCell {
    padding: rem(12) rem(8);
    background-color: var(--a-bgTable);
    border-bottom: 1px solid var(--a-borderLght);
    border-right: 1px solid var(--a-borderLght);
    display: flex;
    align-items: center;
  }

  .nameCell {
    display: flex;
    align-items: center;
    font-weight: 600;
    background-color: var(--a-bgAccentExLight);
  }

  .sumCell {
    display: flex;
    justify-content: center;
    grid-column: span 2;
    text-align: center;
  }

  .baseInput {
    width: 80%;
    padding: rem(4) rem(8);
    text-align: left;
    font-size: rem(14);
    border: 1px solid var(--a-borderMain);
    border-radius: rem(4);
    background-color: var(--a-mainBg);

    &:focus {
      outline: none;
      border-color: var(--a-accentPrimary);
      box-shadow: 0 0 0 2px rgba(var(--a-accentPrimaryRgb), 0.2);
    }
  }
</style>
