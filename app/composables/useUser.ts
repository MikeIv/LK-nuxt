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

  const updateProfile = async (
    profileData: Partial<UserData>,
  ): Promise<UserData | null> => {
    return await callApi("/user/profile", {
      method: "PATCH",
      body: profileData,
    });
  };

  const deleteAccount = async (): Promise<boolean> => {
    const result = await callApi("/user/account", {
      method: "DELETE",
    });
    return result !== null;
  };

  return {
    user,
    error,
    isLoading,
    fetchUser,
    changeContract,
    updateProfile,
    deleteAccount,
  };
};
