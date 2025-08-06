<script setup lang="ts">
  import { useLocalStorage } from "@vueuse/core";
  import { useUser } from "~/stores/user";
  import { useApi } from "~/composables/useApi";
  const { isActive } = useActiveRoute();

  const userStore = useUser();
  const { isLoading } = useApi();
  const sidebarCollapsed = useLocalStorage("sidebarCollapsed", false);

  const toggleSidebar = () =>
    (sidebarCollapsed.value = !sidebarCollapsed.value);

  const navLinks = [
    { to: "/", icon: "i-home", text: "На главную" },
    { to: "/record", icon: "i-report", text: "Сформировать отчет" },
    { to: "/archive", icon: "i-archive", text: "Архив отчетов" },
    { to: "/cashiers", icon: "i-cashier", text: "Мои кассы" },
  ];

  const debtStatus = computed(() => ({
    hasDebt: userStore.user?.debt > 0,
    debtCount: userStore.user?.debt,
    iconColor: userStore.user?.debt > 0 ? "var(--a-error)" : "var(--a-success)",
    bgClass: userStore.user?.debt > 0 ? "hasDebt" : "noDebt",
  }));

  // onMounted(async () => {
  //   try {
  //     await userStore.getUser();
  //   } catch (err) {
  //     console.error("Failed to load user data:", err);
  //   }
  // });
</script>

<template>
  <section :class="$style.sidebar">
    <UIcon
      name="i-logo-light"
      :class="$style.logoIcon"
      style="color: var(--a-white)"
    />

    <!-- Блок с состоянием задолженности -->
    <div
      :class="[
        $style.item,
        $style.itemStart,
        { '!max-w-[160px]': sidebarCollapsed },
        $style[debtStatus.bgClass],
      ]"
    >
      <UIcon
        name="i-ok-icon"
        :class="$style.icon"
        :style="{ color: debtStatus.iconColor }"
      />
      <div v-if="!sidebarCollapsed" :class="$style.title">
        {{
          debtStatus.hasDebt
            ? `Есть задолженность: ${debtStatus.debtCount} отчет`
            : "Задолженности нет"
        }}
      </div>
    </div>

    <!-- Навигационное меню -->
    <ul :class="$style.list">
      <li v-for="link in navLinks" :key="link.to">
        <NuxtLink
          :to="link.to"
          :class="[
            $style.item,
            $style.link,
            { '!max-w-[160px]': sidebarCollapsed },
            { [$style.activeLink]: isActive(link.to) },
          ]"
        >
          <UIcon :name="link.icon" :class="$style.iconLink" />
          <span v-if="!sidebarCollapsed" :class="$style.title">
            {{ link.text }}
          </span>
        </NuxtLink>
      </li>
    </ul>

    <!-- Кнопка сворачивания/разворачивания -->
    <button
      :class="[$style.state, { '!max-w-[160px] !mr-[25%]': sidebarCollapsed }]"
      @click="toggleSidebar"
    >
      <UIcon
        :name="sidebarCollapsed ? 'i-not-collapsed' : 'i-collapsed'"
        :class="$style.iconLink"
      />
      <span :class="$style.stateTitle">
        {{ sidebarCollapsed ? "Развернуть панель" : "Свернуть панель" }}
      </span>
    </button>

    <div v-if="isLoading" :class="$style.loading">Загрузка данных...</div>
  </section>
</template>

<style module lang="scss">
  .sidebar {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding-top: rem(140);
    position: relative;
  }

  .logoIcon {
    position: absolute;
    top: rem(24);
    left: 0;
    width: rem(100);
    height: rem(100);
    color: var(--a-white);
  }

  .hasDebt {
    background-color: var(--a-bgRed);
  }

  .noDebt {
    background-color: var(--a-bgGreen);
  }

  .list {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: rem(16);
  }

  .item {
    display: flex;
    align-items: center;
    height: rem(48);
    padding: 0 rem(18);
    font-size: rem(16);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background-color: var(--a-bgAccentExLight);
    }
  }

  .itemStart {
    height: rem(60);
    margin-bottom: rem(40);
    font-size: rem(18);
    color: var(--a-white);
  }

  .activeLink {
    background-color: var(--a-bgAccentExLight);
    transition: background-color 0.3s ease;
    &:hover {
      background-color: var(--color-primary-200);
    }
  }

  .title {
    margin-left: rem(20);
    font-weight: bold;
  }

  .icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: rem(32);
    height: rem(32);
  }

  .iconLink {
    width: rem(24);
    height: rem(24);
  }

  .state {
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    width: max-content;
    margin-top: auto;
    margin-bottom: rem(40);
    cursor: pointer;
    background: none;
    border: none;
    padding: rem(8);
    color: inherit;

    &:hover {
      opacity: 0.8;
    }
  }

  .stateTitle {
    max-width: rem(100);
    margin-top: rem(10);
    font-size: rem(13);
    font-weight: bold;
    line-height: 1.2;
    text-align: left;
  }

  .loading {
    position: absolute;
    bottom: rem(20);
    left: 0;
    right: 0;
    text-align: center;
    color: var(--a-info);
    font-size: rem(14);
  }
</style>
