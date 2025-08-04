import { defineStore } from "pinia";

interface Casher {
  id: number | null;
  name: string;
  registration_number: string;
  serial_number: string;
  fn_number: string;
  registered_at: string | null;
  installed_at: string | null;
  order: number;
  isEditingTitle?: boolean;
  isCustom?: boolean;
  tempId?: string;
  isDirty?: boolean;
}

export const useCashersStore = defineStore("cashers", () => {
  const originalCashers = ref<Casher[]>([]);
  const customCashers = ref<Casher[]>([]);
  const initialData = ref<Casher[]>([]);

  const allCashers = computed(() => [
    ...originalCashers.value,
    ...customCashers.value,
  ]);

  // Загружаем данные из API
  const loadFromApi = (apiData: Casher[]) => {
    // Создаем глубокую копию данных
    initialData.value = JSON.parse(JSON.stringify(apiData));
    originalCashers.value = apiData.filter((c) => c.id !== null);
    customCashers.value = apiData.filter((c) => c.id === null);
  };

  // Добавляем новую кассу
  const addCustomCasher = (casher: Omit<Casher, "id">) => {
    const newCasher: Casher = {
      ...casher,
      id: null,
      isCustom: true,
      isEditingTitle: false,
      tempId: `custom-${Date.now()}`,
    };
    customCashers.value.push(newCasher);
  };

  const removeCasher = (casher: { id: number | null; tempId?: string }) => {
    if (casher.id === null) {
      customCashers.value = customCashers.value.filter(
        (c) => c.tempId !== casher.tempId,
      );
    } else {
      originalCashers.value = originalCashers.value.filter(
        (c) => c.id !== casher.id,
      );
      customCashers.value = customCashers.value.filter(
        (c) => c.id !== casher.id,
      );
    }
  };

  const resetChanges = () => {
    try {
      // Создаем глубокие копии
      originalCashers.value = JSON.parse(
        JSON.stringify(initialData.value.filter((c) => c.id !== null)),
      );
      customCashers.value = JSON.parse(
        JSON.stringify(initialData.value.filter((c) => c.id === null)),
      );
    } catch (err) {
      console.error("Ошибка при сбросе изменений:", err);
      throw err;
    }
  };

  const getChanges = () => {
    return allCashers.value;
  };

  return {
    originalCashers,
    customCashers,
    allCashers,
    initialData,
    loadFromApi,
    addCustomCasher,
    removeCasher,
    getChanges,
    resetChanges,
  };
});
