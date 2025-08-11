// types/api.ts
export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  payload?: T;
};

export type LaravelPaginatedResponse<T> = {
  data: T[];
  links: {
    first: string;
    last: string;
    next: string | null;
    prev: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
};

export type ApiOptions<T = unknown> = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: T;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  responseType?: "json" | "blob";
};

// composables/useApi.ts
export const useApi = <T>() => {
  const config = useRuntimeConfig();
  const API_BASE_URL = config.public.apiBase;
  const authStore = useAuthStore();

  const data = ref<T | null>(null);
  const error = ref<string | null>(null);
  const isLoading = ref(false);
  const pagination = ref<LaravelPaginatedResponse<T>["meta"] | null>(null);

  const callApi = async <D = unknown>(
    endpoint: string,
    options: ApiOptions<D> = { method: "GET", responseType: "json" },
  ): Promise<T | Blob | null> => {
    const fullUrl = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    isLoading.value = true;
    error.value = null;
    pagination.value = null;

    try {
      const headers: Record<string, string> = {
        ...(options.responseType === "json" && { Accept: "application/json" }),
        ...(authStore.token && { Authorization: `Bearer ${authStore.token}` }),
        ...options.headers,
      };

      if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
      }

      const response = await $fetch<
        ApiResponse<T> | LaravelPaginatedResponse<T> | Blob | T
      >(fullUrl, {
        method: options.method,
        body: options.method !== "GET" ? options.body : undefined,
        params: options.method === "GET" ? options.params : undefined,
        credentials: "include",
        headers,
        responseType: options.responseType === "blob" ? "blob" : "json",
      });

      // Обработка Blob (файлов)
      if (response instanceof Blob) {
        return response;
      }

      // Обработка пагинированного ответа Laravel
      if (
        typeof response === "object" &&
        response !== null &&
        "data" in response &&
        "meta" in response
      ) {
        data.value = response.data as T;
        pagination.value = response.meta;
        return response.data as T;
      }

      // Обработка стандартного API ответа ({ success, payload })
      if (
        typeof response === "object" &&
        response !== null &&
        "success" in response
      ) {
        if (response.success) {
          data.value = response.payload as T;
          return response.payload as T;
        } else {
          throw new Error(response.message || "Request failed");
        }
      }

      // Обработка прямого ответа (например, просто массив)
      data.value = response as T;
      return response as T;
    } catch (err: unknown) {
      const errorMessage = err?.message || "Request error";
      error.value = errorMessage;
      console.error("API call error:", {
        endpoint,
        error: errorMessage,
        status: err?.status,
      });

      // Авто-обновление токена при 401
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
    pagination,
    callApi,
  };
};
