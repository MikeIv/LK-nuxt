export const useStepOneStore = defineStore("stepOne", () => {
  const dateRange = ref<[Date, Date] | null>(null);
  const visitorsCount = ref<number | null>(null);
  const checksCount = ref<number | null>(null);

  const reportExists = ref(false);
  const errorMessage = ref("");

  function reset() {
    dateRange.value = null;
    visitorsCount.value = null;
    checksCount.value = null;
    reportExists.value = false;
    errorMessage.value = "";
  }

  function setDateRange(dates: Date[] | null) {
    if (dates && dates.length === 2) {
      dateRange.value = [dates[0], dates[1]];
    } else {
      dateRange.value = null;
    }
  }

  return {
    dateRange,
    visitorsCount,
    checksCount,
    reportExists,
    errorMessage,
    reset,
    setDateRange, // Добавляем новый метод
  };
});
