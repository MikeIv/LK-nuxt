export const useStepOneStore = defineStore("stepOne", () => {
  const dateRange = ref<Date[] | null>(null);
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

  return {
    dateRange,
    visitorsCount,
    checksCount,
    reportExists,
    errorMessage,
    reset,
  };
});
