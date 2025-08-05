import { useLogin } from "~/stores/auth";

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
  timeout?: number;
}

export async function customFetch(
  url: string,
  options: FetchOptions = {},
): Promise<Response> {
  const store = useLogin();
  const base = import.meta.env.VITE_BASE_API_URL;
  const timeout = options.timeout || 60000;

  if (!base) {
    throw new Error("VITE_BASE_API_URL is not defined");
  }

  const full = `${base}${url}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Базовые заголовки без Content-Type по умолчанию
  const baseHeaders: Record<string, string> = {
    Accept: "application/json",
  };

  if (store.contractId) {
    baseHeaders["contract-id"] = store.contractId.toString();
  }

  let triedRefresh = false;

  function buildFetchInit(includeAuth = true): RequestInit {
    const headers: Record<string, string> = {
      ...baseHeaders,
      ...(options.headers || {}),
    };

    // Не устанавливаем Content-Type для FormData - браузер сделает это сам
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    if (includeAuth && store.token) {
      headers["Authorization"] = `Bearer ${store.token}`;
    }

    return {
      ...options,
      headers,
      signal: controller.signal,
    };
  }

  async function doFetch(): Promise<Response> {
    try {
      console.log("Before fetch");
      const response = await fetch(full, buildFetchInit(true));
      console.log("After fetch");
      clearTimeout(timeoutId);
      return response;
    } catch (err) {
      console.error("Fetch error:", err);
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === "AbortError") {
        throw new Error(`Request timed out after ${timeout}ms`);
      }
      throw err;
    }
  }

  let response: Response;

  console.log("Starting request to:", full);
  const start = Date.now();
  try {
    response = await doFetch();
    console.log("Request completed in:", Date.now() - start, "ms");
  } catch (err) {
    console.error("Request failed after:", Date.now() - start, "ms", err);
    throw err instanceof Error ? err : new Error("Request failed");
  }

  if (response.status === 419) {
    await store.logOut();
    throw new Error("Session expired. Please sign in again.");
  }

  if (response.status === 401 && !triedRefresh) {
    triedRefresh = true;
    try {
      console.log("Attempting token refresh...");
      const refreshStart = Date.now();
      const refreshRes = await fetch(`${base}auth/refresh`, {
        ...buildFetchInit(false),
        method: "POST",
      });

      console.log(
        "Token refresh completed in:",
        Date.now() - refreshStart,
        "ms",
      );

      if (!refreshRes.ok) throw new Error("Refresh failed");
      const data = await refreshRes.json();
      if (!data?.payload?.access_token)
        throw new Error("Invalid refresh response");

      store.token = data.payload.access_token;
      response = await doFetch();
    } catch (error) {
      console.log(error);
      await store.logOut();
      throw new Error("Session expired. Please sign in again.");
    }
  }

  if (response.status === 401) {
    await store.logOut();
    throw new Error("Session expired. Please sign in again.");
  }

  return response;
}
