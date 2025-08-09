<template>
  <UApp>
    <NuxtLayout>
      <!-- Индикатор загрузки между страницами -->
      <!--      <NuxtLoadingIndicator :color="'#00dc82'" :height="3" />-->

      <NuxtPage />

      <!-- Глобальное уведомление для изменения маршрута -->
      <NuxtRouteAnnouncer />
    </NuxtLayout>
  </UApp>
</template>

<script setup>
  useHead({
    titleTemplate: (title) => (title ? `${title} | ЛК` : "Личный кабинет"),
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { hid: "description", name: "description", content: "ЛК" },
      { name: "theme-color", content: "#ffffff" },
    ],
    link: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
    ],
    bodyAttrs: {
      class: "min-h-screen bg-gray-50",
    },
  });
</script>

<style>
  html {
    scroll-behavior: smooth;
  }
  body {
    font-family: "Montserrat", sans-serif;
  }
</style>
