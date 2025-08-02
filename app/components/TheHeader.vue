<script setup lang="ts">
  import logo from "~/assets/new-logo.svg";
  // import { useLogin } from "~/stores/auth";
  // import { customFetch } from "~/utils/fetchWrapper";

  // async function resetPassword(resetData) {
  //   let data;
  //   try {
  //     const res = await customFetch(`auth/forgot`, {
  //       method: "POST",
  //       body: JSON.stringify(resetData),
  //     });
  //     data = await res.json();
  //     console.log(data);
  //   } catch {}
  //   return { data };
  // }
</script>

<template>
  <header class="auth-header">
    <div class="auth-header__row">
      <img
        width="90"
        height="90"
        class="auth-header__logo"
        :src="logo"
        alt="Лого тц щелковского"
      />
      <h1 class="auth-header__title">Личный кабинет арендатора</h1>
    </div>
  </header>
</template>

<style lang="scss">
  .auth-header {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    max-height: rem(150);
    padding: rem(40) rem(80);
    background-color: var(--a-mainBg);

    &__row {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
    }

    &__logo {
      position: absolute;
      left: rem(40);
      top: calc(50% - 45px);
    }

    &__title {
      font-size: rem(34);
      font-weight: bold;
      text-transform: uppercase;
      color: var(--a-mainText);
    }
  }
</style>
