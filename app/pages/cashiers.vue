<script setup lang="ts">
  import { useCashersStore } from "~/stores/cashers";

  const {
    callApi: loadKktData,
    data: kktData,
    isLoading: kktLoading,
  } = useApi<UserData>();

  console.log("loadKktData", loadKktData);
  console.log("kktData", kktData);

  const allTables = ref<unknown[]>([]);

  const saveMessage = ref("");
  const isError = ref(false);
  const isSaving = ref(false);
  const invalidFields = ref<Record<string, boolean>>({});

  const addBlock = () => {
    const blockNumber = allTables.value.length + 1;
    const name = `Касса ${blockNumber}`;

    allTables.value.push({
      name: name,
      registration_number: "",
      serial_number: "",
      fn_number: "",
      registered_at: null,
      installed_at: null,
      order: blockNumber,
      isDirty: true,
      isCustom: true,
    });

    showMessage("Добавлен новый блок");
  };

  const removeBlock = (block: unknown) => {
    if (!confirm("Вы уверены, что хотите удалить эту кассу?")) return;

    const index = allTables.value.findIndex(
      (b) =>
        (block.id && b.id === block.id) ||
        (!block.id && b.order === block.order),
    );

    if (index !== -1) {
      allTables.value.splice(index, 1);
      showMessage("Блок удален");
    }
  };
  const validateBeforeSave = () => {
    invalidFields.value = {};

    allTables.value.forEach((block, index) => {
      if (!block.isDirty && !block.isCustom) return;

      if (!block.name?.trim()) {
        invalidFields.value[`name-${index}`] = true;
      }

      if (
        block.isCustom &&
        (!block.registration_number || block.registration_number.length !== 16)
      ) {
        invalidFields.value[`regNum-${index}`] = true;
      }

      if (!block.serial_number?.trim()) {
        invalidFields.value[`serialNum-${index}`] = true;
      }

      if (!block.fn_number?.trim()) {
        invalidFields.value[`fnNum-${index}`] = true;
      }

      if (!block.registered_at) {
        invalidFields.value[`regDate-${index}`] = true;
      }
      if (!block.installed_at) {
        invalidFields.value[`instDate-${index}`] = true;
      }
    });

    return Object.keys(invalidFields.value).length === 0;
  };

  const saveData = async () => {
    if (!validateBeforeSave()) {
      showMessage("Заполните все обязательные поля", true);
      return;
    }

    isSaving.value = true;
    try {
      const cashersStore = useCashersStore();

      const cashersToSave = allTables.value.map((table) => ({
        id: table.id || null,
        name: table.name,
        registration_number: table.registration_number,
        serial_number: table.serial_number,
        fn_number: table.fn_number,
        registered_at: table.registered_at,
        installed_at: table.installed_at,
        order: table.order,
        isCustom: table.isCustom || false,
        isDirty: false, // Сбрасываем флаг изменений
      }));

      cashersStore.loadFromApi(cashersToSave);

      allTables.value.forEach((table) => {
        table.isDirty = false;
        table.isCustom = false;
      });

      showMessage("Данные успешно сохранены");
    } catch (err) {
      showMessage("Ошибка при сохранении", true);
      console.error("Ошибка сохранения:", err);
    } finally {
      isSaving.value = false;
    }
  };

  const updateData = async () => {
    if (!hasChanges.value) {
      showMessage("Нет изменений для отмены");
      return;
    }

    if (!confirm("Все несохраненные изменения будут потеряны. Продолжить?")) {
      return;
    }

    isSaving.value = true;
    try {
      allTables.value = allTables.value.filter((table) => !table.isCustom);

      allTables.value.forEach((table) => {
        table.isDirty = false;
      });

      showMessage("Изменения отменены");
    } catch (err) {
      console.error("Ошибка при отмене изменений:", err);
      showMessage("Ошибка при отмене изменений", true);
    } finally {
      isSaving.value = false;
    }
  };

  const hasChanges = computed(() => {
    return allTables.value.some((block) => block.isDirty || block.isCustom);
  });

  const showMessage = (message: string, error = false) => {
    saveMessage.value = message;
    isError.value = error;
    setTimeout(() => {
      saveMessage.value = "";
    }, 13000);
  };

  watch(
    allTables,
    (newVal) => {
      console.log("All tables updated:", newVal);
    },
    { deep: true },
  );

  onMounted(async () => {
    try {
      await loadKktData("/tenants/kkts");
      const cashersStore = useCashersStore();

      cashersStore.loadFromApi(kktData.value);

      allTables.value = [...cashersStore.allCashers];
    } catch (err) {
      console.log(err);
      showMessage("Ошибка при загрузке данных ККТ", true);
    }
  });
