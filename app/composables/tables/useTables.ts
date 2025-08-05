import { ref } from "vue";
import { useRouter } from "vue-router";
import { useStepStore } from "@/stores/stepStore";
import { useSaveReport } from "@/composables/useSaveReport";
import { useApiGet } from "@/composables/useApiGet";
import type { Step2Data } from "@/types/steps";

export function useTables() {
  const stepStore = useStepStore();
  const router = useRouter();
  const { saveReport, loading: saving, error: saveError } = useSaveReport();
  const {
    data,
    loading,
    error,
    fetchData: fetchReport,
  } = useApiGet<Step2Data>();

  const isSaving = ref(false);
  const saveMessage = ref("");
  const isError = ref(false);
  const isFormValid = ref(true);
  const hasChanges = ref(true);
  const apiDataOnly = ref(stepStore.useApiDataOnly);

  const showMessage = (message: string, error = false) => {
    saveMessage.value = message;
    isError.value = error;
    setTimeout(() => {
      saveMessage.value = "";
    }, 3000);
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return {
    stepStore,
    router,
    saveReport,
    saving,
    saveError,
    data,
    loading,
    error,
    fetchReport,
    isSaving,
    saveMessage,
    isError,
    isFormValid,
    hasChanges,
    apiDataOnly,
    showMessage,
    formatDate,
  };
}
