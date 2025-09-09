export default defineAppConfig({
  theme: {
    primaryColor: "#bf9d7c",
  },
  icon: {
    size: "24px", // default <Icon> size applied
    class: "icon", // default <Icon> class applied
    mode: "css", // default <Icon> mode applied
    aliases: {
      nuxt: "logos:nuxt-icon",
    },
    cssLayer: "base", // set the css layer to inject to
  },

  ui: {
    toast: {
      slots: {
        root:
          "ui-toast relative group overflow-hidden bg-toast shadow-lg" +
          " rounded-lg" +
          " ring ring-default p-4 flex gap-2.5 focus:outline-none",
        wrapper: "w-0 flex-1 flex flex-col",
        title: "text-sm font-medium text-highlighted",
        description: "text-sm text-muted",
        icon: "shrink-0 size-5",
        avatar: "shrink-0",
        avatarSize: "2xl",
        actions: "flex gap-1.5 shrink-0",
        progress: "absolute inset-x-0 bottom-0",
        close: "p-0",
      },
      variants: {
        color: {
          primary: {
            root: "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
            icon: "text-primary",
          },
          secondary: {
            root: "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-secondary",
            icon: "text-secondary",
          },
          success: {
            root: "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-success",
            icon: "text-success",
          },
          info: {
            root: "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-info",
            icon: "text-info",
          },
          warning: {
            root: "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-warning",
            icon: "text-warning",
          },
          error: {
            root: "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-error",
            icon: "text-error",
          },
          neutral: {
            root: "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-inverted",
            icon: "text-highlighted",
          },
        },
        orientation: {
          horizontal: {
            root: "items-center",
            actions: "items-center",
          },
          vertical: {
            root: "items-start",
            actions: "items-start mt-2.5",
          },
        },
        title: {
          true: {
            description: "mt-1",
          },
        },
      },
      defaultVariants: {
        color: "primary",
      },
    },
  },
});
