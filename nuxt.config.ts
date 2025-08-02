// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ["@nuxt/ui", "@nuxt/eslint", "@vueuse/nuxt", "@nuxt/icon"],

  eslint: {
    config: {
      plugins: ["vue"],
      extends: [
        "plugin:vue/vue3-essential",
        "@nuxt/eslint-config",
        "plugin:prettier/recommended",
      ],
      rules: {
        "vue/no-multiple-template-root": "off",
        "vue/require-default-prop": "off",
        "vue/multi-word-component-names": "warn",
        "vue/attribute-hyphenation": "warn",
        "vue/v-on-event-hyphenation": "warn",
        "no-console": process.env.NODE_ENV === "production" ? "error" : "warn",
        "no-debugger": process.env.NODE_ENV === "production" ? "error" : "warn",

        "vue/html-indent": [
          "error",
          2,
          {
            baseIndent: 1,
            ignores: [],
          },
        ],
      },
    },
  },
});