</script>

<template>
  <div :class="cashes.cashes">
    <CashiersHeader
      main-title="Мои кассы"
      step-title="Добавляйте и редактируйте информацию о Ваших кассах"
    />
    <section :class="cashes.content">
      <div v-if="kktLoading">Загрузка данных...</div>

      <template v-else>
        <section :class="cashes.section">
          <CashiersTable
            v-for="(block, index) in allTables"
            :key="block.id || `custom-${index}`"
            v-model:block="allTables[index]"
            :index="index"
            :invalid-fields="invalidFields"
            @remove-block="removeBlock"
            @update:invalid-fields="invalidFields = $event"
          />
        </section>
      </template>

      <div :class="cashes.row">
        <div :class="cashes.actions">
          <button :class="[cashes.btn, cashes.btnAction]" @click="addBlock">
            Добавить кассу
          </button>
        </div>
      </div>

      <div :class="cashes.row">
        <button
          :class="[cashes.btn, cashes.btnGhost]"
          :disabled="!hasChanges || isSaving"
          @click="saveData"
        >
          <span :class="cashes.btnTitle">{{
            isSaving ? "Сохранение..." : "Сохранить"
          }}</span>
        </button>

        <button
          :class="[cashes.btn, cashes.btnGhost]"
          :disabled="!hasChanges || isSaving"
          @click="updateData"
        >
          <span class="record__btn-title">{{
            isSaving ? "Отмена..." : "Отменить"
          }}</span>
        </button>

        <transition name="fade">
          <div
            v-if="saveMessage"
            class="record__flag-message"
            :class="[{ error: isError }, cashes.flagMessage]"
          >
            {{ saveMessage }}
          </div>
        </transition>
      </div>
    </section>
  </div>
</template>

<style module="cashes" lang="scss">
  .cashes {
    background: var(--a-white);
  }

  .content {
    display: flex;
    flex-direction: column;
  }

  .section {
    display: flex;
    flex-direction: column;
    margin-bottom: rem(40);
  }

  .row {
    position: relative;
    display: flex;
    gap: 1.125rem;
  }
  .actions {
    display: flex;
    gap: 18px;
  }

  .btn {
    display: flex;
    justify-content: center;
    align-items: center;
    width: max-content;
    flex-shrink: 0;
    margin-bottom: 1.25rem;
    padding: rem(4) rem(12);
    font-size: 0.875rem;
    font-weight: 600;
    background-color: var(--a-accentTextDark);
    border-radius: 0.25rem;
    transition: background-color 0.3s;
    cursor: pointer;
  }

  .btnAction {
    color: var(--a-white);
  }

  .btnGhost {
    padding: rem(2) rem(12);
    background-color: var(--a-bgLight);
    border: 1px solid var(--a-borderAccent);
  }

  .btnTitle {
    padding: 0;
  }

  .flagMessage {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: rem(4) rem(16);
    height: rem(26);
    font-size: rem(13);
    font-weight: 600;
    color: var(--a-lightText);
    background-color: var(--a-bgGreen);
    border-radius: rem(4);
    z-index: 2;
  }
</style>
