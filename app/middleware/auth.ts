// app/middleware/auth.ts
import { useUserStore } from "~/stores/userData";

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return;

  const userStore = useUserStore();
  const authStore = useAuthStore();
  const { fetchUser } = useUserData();
  const token = useCookie("token").value;
  const isLoginPage = to.path === "/login";

  if (token && !authStore.token) {
    authStore.setToken(token);
  }

  if (!authStore.isAuthenticated && !isLoginPage) {
    return navigateTo("/login");
  }

  if (authStore.isAuthenticated && isLoginPage) {
    return navigateTo("/");
  }

  if (authStore.isAuthenticated && !userStore.user && !userStore.isLoading) {
    try {
      await fetchUser();
    } catch (error: unknown) {
      if (error.response?.status === 401) {
        await authStore.logOut();
        return navigateTo("/login");
      }
      console.error("Failed to fetch user data:", error);
      // Позволяем продолжить, но показываем ошибку в компоненте
    }
  }
});
