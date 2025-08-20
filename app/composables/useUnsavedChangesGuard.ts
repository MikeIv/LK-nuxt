export const useUnsavedChangesGuard = (hasChanges: Ref<boolean>) => {
  const router = useRouter();

  const checkUnsavedChanges = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (hasChanges.value) {
        if (
          confirm("Все несохраненные изменения будут потеряны. Продолжить?")
        ) {
          resolve(true);
        } else {
          resolve(false);
        }
      } else {
        resolve(true);
      }
    });
  };

  const setupGuard = () => {
    let cleanup: (() => void) | null = null;

    if (typeof window !== "undefined") {
      const handleBeforeUnload = (event: BeforeUnloadEvent) => {
        if (hasChanges.value) {
          event.preventDefault();
          event.returnValue = "Вы не сохранили свои данные";
        }
      };

      window.addEventListener("beforeunload", handleBeforeUnload);

      const unsubscribe = router.beforeEach(async (to, from, next) => {
        // Пропускаем навигацию на ту же страницу
        if (to.path === from.path) {
          next();
          return;
        }

        if (hasChanges.value) {
          const shouldProceed = await checkUnsavedChanges();
          next(shouldProceed);
        } else {
          next();
        }
      });

      cleanup = () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        unsubscribe();
      };
    }

    return cleanup;
  };

  return {
    checkUnsavedChanges,
    setupGuard,
  };
};
