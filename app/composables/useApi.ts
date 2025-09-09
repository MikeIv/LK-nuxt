type ApiResponsePayload<T = unknown> = T;

type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  payload?: ApiResponsePayload<T>;
};

type PaginationMeta = {
  current_page: number;
  from: number;
  last_page: number;
  path: string;
  per_page: number;
  to: number;
  total: number;
};

type LaravelPaginatedResponse<T = unknown> = {
  data: T[];
  links: {
    first: string;
    last: string;
    next: string | null;
    prev: string | null;
  };
  meta: PaginationMeta;
};

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type ResponseType = "json" | "blob";

type ApiOptions<D = unknown> = {
  method?: HttpMethod;
  body?: D;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  responseType?: ResponseType;
};

export const useApi = <T = unknown>() => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  const data: Ref<T | null> = ref(null);
  const fullResponse: Ref<ApiResponse<T> | LaravelPaginatedResponse<T> | null> =
    ref(null);
  const error: Ref<string | null> = ref(null);
  const isLoading: Ref<boolean> = ref(false);
  const pagination: Ref<PaginationMeta | null> = ref(null);

  const isApiResponse = (response: unknown): response is ApiResponse<T> => {
    return (
      typeof response === "object" && response !== null && "success" in response
    );
  };

  const isLaravelPaginatedResponse = (
    response: unknown,
  ): response is LaravelPaginatedResponse<T> => {
    return (
      typeof response === "object" &&
      response !== null &&
      "data" in response &&
      "meta" in response
    );
  };

  const callApi = async <D = unknown>(
    endpoint: string,
    options: ApiOptions<D> = { method: "GET", responseType: "json" },
  ): Promise<ApiResponse<T> | LaravelPaginatedResponse<T> | Blob | null> => {
    const fullUrl = endpoint.startsWith("http")
      ? endpoint
      : `${config.public.apiBase}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    isLoading.value = true;
    error.value = null;

    try {
      const headers: Record<string, string> = {
        Accept: "application/json",
        ...(authStore.token && { Authorization: `Bearer ${authStore.token}` }),
        ...options.headers,
      };

      if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
      }

      const response = await $fetch<
        ApiResponse<T> | LaravelPaginatedResponse<T> | Blob
      >(fullUrl, {
        method: options.method,
        body: options.method !== "GET" ? options.body : undefined,
        params: options.method === "GET" ? options.params : undefined,
        credentials: "include",
        headers,
        responseType: options.responseType,
      });

      fullResponse.value = response instanceof Blob ? null : response;

      if (response instanceof Blob) {
        return response;
      }

      if (isLaravelPaginatedResponse(response)) {
        data.value = response.data as T;
        pagination.value = response.meta;
        return response;
      }

      if (isApiResponse(response)) {
        data.value = response.payload as T;
        return response;
      }

      data.value = response as T;
      return {
        success: true,
        payload: response,
      } as ApiResponse<T>;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Request failed";
      error.value = errorMessage;

      console.error("API call error:", {
        endpoint,
        error: errorMessage,
        status: (err as { statusCode?: number })?.statusCode,
      });

      if (
        (err as { statusCode?: number })?.statusCode === 401 &&
        authStore.token
      ) {
        try {
          await authStore.refreshToken();
          return await callApi(endpoint, options);
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          await authStore.logOut();
          navigateTo("/login");
        }
      }

      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      isLoading.value = false;
    }
  };

  return {
    data,
    fullResponse,
    error,
    isLoading,
    pagination,
    callApi,
  };
};
