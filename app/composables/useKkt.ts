import { useApi } from "./useApi";
import { useAuthStore } from "~/stores/auth";
import { useUserStore } from "~/stores/userData";

export const useKkt = () => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();
  const userStore = useUserStore();

  const {
    data: kktData,
    isLoading: kktLoading,
    error: kktError,
    callApi,
    pagination,
  } = useApi<unknown[]>();

  const loadKktData = async (): Promise<boolean> => {
    try {
      if (!userStore.user?.id) {
        await userStore.getUser();
      }

      if (!authStore.token) {
        throw new Error("Токен авторизации отсутствует");
      }

      const response = await callApi(`${config.public.apiBase}/tenants/kkts`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      });

      // Проверяем успешность ответа
      if (response && "success" in response && !response.success) {
        throw new Error(response.message || "Ошибка при загрузке данных ККТ");
      }

      return true;
    } catch (err: unknown) {
      console.error("Ошибка при загрузке данных ККТ:", err);

      if ((err as unknown)?.statusCode === 401) {
        console.error("Требуется повторная авторизация");
        throw err;
      }

      throw err;
    }
  };

  return {
    kktData,
    kktLoading,
    kktError,
    loadKktData,
    pagination,
  };
};
