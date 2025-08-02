export const useAuthApi = () => {
  const config = useRuntimeConfig();

  const login = async (credentials: { email: string; password: string }) => {
    return $fetch("/auth/login", {
      baseURL: config.public.apiBase,
      method: "POST",
      body: credentials,
      credentials: "include",
    });
  };

  const logout = async () => {
    return $fetch("/auth/logout", {
      baseURL: config.public.apiBase,
      method: "POST",
      credentials: "include",
    });
  };

  const refreshToken = async () => {
    return $fetch("/auth/refresh", {
      baseURL: config.public.apiBase,
      method: "POST",
      credentials: "include",
    });
  };

  return {
    login,
    logout,
    refreshToken,
  };
};
