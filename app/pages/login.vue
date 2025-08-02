<script setup lang="ts">
  import ModulesAuthForm from "~/components/modules/AuthForm.vue";

  definePageMeta({
    layout: "auth",
  });
</script>

<template>
  <section :class="$style.signin">
    <h1 :class="$style.title">Вход в личный кабинет</h1>
    <ModulesAuthForm />
  </section>
</template>

<style module lang="scss">
  .signin {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    max-width: rem(600);
    margin: auto;
    padding: rem(10) 0 rem(80);
  }
  .title {
    margin-bottom: rem(60);
    font-size: 28px;
    font-weight: bold;
    text-transform: uppercase;
    color: var(--a-accentText);
  }
</style>
