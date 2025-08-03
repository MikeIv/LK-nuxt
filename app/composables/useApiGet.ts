export const useApiGet = <T>() => {
  const data: Ref<T | null> = ref(null);
  const error: Ref<string | null> = ref(null);
  const isLoading: Ref<boolean> = ref(false);

  const fetchData = async (url: string): Promise<T | null> => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await $fetch<{
        success: boolean;
        message?: string;
        payload: T;
      }>(url, {
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (response.success) {
        data.value = response.payload;
        return response.payload;
      } else {
        throw new Error(response.message || "Ошибка при получении данных");
      }
    } catch (err: unknown) {
      error.value = (err as Error).message || "Ошибка при получении данных";
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    data,
    error,
    isLoading,
    fetchData,
  };
};

