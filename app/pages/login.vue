<script setup lang="ts">
  import AuthLayout from "~/layouts/auth.vue";
  import ModulesAuthForm from "~/components/modules/AuthForm.vue";
</script>

<template>
  <auth-layout class="layout layout-auth">
    <section class="signin">
      <h1 class="signin__title">Вход в личный кабинет</h1>
      <ModulesAuthForm />
    </section>
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
