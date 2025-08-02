// https://nuxt.com/docs/api/configuration/nuxt-config
import svgLoader from "vite-svg-loader";
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  nitro: {
    static: true,
    compressPublicAssets: {
      gzip: true,
      brotli: true,
    },
    routeRules: {
      "/**": {
        headers: {
          "X-Frame-Options": "DENY",
          "X-Content-Type-Options": "nosniff",
          "Referrer-Policy": "strict-origin-when-cross-origin",
          "Permissions-Policy": "geolocation=(), microphone=()",
        },
      },
    },
  },
  devtools: {
    enabled: true,
    timeline: {
      enabled: true,
    },
  },

  build: {
    transpile: ["@nuxt/ui", "truncate-html"],
  },

  ssr: false,

  devServer: {
    https: false,
  },
  features: {
    devLogs: false,
  },
  experimental: {
    payloadExtraction: true,
    componentIslands: true,
    viewTransition: true,
  },

  modules: ["@nuxt/ui", "@nuxt/eslint", "@vueuse/nuxt", "@nuxt/icon"],

  components: [
    { path: "~/components/core", prefix: "Core" },
    { path: "~/components/modules", prefix: "Module" },
    "~/components",
  ],

  imports: {
    dirs: [
      "composables",
      "composables/*/index.{ts,js,mjs,mts}",
      "composables/**",
    ],
  },

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
    checker: {
      lintOnStart: true,
      formatter: "stylish",
    },
    fix: process.env.NODE_ENV === "development",
    cache: true,
  },

  css: [
    "~/assets/styles/main.scss",
    "~/assets/styles/variables/_z-index.scss",
    "~/assets/styles/variables/_colors.scss",
  ],
  postcss: {
    plugins: {
      "@tailwindcss/postcss": {},
      autoprefixer: {},
    },
  },

  icon: {
    customCollections: [
      {
        prefix: "",
        dir: "./app/assets/icons",
      },
    ],
  },

  routeRules: {
    "/": { prerender: true, static: true },
    "/assets/**": {
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    },
    "/_nuxt/**": {
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    },
  },

  vite: {
    build: {
      target: "esnext",
      minify: "esbuild",
      cssMinify: true,
      terserOptions: {
        compress: {
          drop_console: process.env.NODE_ENV === "production",
          drop_debugger: true,
        },
      },
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        output: {
          manualChunks: {
            vue: ["vue", "pinia", "vue-router"],
            ui: ["@headlessui/vue"],
          },
        },
      },
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    },
    plugins: [svgLoader({ svgo: false })],
    css: {
      devSourcemap: true,
      modules: {
        generateScopedName: "[name]__[local]___[hash:base64:5]",
      },
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "sass:math";
            @use "~/assets/styles/tools/functions" as *;
            @use "~/assets/styles/variables" as *;
          `,
        },
      },
    },
  },

  optimizeDeps: {
    include: ["@headlessui/vue", "truncate-html"],
    exclude: ["@nuxt/ui"],
  },
});
