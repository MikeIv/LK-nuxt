export default defineNuxtPlugin(() => {
  const { $config } = useNuxtApp();

  const api = $fetch.create({
    baseURL: $config.public.apiBase,
    credentials: "include",
    onRequest({ options }) {
      const token = localStorage.getItem("access_token");
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    },
    onResponseError({ response }) {
      if (response.status === 401) {
        // Обработка истечения срока действия токена
      }
    },
  });

  return {
    provide: {
      api,
    },
  };
});

