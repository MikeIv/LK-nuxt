export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.client) {
    const authStore = useAuthStore();
    const token = useCookie("token").value;

    if (!token && to.path !== "/login") {
      return navigateTo("/login");
    }

    if (token && !authStore.token) {
      authStore.token = token;
    }
  }
});
