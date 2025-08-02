export const useUserApi = () => {
  const config = useRuntimeConfig();

  const fetchUser = async () => {
    return $fetch("/user/me", {
      baseURL: config.public.apiBase,
      method: "GET",
      credentials: "include",
    });
  };

  const changeContract = async (contractId: number) => {
    return $fetch("/user/change-contract", {
      baseURL: config.public.apiBase,
      method: "POST",
      body: { contractId },
      credentials: "include",
    });
  };

  return {
    fetchUser,
    changeContract,
  };
};
