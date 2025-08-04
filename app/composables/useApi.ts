type ApiResponse<T> = {
  success: boolean;
  message?: string;
  payload: T;
};

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
};

export const useApi = <T>() => {
  const data: Ref<T | null> = ref(null);
  const error = ref<Error | string | null>(null);
  const isLoading: Ref<boolean> = ref(false);

  const fetchData = async (
    url: string,
    options: ApiOptions = { method: "GET" },
  ): Promise<T | null> => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await $fetch<ApiResponse<T>>(url, {
        method: options.method,
        body: options.body,
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (response.success) {
        data.value = response.payload;
        return response.payload;
      } else {
        throw new Error(response.message || "Ошибка при выполнении запроса");
      }
    } catch (err: unknown) {
      error.value = (err as Error).message || "Ошибка при выполнении запроса";
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
