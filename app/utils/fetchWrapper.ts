export async function customFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const store = useLogin();
  const base =
    import.meta.env.VITE_BASE_API_URL ||
    "https://lk-schelk.holyhands.ru/api/v1/";

  // Убедимся, что URL формируется правильно
  const fullUrl = url.startsWith("http")
    ? url
    : `${base}${url.replace(/^\//, "")}`;

  const headers = new Headers({
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(store.contractId ? { "contract-id": `${store.contractId}` } : {}),
  });

  // Добавляем Origin только для разработки
  if (import.meta.env.DEV) {
    headers.set("Origin", "http://localhost:5172");
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: "include",
    mode: "cors",
  };

  try {
    // Сначала пробуем OPTIONS запрос для проверки CORS
    const preflightResponse = await fetch(fullUrl, {
      method: "OPTIONS",
      headers,
      credentials: "include",
      mode: "cors",
    });

    if (!preflightResponse.ok) {
      throw new Error(`CORS preflight failed: ${preflightResponse.status}`);
    }

    // Основной запрос
    const response = await fetch(fullUrl, fetchOptions);

    if (response.status === 401 && !url.includes("auth/refresh")) {
      // Логика обновления токена...
    }

    return response;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}

