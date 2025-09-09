import { defineStore } from "pinia";
import { useCookie } from "#app";

interface TokenResponse {
  success: boolean;
  message: string;
  payload: {
    access_token: string;
    refresh_token: string;
  };
}

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const refreshTimeout = ref<NodeJS.Timeout | null>(null);
  const config = useRuntimeConfig();

  const router = useRouter();
  const authStore = useAuthStore();

  // Сохраняем токен и настраиваем таймер обновления
  const setToken = (newToken: string) => {
    token.value = newToken;
    const cookie = useCookie("token", {
      maxAge: 60 * 120, // 120 минут (как access token)
      secure: true,
      sameSite: "strict",
    });
    cookie.value = newToken;

    scheduleTokenRefresh(120 * 60 * 1000); // 120 минут
  };

  const clearToken = () => {
    token.value = null;
    useCookie("token").value = null;
    if (refreshTimeout.value) {
      clearTimeout(refreshTimeout.value);
      refreshTimeout.value = null;
    }
  };

  const scheduleTokenRefresh = (delay: number) => {
    if (refreshTimeout.value) {
      clearTimeout(refreshTimeout.value);
    }

    refreshTimeout.value = setTimeout(async () => {
      try {
        await refreshToken();
      } catch (err) {
        console.error("Failed to refresh token:", err);
        await logOut();
      }
    }, delay);
  };

  // Основной метод обновления токена
  const refreshToken = async (): Promise<TokenResponse> => {
    try {
      const response = await $fetch<TokenResponse>("/auth/refresh", {
        baseURL: config.public.apiBase,
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      if (response.success) {
        setToken(response.payload.access_token);
      }

      return response;
    } catch (err: unknown) {
      error.value = err.data?.message || "Ошибка обновления токена";
      throw err;
    }
  };

  const logIn = async (credentials: { email: string; password: string }) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await $fetch<TokenResponse>("/auth/login", {
        baseURL: config.public.apiBase,
        method: "POST",
        body: credentials,
        credentials: "include",
      });

      if (response.success) {
        setToken(response.payload.access_token);
      }

      return response;
    } catch (err: unknown) {
      error.value = err.data?.message || "Ошибка авторизации";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const logOut = async () => {
    try {
      await $fetch("/auth/logout", {
        baseURL: config.public.apiBase,
        method: "POST",
        credentials: "include",
        headers: authStore.token
          ? {
              Authorization: `Bearer ${authStore.token}`,
            }
          : {},
      }).catch((err) => {
        // Игнорируем ошибки сервера при logout, так как главное - очистить клиентскую сторону
        console.warn("Server logout failed (may be expected):", err.message);
      });
    } catch (err) {
      console.warn("Logout request failed:", err);
    } finally {
      // Всегда очищаем токен на клиенте
      clearToken();
      await router.push("/login");
    }
  };

  const init = () => {
    const savedToken = useCookie("token").value;
    if (savedToken) {
      token.value = savedToken;
      scheduleTokenRefresh(14 * 60 * 1000);
    }
  };

  init();

  const isAuthenticated = computed(() => !!token.value);

  return {
    token,
    isLoading,
    error,
    isAuthenticated,
    logIn,
    logOut,
    refreshToken,
  };
});
