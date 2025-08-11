<script setup lang="ts">
  import type { Report } from "~/types";

  const {
    callApi: loadReports,
    data: reports,
    pagination,
    isLoading,
    error,
  } = useApi<Report[]>();

  console.log("pagination", pagination);

  onMounted(async () => {
    await loadReports("/tenants/reports");
  });

  // Для пагинации
  const loadPage = (page: number) => {
    loadReports(`/tenants/reports?page=${page}`);
  };
  console.log("loadPage", loadPage);
  console.log("reports", reports);
</script>

<template>
  <div>
    <div v-if="isLoading">Загрузка...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>
    <div v-else-if="reports" :class="$style.wrapper">
      <CashiersHeader main-title="Архив отчетов" step-title="" />
      <section :class="$style.content">
        <ReportsTable
          :reports="reports"
          :pagination="pagination"
          @page-change="loadPage"
        />
      </section>
    </div>
  </div>
</template>

<style module lang="scss">
  .wrapper,
  .content {
    display: flex;
    flex-direction: column;
    overflow: auto;
  }
</style>
