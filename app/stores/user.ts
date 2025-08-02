// stores/user.ts
interface User {
  id: number;
  tenant_name: string;
  brand: string;
  placeId: number | string;
  docId: number | string;
  docType: string;
  docDate: string;
  category: string;
  kktId: number | string;
  debt: number;
  rentPercent: number;
}

export const useUserStore = defineStore("user", () => {
  const user = ref<User | null>(null);
  const contractId = ref<number | null>(null);
  const isLoading = ref(false);

  const { fetchUser, changeContract } = useUserApi();

  const getUser = async () => {
    isLoading.value = true;
    try {
      const response = await fetchUser();
      user.value = response.payload;
      contractId.value = response.payload.id;
      return response;
    } finally {
      isLoading.value = false;
    }
  };

  const changeUserContract = async (newContractId: number) => {
    if (contractId.value === newContractId) return;

    try {
      await changeContract(newContractId);
      contractId.value = newContractId;
      await getUser();
    } catch (err) {
      console.error("Error changing contract:", err);
      throw err;
    }
  };

  return {
    user,
    contractId,
    isLoading,
    getUser,
    changeContract: changeUserContract,
  };
});
