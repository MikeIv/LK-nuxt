<script setup lang="ts">
  // import { computed, nextTick, onMounted, ref, watch } from "vue";
  // import IconCloseBtn from "@/components/icons/IconCloseBtn.vue";
  // import IconEditing from "@/components/icons/IconEditing.vue";

  // import VueDatePicker from "@vuepic/vue-datepicker";
  // import "@vuepic/vue-datepicker/dist/main.css";
  // import { useSaveCashiers } from "~/composables/useSaveCashiers";
  // import { useLogin } from "~/stores/auth.ts";

  import { useCashersStore } from "~/stores/cashers";
  import VueDatePicker from "@vuepic/vue-datepicker";
  import "@vuepic/vue-datepicker/dist/main.css";

  const cashersStore = useCashersStore();

  const { kktData, kktLoading, kktError, loadKktData } = useKkt();
  console.log("kktData", kktData);
  console.log("kktError", kktError);

  const saveMessage = ref("");
  const isError = ref(false);

  // const store = useLogin();
  // const cashersStore = useCashersStore();
  // const { data, loading, fetchReport } = useDataKkt();
  // const { saveCashiers, error: saveError } = useSaveCashiers();

  // interface Casher {
  //   id: number | null;
  //   name: string;
  //   registration_number: string;
  //   serial_number: string;
  //   fn_number: string;
  //   registered_at: string | null;
  //   installed_at: string | null;
  //   order: number;
  //   isEditingTitle?: boolean;
  //   isCustom?: boolean;
  //   tempId?: string;
  //   isDirty?: boolean;
  // }

  // const saveMessage = ref("");
  // const isError = ref(false);
  // const isSaving = ref(false);
  const titleInputs = ref<HTMLInputElement[]>([]);
  // const initialData = ref<Casher[]>([]);
  // const isInitialLoad = ref(true);

  // const updateData = async () => {
  //   if (!hasChanges.value) {
  //     showMessage("Нет изменений для отмены");
  //     return;
  //   }
  //
  //   if (!confirm("Все несохраненные изменения будут потеряны. Продолжить?")) {
  //     return;
  //   }
  //
  //   isSaving.value = true;
  //   try {
  //     cashersStore.resetChanges();
  //     // Возвращаем initialData после отмены
  //     initialData.value = JSON.parse(JSON.stringify(cashersStore.initialData));
  //     showMessage("Изменения отменены");
  //   } catch (err) {
  //     console.error("Ошибка при отмене изменений:", err);
  //     showMessage("Ошибка при отмене изменений", true);
  //   } finally {
  //     isSaving.value = false;
  //   }
  // };

  const validateRegistrationNumber = (
    event: Event,
    block: unknown,
    index: number,
  ) => {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, "");

    if (value.length > 16) {
      value = value.slice(0, 16);
    }

    block.registration_number = value;
    input.value = value;
    handleFieldChange(block);

    const fieldKey = `regNum-${index}`;
    if (value.length === 16) {
      clearFieldError(fieldKey);
    }
  };
  //
  const validateDigitsInput = (
    event: Event,
    field: string,
    block: unknown,
    index: number,
  ) => {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, "");
    block[field] = value;
    input.value = value;
    handleFieldChange(block);

    const fieldKey = `${field === "serial_number" ? "serialNum" : "fnNum"}-${index}`;
    clearFieldError(fieldKey);
  };
  //
  const invalidFields = ref<Record<string, boolean>>({});

  // const validateBeforeSave = () => {
  //   invalidFields.value = {};
  //
  //   cashersStore.allCashers.forEach((block, index) => {
  //     const isNewBlock = block.id === null;
  //     const shouldValidate = isNewBlock || block.isDirty;
  //
  //     if (!shouldValidate) return;
  //
  //     if (!block.name?.trim()) {
  //       invalidFields.value[`name-${index}`] = true;
  //     }
  //     if (
  //       !block.registration_number ||
  //       block.registration_number.length !== 16
  //     ) {
  //       invalidFields.value[`regNum-${index}`] = true;
  //     }
  //     if (!block.serial_number?.trim()) {
  //       invalidFields.value[`serialNum-${index}`] = true;
  //     }
  //     if (!block.fn_number?.trim()) {
  //       invalidFields.value[`fnNum-${index}`] = true;
  //     }
  //     if (!block.registered_at) {
  //       invalidFields.value[`regDate-${index}`] = true;
  //     }
  //     if (!block.installed_at) {
  //       invalidFields.value[`instDate-${index}`] = true;
  //     }
  //   });
  //
  //   return Object.keys(invalidFields.value).length === 0;
  // };

  // watch(
  //   () => cashersStore.allCashers,
  //   (newVal) => {
  //     newVal.forEach((block, index) => {
  //       if (block.serial_number?.trim()) {
  //         clearFieldError(`serialNum-${index}`);
  //       }
  //       if (block.fn_number?.trim()) {
  //         clearFieldError(`fnNum-${index}`);
  //       }
  //     });
  //   },
  //   { deep: true },
  // );
  //
  const handleFieldChange = (block: unknown) => {
    block.isDirty = true;
  };

  const handleDateChange = (
    block: unknown,
    field: "registered_at" | "installed_at",
    date: Date | null,
    index: number,
  ) => {
    block[field] = date;
    handleFieldChange(block);

    const fieldType = field === "registered_at" ? "regDate" : "instDate";
    const fieldKey = `${fieldType}-${index}`;

    if (date) {
      clearFieldError(fieldKey);
    } else if (invalidFields.value[fieldKey]) {
      invalidFields.value[fieldKey] = true;
    }
  };

  const handleTitleEditStart = async (block: unknown) => {
    block.isEditingTitle = true;
    await nextTick();

    const index = cashersStore.allCashers.findIndex(
      (b) =>
        b.id === block.id ||
        (b.id === null && block.id === null && b.name === block.name),
    );

    if (index !== -1 && titleInputs.value[index]) {
      titleInputs.value[index].focus();
      titleInputs.value[index].setSelectionRange(
        0,
        titleInputs.value[index].value.length,
      );
    }
  };
  //
  const clearFieldError = (fieldKey: string) => {
    if (invalidFields.value[fieldKey]) {
      const { [fieldKey]: _, ...rest } = invalidFields.value;
      invalidFields.value = rest;
    }
  };
  //
  const handleTitleEditEnd = (block: unknown, index: number) => {
    if (!block.name.trim()) {
      block.name = "Касса " + block.order;
    }
    block.isEditingTitle = false;
    handleFieldChange(block);

    const fieldKey = `name-${index}`;
    if (block.name.trim()) {
      clearFieldError(fieldKey);
    }
  };
  //
  const addBlock = () => {
    const blockNumber = cashersStore.allCashers.length + 1;
    const name = `Касса ${blockNumber}`;

    cashersStore.addCustomCasher({
      name: name,
      registration_number: "",
      serial_number: "",
      fn_number: "",
      registered_at: null,
      installed_at: null,
      order: blockNumber,
      isDirty: false,
    });

    showMessage("Добавлен новый блок");

    nextTick(() => {
      const inputs = document.querySelectorAll(".registration-number-input");
      const lastInput = inputs[inputs.length - 1] as HTMLInputElement;
      lastInput?.focus();
    });
  };
  //
  const removeBlock = async (block: unknown) => {
    if (!confirm("Вы уверены, что хотите удалить эту кассу?")) return;
    cashersStore.removeCasher({
      id: block.id,
      tempId: block.tempId,
    });
    showMessage("Блок удален");
  };

  // const saveData = async () => {
  //   if (!validateBeforeSave()) {
  //     showMessage("Заполните все обязательные поля", true);
  //     return;
  //   }
  //   isSaving.value = true;
  //   try {
  //     const changes = cashersStore.getChanges();
  //     const response = await saveCashiers(changes);
  //
  //     if (response?.success) {
  //       await fetchReport(store.contractId.toString());
  //       if (data.value?.payload) {
  //         initialData.value = JSON.parse(JSON.stringify(data.value.payload));
  //         cashersStore.loadFromApi(data.value.payload);
  //       }
  //       showMessage(response?.message || "Данные успешно сохранены");
  //       invalidFields.value = {};
  //     } else {
  //       showMessage(response?.message || "Ошибка при сохранении", true);
  //     }
  //   } catch (err) {
  //     showMessage(saveError.value || "Ошибка при сохранении", true);
  //     console.error("Ошибка сохранения:", err);
  //   } finally {
  //     isSaving.value = false;
  //   }
  // };

  // const hasChanges = computed(() => {
  //   if (isInitialLoad.value || !cashersStore.allCashers.length) return false;
  //
  //   // Сравниваем текущее состояние с исходным
  //   const currentState = cashersStore.allCashers.map((c) => ({
  //     name: c.name,
  //     registration_number: c.registration_number,
  //     serial_number: c.serial_number,
  //     fn_number: c.fn_number,
  //     registered_at: c.registered_at,
  //     installed_at: c.installed_at,
  //     order: c.order,
  //     id: c.id,
  //   }));
  //
  //   const initialState = initialData.value.map((c) => ({
  //     name: c.name,
  //     registration_number: c.registration_number,
  //     serial_number: c.serial_number,
  //     fn_number: c.fn_number,
  //     registered_at: c.registered_at,
  //     installed_at: c.installed_at,
  //     order: c.order,
  //     id: c.id,
  //   }));
  //
  //   // Проверяем изменения в данных
  //   const dataChanged =
  //     JSON.stringify(currentState) !== JSON.stringify(initialState);
  //
  //   // Проверяем наличие новых касс (без id)
  //   const hasNewCashers = cashersStore.allCashers.some((c) => c.id === null);
  //
  //   return dataChanged || hasNewCashers;
  // });
  //
  // // Вспомогательные функции
  // const showMessage = (message: string, error = false) => {
  //   saveMessage.value = message;
  //   isError.value = error;
  //   setTimeout(() => {
  //     saveMessage.value = "";
  //   }, 3000);
  // };
  //
  const formatDate = (date: string | null): string => {
    if (!date) return "--.--.----";
    return new Date(date)
      .toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, ".");
  };
  //
  // const cashersState = ref(JSON.stringify(cashersStore.allCashers));
  //
  // watch(
  //   () => cashersStore.allCashers,
  //   (newVal) => {
  //     cashersState.value = JSON.stringify(newVal);
  //   },
  //   { deep: true },
  // );

  // const waitForContractId = async (maxAttempts = 5, delay = 200) => {
  //   for (let i = 0; i < maxAttempts; i++) {
  //     if (store.contractId) return store.contractId;
  //     await new Promise((resolve) => setTimeout(resolve, delay));
  //   }
  //   throw new Error("Contract ID not available");
  // };

  const showMessage = (message: string, error = false) => {
    saveMessage.value = message;
    isError.value = error;
    setTimeout(() => {
      saveMessage.value = "";
    }, 3000);
  };

  onMounted(async () => {
    try {
      await loadKktData();
    } catch (err) {
      console.log(err);
      showMessage("Ошибка при загрузке данных ККТ", true);
    }
    // try {
    //   const contractId = await waitForContractId();
    //   await fetchReport(contractId.toString());
    //
    //   if (data.value?.payload) {
    //     initialData.value = JSON.parse(JSON.stringify(data.value?.payload));
    //     cashersStore.loadFromApi(data.value?.payload);
    //     cashersState.value = JSON.stringify(data.value?.payload);
    //   }
    // } catch (err) {
    //   console.error("Ошибка при загрузке данных:", err);
    //   showMessage("Ошибка при загрузке данных", true);
    // } finally {
    //   isInitialLoad.value = false;
    // }
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
          <div
            v-for="(block, index) in kktData"
            :key="block.id || `custom-${index}`"
            :class="cashes.table"
          >
            <div :class="cashes.titleWrapper">
              <input
                v-if="block.isEditingTitle"
                ref="titleInput"
                v-model="block.name"
                :class="[
                  {
                    'cashes.editing': block.isEditingTitle,
                    'error-field': invalidFields[`name-${index}`],
                  },
                  cashes.titleInput,
                ]"
                type="text"
                placeholder="Введите название кассы"
                @keyup.enter="handleTitleEditEnd(block)"
                @blur="handleTitleEditEnd(block, index)"
              />
              <p v-else :class="cashes.titleText">
                {{ block.name || "Не указано" }}
              </p>

              <button
                v-if="block.isEditingTitle"
                class="casher-block__ok-btn"
                type="button"
                @click.stop="handleTitleEditEnd(block)"
              >
                OK
              </button>

              <button
                v-if="!block.isEditingTitle"
                class="casher-block__edit-btn"
                type="button"
                @click.stop="handleTitleEditStart(block)"
              >
                <UIcon name="i-edit-icon" class="main-sidebar__icon small" />
              </button>
            </div>

            <div class="casher-block__row">
              <div class="casher-block__column">
                <span class="casher-block__col-title"
                  >Регистрационный номер ККТ</span
                >
                <input
                  :value="block.registration_number"
                  class="record__item-input registration-number-input casher-block__input"
                  :class="{
                    'readonly-input': !block.isCustom,
                    'error-field':
                      invalidFields[`regNum-${index}`] ||
                      (block.registration_number &&
                        block.registration_number.length !== 16),
                  }"
                  type="text"
                  placeholder="Введите 16 цифр"
                  :readonly="!block.isCustom"
                  maxlength="16"
                  inputmode="numeric"
                  pattern="\d{16}"
                  @input="validateRegistrationNumber($event, block, index)"
                />
                <small
                  v-if="
                    block.registration_number &&
                    block.registration_number.length !== 16
                  "
                  class="casher-block__error-hint"
                >
                  Номер содержит ровно 16 цифр
                </small>
              </div>
              <div class="casher-block__column">
                <span class="casher-block__col-title">Заводской номер ККТ</span>
                <input
                  :value="block.serial_number"
                  class="record__item-input casher-block__input"
                  :class="{
                    'error-field':
                      invalidFields[`serialNum-${index}`] &&
                      !block.serial_number?.trim(),
                  }"
                  type="text"
                  placeholder="Введите номер"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  @input="
                    validateDigitsInput($event, 'serial_number', block, index)
                  "
                />
              </div>
              <div class="casher-block__column">
                <span class="casher-block__col-title"
                  >Номер фискального накопителя</span
                >
                <input
                  :value="block.fn_number"
                  class="record__item-input casher-block__input"
                  :class="{
                    'error-field':
                      invalidFields[`fnNum-${index}`] &&
                      !block.fn_number?.trim(),
                  }"
                  type="text"
                  placeholder="Введите номер"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  @input="
                    validateDigitsInput($event, 'fn_number', block, index)
                  "
                />
              </div>
              <div class="casher-block__column">
                <span class="casher-block__col-title"
                  >Дата постановки на учёт</span
                >
                <VueDatePicker
                  v-model="block.registered_at"
                  :enable-time-picker="false"
                  :format="formatDate"
                  locale="ru"
                  :max-date="new Date()"
                  cancel-text="Отмена"
                  select-text="Выбрать"
                  :input-class-name="
                    invalidFields[`regDate-${index}`]
                      ? 'custom-datepicker-input error-field'
                      : 'custom-datepicker-input'
                  "
                  placeholder="Выберите дату"
                  class="casher-block__item-calendar"
                  :class="{
                    'error-data-field': invalidFields[`regDate-${index}`],
                  }"
                  @update:model-value="
                    (date) =>
                      handleDateChange(block, 'registered_at', date, index)
                  "
                />
              </div>
              <div class="casher-block__column">
                <span class="casher-block__col-title"
                  >Дата установки в помещении</span
                >
                <VueDatePicker
                  v-model="block.installed_at"
                  :enable-time-picker="false"
                  :format="formatDate"
                  locale="ru"
                  :max-date="new Date()"
                  cancel-text="Отмена"
                  select-text="Выбрать"
                  :input-class-name="
                    invalidFields[`instDate-${index}`]
                      ? 'custom-datepicker-input error-field'
                      : 'custom-datepicker-input'
                  "
                  placeholder="Выберите дату"
                  class="casher-block__item-calendar"
                  :class="{
                    'error-data-field': invalidFields[`instDate-${index}`],
                  }"
                  @update:model-value="
                    (date) =>
                      handleDateChange(block, 'installed_at', date, index)
                  "
                />
              </div>

              <button
                type="button"
                class="casher-block__delete-btn"
                @click="removeBlock(block)"
              >
                <UIcon name="i-close-btn" class="casher-block__icon" />
              </button>
            </div>
          </div>
        </section>
      </template>

      <div class="record__btn-row">
        <div class="actions">
          <button class="record__btn-base color" @click="addBlock">
            Добавить кассу
          </button>
        </div>
      </div>

      <!--      <div class="record__btn-row record__actions">-->
      <!--        <button-->
      <!--          class="record__btn ghost"-->
      <!--          :disabled="!hasChanges || isSaving"-->
      <!--          @click="saveData"-->
      <!--        >-->
      <!--          <span class="record__btn-title">{{-->
      <!--            isSaving ? "Сохранение..." : "Сохранить"-->
      <!--          }}</span>-->
      <!--        </button>-->

      <!--        <button-->
      <!--          class="record__btn ghost"-->
      <!--          :disabled="!hasChanges || isSaving"-->
      <!--          @click="updateData"-->
      <!--        >-->
      <!--          <span class="record__btn-title">{{-->
      <!--            isSaving ? "Отмена..." : "Отменить"-->
      <!--          }}</span>-->
      <!--        </button>-->

      <!--        &lt;!&ndash;        <transition name="fade">&ndash;&gt;-->
      <!--        &lt;!&ndash;          <div&ndash;&gt;-->
      <!--        &lt;!&ndash;            v-if="saveMessage"&ndash;&gt;-->
      <!--        &lt;!&ndash;            class="record__flag-message"&ndash;&gt;-->
      <!--        &lt;!&ndash;            :class="{ error: isError }"&ndash;&gt;-->
      <!--        &lt;!&ndash;          >&ndash;&gt;-->
      <!--        &lt;!&ndash;            {{ saveMessage }}&ndash;&gt;-->
      <!--        &lt;!&ndash;          </div>&ndash;&gt;-->
      <!--        &lt;!&ndash;        </transition>&ndash;&gt;-->
      <!--      </div>-->
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

  .table {
    position: relative;
    display: flex;
    flex-direction: column;
    max-width: rem(1000);
    min-height: rem(80);
    padding: rem(12) rem(24);
    background-color: var(--a-bgTable);
    border-radius: rem(12);
    margin-bottom: rem(20);
    transition: all 0.3s ease;
    -webkit-box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
    -moz-box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);

    &:last-child {
      margin-bottom: 0;
    }
  }

  .titleWrapper {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-right: auto;
    margin-bottom: rem(20);
  }

  .titleInput {
    flex: 1;
    margin-right: auto;
    padding: rem(4) rem(12);
    border: 1px solid var(--a-borderAccentLight);
    border-radius: rem(4);
    font-size: rem(12);
    font-weight: 600;
    background-color: var(--a-bgTable);
    transition: border-color 0.2s ease;

    &:focus {
      outline: none;
      border-color: var(--a-primary);
    }
  }

  .editing {
    background-color: var(--a-white);
  }

  .titleText {
    flex: 1;
    max-width: rem(800);
    margin: 0;
    padding: rem(8) rem(14);
    font-size: rem(13);
    font-weight: 600;
    line-height: 1.2;
    background-color: var(--a-white);
  }
