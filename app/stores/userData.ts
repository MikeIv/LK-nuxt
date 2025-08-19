// app/stores/user.ts
import { defineStore } from "pinia";
import type { UserData } from "~~/shared/types/user";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null as UserData | null,
    isLoading: false,
    error: null as string | null,
  }),

  persist: {
    enabled: true,
    strategies: [
      {
        key: "user",
        storage: import.meta.client ? localStorage : null,
      },
    ],
  },

  actions: {
    setUser(userData: UserData | null) {
      this.user = userData;
    },

    setLoading(loading: boolean) {
      this.isLoading = loading;
    },

    setError(error: string | null) {
      this.error = error;
    },

    clearUser() {
      this.user = null;
      this.error = null;
    },
  },

  getters: {
    isAuthenticated: (state) => !!state.user,
  },
});
