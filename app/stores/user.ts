import type { UserData } from "~/types/user";

export const useUser = () => {
  const { data: user, error, isLoading, callApi } = useApi<UserData>();

  const fetchUser = async (): Promise<UserData | null> => {
    return await callApi("/user/me");
  };

  const changeContract = async (
    newContractId: number,
  ): Promise<UserData | null> => {
    return await callApi("/user/change-contract", {
      method: "POST",
      body: { contractId: newContractId },
    });
  };

  return {
    user,
    error,
    isLoading,
    fetchUser,
    changeContract,
  };
};
