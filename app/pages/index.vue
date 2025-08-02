<script setup lang="ts">
  import { useUserStore } from "~/stores/user";
  // import { useReportStore } from "~/stores/report";
  // import { useCashersStore } from "~/stores/cashers";

  definePageMeta({
    middleware: "auth",
  });

  // interface Casher {
  //   id: number | null;
  //   name: string;
  //   registration_number: string;
  //   serial_number: string;
  //   fn_number: string;
  //   registered_at: string | null;
  //   installed_at: string | null;
  //   order: number;
  //   isEditingTitle?: boolean;
  //   isCustom?: boolean;
  //   tempId?: string;
  //   isDirty?: boolean;
  // }

  // Stores
  const userStore = useUserStore();
  // const reportStore = useReportStore();
  // const cashersStore = useCashersStore();

  // State
  const kktData = ref(null);
  // const initialData = ref<Casher[]>([]);
  const saveMessage = ref("");
  const isError = ref(false);
  // const cashersState = ref("");
  // const isInitialLoad = ref(true);
  const kktLoading = ref(false);
  const kktError = ref<Error | null>(null);

  // Computed
  const userFields = computed(() => [
    { label: "Юридическое лицо", value: userStore.user?.tenant_name },
    { label: "Бренд", value: userStore.user?.brand },
    { label: "Номер помещения", value: userStore.user?.room_number },
    { label: "Номер договора", value: userStore.user?.contract_number },
    { label: "Тип договора", value: userStore.user?.contract_type },
    { label: "Дата заключения договора", value: userStore.user?.contract_date },
  ]);

  // Methods
  // const showMessage = (message: string, error = false) => {
  //   saveMessage.value = message;
  //   isError.value = error;
  //   setTimeout(() => {
  //     saveMessage.value = "";
  //   }, 3000);
  // };

  // const fetchReport = async (contractId: string) => {
  //   try {
  //     return await api.get(`/kkt-data?contractId=${contractId}`);
  //   } catch (error) {
  //     console.error("Ошибка при загрузке данных ККТ:", error);
  //     throw error;
  //   }
  // };

  // const loadKktData = async () => {
  //   kktLoading.value = true;
  //   kktError.value = null;
  //
  //   try {
  //     if (!userStore.contractId) {
  //       await userStore.getUser();
  //     }
  //
  //     kktData.value = await fetchReport(userStore.contractId?.toString() || "");
  //
  //     if (kktData.value?.payload) {
  //       initialData.value = JSON.parse(JSON.stringify(kktData.value.payload));
  //       cashersStore.loadFromApi(kktData.value.payload);
  //       cashersState.value = JSON.stringify(kktData.value.payload);
  //     }
  //   } catch (err) {
  //     console.error("Ошибка при загрузке данных:", err);
  //     kktError.value = err instanceof Error ? err : new Error("Unknown error");
  //     showMessage("Ошибка при загрузке данных", true);
  //   } finally {
  //     kktLoading.value = false;
  //     isInitialLoad.value = false;
  //   }
  // };

  onMounted(async () => {
    // reportStore.clearFormData();
    // await loadKktData();
    console.log("главаная");
  });
</script>

<template>
  <section class="home-view">
    <h2 class="home-view__title">Данные арендатора</h2>

    <div
      v-if="saveMessage"
      class="home-view__message"
      :class="{ error: isError }"
    >
      {{ saveMessage }}
    </div>

    <ul class="home-view__list">
      <li
        v-for="(field, index) in userFields"
        :key="index"
        class="home-view__item"
      >
        <span class="home-view__item-text medium">{{ field.label }}</span>
        <span class="home-view__item-text">{{ field.value ?? "-" }}</span>
      </li>

      <li v-if="kktLoading" class="home-view__item">
        <span class="home-view__item-text">Загрузка данных ККТ...</span>
      </li>

      <li v-else-if="kktError" class="home-view__item">
        <span class="home-view__item-text text-error">
          Ошибка загрузки данных ККТ
          <button class="retry-button" @click="loadKktData">Повторить</button>
        </span>
      </li>

      <!-- Данные ККТ -->
      <template v-else-if="kktData?.payload?.length">
        <li
          v-for="(kkt, index) in kktData.payload"
          :key="`kkt-${index}`"
          class="home-view__item"
          :class="{ 'border-b-0': index === kktData.payload.length - 1 }"
        >
          <span class="home-view__item-text medium">
            Регистрационный номер ККТ {{ index + 1 }}
          </span>
          <span class="home-view__item-text">{{
            kkt?.registration_number
          }}</span>
        </li>
      </template>

      <li v-else class="home-view__item">
        <span class="home-view__item-text">Нет данных о ККТ</span>
      </li>
    </ul>
  </section>
</template>

<style lang="scss">
  .home-view {
    display: flex;
    flex-direction: column;
    width: 100%;

    &__title {
      margin-bottom: rem(40);
      font-size: rem(26);
      font-weight: bold;
      color: var(--a-accentTextDark);
      text-transform: uppercase;
    }

    &__message {
      padding: rem(10);
      margin-bottom: rem(20);
      border-radius: rem(4);

      &.error {
        background-color: #ffebee;
        color: #d32f2f;
      }

      &.success {
        background-color: #e8f5e9;
        color: #2e7d32;
      }
    }

    &__list {
      display: flex;
      flex-direction: column;
      max-width: rem(900);
    }

    &__item {
      display: grid;
      grid-template-columns: 1fr 1fr;
      min-height: rem(36);
      margin-bottom: rem(18);
      border-bottom: 1px solid #d5c29a;

      &-text {
        font-size: rem(18);

        &.medium {
          font-weight: 600;
        }
      }
    }

    .text-error {
      color: #d32f2f;
    }

    .retry-button {
      margin-left: rem(10);
      padding: rem(2) rem(8);
      background: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: rem(4);
      cursor: pointer;
      font-size: rem(14);

      &:hover {
        background: #e0e0e0;
      }
    }
  }
</style>
