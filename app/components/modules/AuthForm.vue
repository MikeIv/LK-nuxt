<script setup lang="ts">
  import * as z from "zod";
  import type { FormSubmitEvent } from "@nuxt/ui";
  import { useUserData } from "~/composables/useUser";

  const authStore = useAuthStore();
  const userStore = useUserStore();
  const { fetchUser } = useUserData();

  type ApiError = {
    response?: {
      status?: number;
      data?: {
        message?: string;
      };
    };
    data?: {
      message?: string;
    };
    message?: string;
  };

  const schema = z.object({
    email: z.string().email("Некорректный email"),
    password: z.string().min(3, "Минимум 3 символов"),
  });

  const state = reactive({
    email: "",
    password: "",
  });

  const toast = useToast();
  const isLoading = ref(false);
  const authError = ref("");

  async function onSubmit(event: FormSubmitEvent<typeof schema>) {
    authError.value = "";
    isLoading.value = true;

    try {
      const response = await authStore.logIn(event.data);

      if (response?.success) {
        // Получаем данные пользователя и они автоматически сохраняются в сторе
        await fetchUser();

        // Теперь данные доступны из стора
        console.log("User data from store AUTHFORM:", userStore.user);

        await navigateTo("/", { replace: true });
      }
    } catch (error: unknown) {
      handleError(error as ApiError);
    } finally {
      isLoading.value = false;
    }
  }

  function handleError(error: ApiError) {
    console.error("Auth error:", error);

    if (error.response?.status === 401) {
      authError.value = "Неверный email или пароль";
    } else {
      const message =
        error.response?.data?.message ||
        error.data?.message ||
        error.message ||
        "Ошибка сервера";

      toast.add({
        title: "Ошибка",
        description: message,
        color: "red",
      });
    }
  }
</script>

<template>
  <section class="auth-form">
    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormField class="auth-form__title" label="Логин" name="email" required>
        <UInput
          v-model="state.email"
          autocomplete="email"
          type="email"
          :ui="{ base: 'h-[36px] text-[18px] mt-[8px] bg-lk-light-gray px-5' }"
          variant="soft"
          class="auth-form__input"
          placeholder="Введите логин"
        />
      </UFormField>

      <UFormField
        class="auth-form__title mb"
        label="Пароль"
        name="password"
        required
      >
        <UInput
          v-model="state.password"
          :ui="{ base: 'h-[36px] text-[18px] mt-[8px] bg-lk-light-gray px-5' }"
          variant="soft"
          class="auth-form__input"
          placeholder="Введите пароль"
          type="password"
        />
        <div v-if="authError" class="text-red-500 text-sm mt-2">
          {{ authError }}
        </div>
      </UFormField>

      <UButton
        class="auth-form__btn-submit"
        type="submit"
        :loading="isLoading"
        :disabled="isLoading"
      >
        Войти
      </UButton>
    </UForm>

    <div class="mt-4 text-left text-lk-black auth-form__title">
      Забыли пароль?
      <NuxtLink class="hover:underline" to="/reset-password">
        <span class="auth-form__title--bold">Восстановить</span>
      </NuxtLink>
    </div>
  </section>
</template>

<style lang="scss">
  .auth-form {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;

    &__title {
      margin-bottom: rem(28);
      font-size: rem(18);
      color: var(--a-mainText);

      &--bold {
        font-weight: bold;
      }

      label {
        margin-bottom: rem(10);
        font-size: rem(18);
        color: var(--a-mainText);
      }

      &.mb {
        margin-bottom: rem(40);
      }
    }

    &__input input {
      min-width: rem(420);
      padding: 0 rem(16);
      color: var(--a-mainText);
      border: 1px solid var(--a-mainText);
      background-color: var(--a-bgSepia);
      border-radius: rem(4);
    }

    &__btn-submit {
      margin-bottom: rem(54);
      padding: rem(4) rem(16);
      font-size: rem(18);
      font-weight: bold;
      color: var(--a-black);
      border-radius: rem(4);
      background-color: var(--a-bgAccentExLight);
      cursor: pointer;

      &:hover {
        background-color: var(--a-bgAccent);
      }
    }
  }
</style>
