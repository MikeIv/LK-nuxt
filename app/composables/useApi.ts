type ApiResponse<T> = {
  success: boolean;
  message?: string;
  payload: T;
};

type ApiOptions<T = unknown> = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: T;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
};

export const useApi = <T>() => {
  const config = useRuntimeConfig();
  const API_BASE_URL = config.public.apiBase;
  const authStore = useAuthStore();

  const data = ref<T | null>(null);
  const error = ref<string | null>(null);
  const isLoading = ref(false);

  const callApi = async <D = unknown>(
    endpoint: string,
    options: ApiOptions<D> = { method: "GET" },
  ): Promise<T | null> => {
    const fullUrl = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    isLoading.value = true;
    error.value = null;

    try {
      // Базовые заголовки
      const headers: Record<string, string> = {
        Accept: "application/json",
        ...(authStore.token && { Authorization: `Bearer ${authStore.token}` }),
        ...options.headers,
      };

      // Не устанавливаем Content-Type для FormData
      if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
      }

      const response = await $fetch<ApiResponse<T>>(fullUrl, {
        method: options.method,
        body: options.method !== "GET" ? options.body : undefined,
        params: options.method === "GET" ? options.params : undefined,
        credentials: "include",
        headers,
      });

      if (response.success) {
        data.value = response.payload;
        return response.payload;
      } else {
        throw new Error(response.message || "Request failed");
      }
    } catch (err: unknown) {
      const errorMessage = err?.message || "Request error";
      error.value = errorMessage;
      console.error("API call error:", {
        endpoint,
        error: errorMessage,
        status: err?.status,
      });

      // Auto-refresh token on 401
      if (err?.status === 401 && authStore.token) {
        try {
          await authStore.refreshToken();
          return await callApi(endpoint, options);
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          await authStore.logOut();
        }
      }

      return null;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    data,
    error,
    isLoading,
    callApi,
  };
};
