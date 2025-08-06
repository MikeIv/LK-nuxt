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
      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(authStore.token && { Authorization: `Bearer ${authStore.token}` }),
        ...options.headers,
      };

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
      error.value = err.message || "Request error";

      // Auto-refresh token on 401
      if (err.status === 401 && authStore.token) {
        try {
          await authStore.refreshToken();
          return await callApi(endpoint, options);
        } catch (refreshError) {
          console.log(refreshError);
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