</style>

<style lang="scss">
  .casher-block {
    position: relative;
    display: flex;
    flex-direction: column;
    max-width: rem(1000);
    min-height: rem(80);
    padding: rem(12) rem(24);
    background-color: var(--a-bgTable);
    border-radius: rem(12);
    margin-bottom: rem(20);
    transition: all 0.3s ease;
    -webkit-box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
    -moz-box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);

    &:last-child {
      margin-bottom: 0;
    }

    &__title {
      max-width: 80%;
      margin-bottom: rem(20);
      font-size: rem(13);
      font-weight: 600;
      line-height: 1.2;
    }

    &__row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    &__column {
      display: flex;
      flex-direction: column;
      align-content: space-between;
      flex: 1;
      gap: rem(10);
    }

    &__call-right {
      display: flex;
      align-items: center;
      margin-left: auto;
      gap: rem(10);
    }

    &__col-title {
      max-width: rem(140);
      margin-right: rem(8);
      font-size: rem(12);
      font-weight: 600;
      white-space: wrap;
      line-height: 1.2;
    }

    &__delete-btn {
      position: absolute;
      top: rem(24);
      right: rem(22);
      display: flex;
      align-items: center;
      justify-content: center;

      & svg {
        color: var(--a-bgAccent);

        &:hover {
          color: var(--a-bgAccentDark);
        }
      }
    }

    &__icon {
      position: absolute;
      width: rem(22);
      height: rem(22);
      cursor: pointer;
      transition: transform 0.2s ease;

      &:hover {
        transform: scale(1.1);
      }
    }

    &__title-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-right: auto;
      margin-bottom: rem(20);
    }

    &__title-input {
      flex: 1;
      margin-right: auto;
      padding: rem(4) rem(12);
      border: 1px solid var(--a-borderAccentLight);
      border-radius: rem(4);
      font-size: rem(12);
      font-weight: 600;
      background-color: var(--a-bgTable);
      transition: border-color 0.2s ease;

      &:focus {
        outline: none;
        border-color: var(--a-primary);
      }

      &--edting {
        background-color: var(--a-white);
      }
    }

    &__title-text {
      flex: 1;
      max-width: rem(800);
      margin: 0;
      padding: rem(8) rem(14);
      font-size: rem(13);
      font-weight: 600;
      line-height: 1.2;
      background-color: var(--a-white);
    }

    &__edit-btn {
      position: relative;
      top: -2px;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      width: rem(28);
      height: rem(28);
      background: none;
      border: none;
      cursor: pointer;
      padding: rem(4);
      color: var(--a-primary);
      transition: color 0.2s ease;

      &:hover {
        color: var(--a-primaryDark);
      }
    }

    &__edit-icon {
      width: rem(16);
      height: rem(16);
    }

    &__item-calendar {
      display: flex;
      margin-right: rem(20);
      font-size: rem(12);
    }

    & .dp__input_wrap .dp__input {
      width: rem(170);
      padding-left: rem(34);
    }

    & .dp__action_button {
      background-color: var(--a-bgAccentLight);

      &:hover {
        background-color: var(--a-bgAccentDark);
      }
    }

    & .dp__pointer {
      padding: 0 rem(10);
      font-size: rem(13);
      font-weight: 600;
      background-color: var(--a-mainBg);

      &:hover {
        color: var(--a-accentTextExDark);
      }
    }

    & .dp__input_wrap svg {
      padding: 0 rem(8);
    }

    &__error-hint {
      color: var(--a-errorText);
      font-size: rem(9);
      margin-top: rem(4);
      display: block;
    }

    &__input {
      max-width: rem(160);
    }

    &__ok-btn {
      padding: rem(4) rem(12);
      margin-left: rem(8);
      background-color: var(--a-bgAccent);
      color: white;
      border: none;
      border-radius: rem(4);
      cursor: pointer;
      font-size: rem(12);
      transition: background-color 0.2s ease;

      &:hover {
        background-color: var(--a-bgAccentDark);
      }
    }
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .error-field {
    border-color: #ff4444 !important;
    box-shadow: 0 0 0 1px #ff4444;
    animation: shake 0.5s ease-in-out;

    &::placeholder {
      color: #ff9999;
    }
  }

  .error-data-field {
    .dp__input_wrap {
      border-color: #ff4444 !important;
      border-radius: rem(4);
      box-shadow: 0 0 0 1px #ff4444;
      animation: shake 0.5s ease-in-out;

      .dp__input {
        &::placeholder {
          color: #ff9999;
        }
      }
    }
  }

  @keyframes shake {
    0%,
    100% {
      transform: translateX(0);
    }
    20%,
    60% {
      transform: translateX(-3px);
    }
    40%,
    80% {
      transform: translateX(3px);
    }
  }

  .casher-block__error-message {
    color: #ff4444;
    font-size: 0.75rem;
    margin-top: 0.25rem;
    display: block;
  }

  .record__flag-message.error {
    background-color: #ffebee;
    color: #ff4444;
    border: 1px solid #ff4444;
  }
</style>
