export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return;

  const authStore = useAuthStore();
  const user = useUser();
  const token = useCookie("token").value;
  const isLoginPage = to.path === "/login";

  // 1. Если есть токен в куках, но нет в хранилище - синхронизируем
  if (token && !authStore.token) {
    authStore.setToken(token);
  }

  // 2. Если пользователь не авторизован и это не страница логина
  if (!authStore.isAuthenticated && !isLoginPage) {
    return navigateTo("/login");
  }

  // 3. Если пользователь авторизован И находится на странице логина
  if (authStore.isAuthenticated && isLoginPage) {
    return navigateTo("/");
  }

  // 4. Если пользователь авторизован, но данные не загружены
  if (authStore.isAuthenticated && !user.user.value && !user.isLoading.value) {
    try {
      await user.fetchUser();
    } catch (error) {
      // Если ошибка 401 - разлогиниваем
      if (error.response?.status === 401) {
        await authStore.logOut();
        return navigateTo("/login");
      }
      console.error("Failed to fetch user data:", error);
    }
  }
});
