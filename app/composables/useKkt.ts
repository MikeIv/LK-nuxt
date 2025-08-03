import { useApi } from "./useApi";
import { useUserStore } from "~/stores/user";
import { useAuthStore } from "~/stores/auth";
import { useRuntimeConfig } from "#imports";

export const useKkt = () => {
  const config = useRuntimeConfig();
  const userStore = useUserStore();
  const authStore = useAuthStore();
  const {
    data: kktData,
    isLoading: kktLoading,
    error: kktError,
    fetchData,
  } = useApi<unknown[]>();

  const loadKktData = async (): Promise<boolean> => {
    try {
      if (!userStore.user?.id) {
        await userStore.getUser();
      }

      if (!authStore.token) {
        throw new Error("Токен авторизации отсутствует");
      }

      await fetchData(`${config.public.apiBase}/tenants/kkts`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      });

      return true;
    } catch (err: unknown) {
      console.error("Ошибка при загрузке данных ККТ:", err);

      // Попробуем обновить токен, если ошибка 401
      if (err.response?.status === 401) {
        try {
          await authStore.refreshToken();
          return await loadKktData(); // Повторяем запрос после обновления токена
        } catch (refreshError) {
          console.error("Ошибка обновления токена:", refreshError);
          throw refreshError;
        }
      }

      throw err;
    }
  };

  return {
    kktData,
    kktLoading,
    kktError,
    loadKktData,
  };
};
