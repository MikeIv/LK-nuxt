export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  try {
    const response = await $fetch(
      "https://lk-schelk.holyhands.ru/api/v1/auth/login",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        credentials: "include",
      },
    );

    // Передаем cookies от бэкенда к фронтенду
    const cookies = (response as unknown).headers?.["set-cookie"];
    if (cookies) {
      for (const cookie of cookies) {
        appendHeader(event, "Set-Cookie", cookie);
      }
    }

    return response;
  } catch (error) {
    throw createError({
      statusCode: error.response?.status || 500,
      statusMessage: error.message,
    });
  }
});
