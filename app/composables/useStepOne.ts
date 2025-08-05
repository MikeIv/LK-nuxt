export function useStepOne() {
  const stepStore = useStepStore();

  const reportExists = ref(false);
  const errorMessage = ref("");

  const localDateRange = ref<[Date, Date] | null>(
    stepStore.step1?.dateRange
      ? [
          new Date(stepStore.step1.dateRange[0]),
          new Date(stepStore.step1.dateRange[1]),
        ]
      : null,
  );

  const localVisitorsCount = ref<number | null>(
    stepStore.step1?.visitorsCount ?? null,
  );
  const localChecksCount = ref<number | null>(
    stepStore.step1?.checksCount ?? null,
  );

  return {
    localDateRange,
    localVisitorsCount,
    localChecksCount,
    reportExists,
    errorMessage,
  };
}
