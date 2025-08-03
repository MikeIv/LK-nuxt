<script setup lang="ts">
  // import logo from "~/assets/new-logo.svg";
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
  <header :class="$style.header">
    <div :class="$style.row">
      <UIcon name="i-logo" :class="$style.logoIcon" />
      <h1 :class="$style.title">Личный кабинет арендатора</h1>
    </div>
  </header>
</template>

<style module lang="scss">
  .header {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    max-height: rem(150);
    padding: rem(40) rem(80);
    background-color: var(--a-mainBg);
  }

  .row {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }

  .logoIcon {
    position: absolute;
    left: rem(40);
    top: calc(50% - 45px);
    width: rem(90);
    height: rem(90);
  }

  .title {
    font-size: rem(34);
    font-weight: bold;
    text-transform: uppercase;
    color: var(--a-mainText);
  }
</style>

