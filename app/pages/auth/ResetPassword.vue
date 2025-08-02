<script setup lang="ts">
  import AuthLayout from "~/layouts/auth.vue";

  // import { DateFormatter } from "@internationalized/date";

  // const df = new DateFormatter("ru-RU", {
  //   dateStyle: "medium",
  // });

  // const userStore = useLogin();
  // const router = useRouter();
  // const schema = z.object({
  //   email: z
  //     .string({ required_error: "Поле обязательно для заполнения" })
  //     .email("Неправильный формат email"),
  //   contract_number: z.string({
  //     required_error: "Поле обязательно для заполнения",
  //   }),
  //   date_at: z.string({ required_error: "Поле обязательно для заполнения" }),
  // });

  // type Schema = z.output<typeof schema>;
  //
  //
  // const toast = useToast();
  // const isLoading = ref(false);

  /* async function onSubmit(event: FormSubmitEvent<Schema>) {
    console.log(event.data);

    isLoading.value = true;
    try {
      const { data } = await userStore.resetPassword(event.data);
      console.log(data);
      if (data.errors || !data.success) {
        toast.add({
          description: data.message || "Что то пошло не так",
          variant: "destructive",
        });
      } else if (data.success) {
        toast.add({
          description: data.message,
        });
        await router.push("/");
      }
      console.log("Form submitted!", event.data);
    } catch (e) {
      console.log("error");
      toast.add({
        title: "Что то пошло не так.",
        description: "Попробуйте позже или обратитесь за помощью",
        variant: "destructive",
      });
    } finally {
      isLoading.value = false;
    }
  }*/
</script>

<template>
  <auth-layout class="layout layout-auth">
    <div class="signin">
      <h1 class="signin__title">Восстановить пароль</h1>
      <reset-auth-form />
    </div>
  </auth-layout>
</template>

<style lang="scss">
  .layout-auth {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  .signin {
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-width: rem(600);
    padding: rem(10) 0 rem(80);

    &__title {
      margin-bottom: rem(60);
      font-size: 28px;
      font-weight: bold;
      text-transform: uppercase;
      color: var(--a-accentText);
    }
  }
</style>
