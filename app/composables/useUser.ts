// app/composables/useUser.ts
import type { UserData } from "~/types/user";

export const useUser = () => {
  const { data: user, error, isLoading, fetchData } = useApi<UserData>();

  const fetchUser = async (): Promise<UserData | null> => {
    try {
      return await fetchData("/api/user/me");
    } catch (err) {
      console.error("Failed to fetch user data:", err);
      return null;
    }
  };

  const changeContract = async (
    newContractId: number,
  ): Promise<UserData | null> => {
    try {
      return await fetchData("/api/user/change-contract", {
        method: "POST",
        body: { contractId: newContractId },
      });
    } catch (err) {
      console.error("Failed to change contract:", err);
      return null;
    }
  };

  return {
    user,
    error,
    isLoading,
    fetchUser,
    changeContract,
  };
};

