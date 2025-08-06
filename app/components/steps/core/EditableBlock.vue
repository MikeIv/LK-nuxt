<script setup lang="ts">
  interface Header {
    label: string;
    width?: string;
    minWidth?: string;
    maxWidth?: string;
    flex?: string;
    elements?: {
      label: string;
      width?: string;
    }[];

    [key: string]: unknown;
  }

  interface Props {
    modelValue: unknown[];
    title?: string;
    loading?: boolean;
    error?: string | Error | null;

    // Для табличного режима
    headers?: Header[];
    isTable?: boolean;
    gridTemplateColumns?: string;

    // Для действий
    showActions?: boolean;
    addButtonText?: string;
    removeButtonText?: string;
    minRows?: number;

    // Классы
    rowClass?: string | ((item: unknown, index: number) => string);
    itemClass?: string | ((item: unknown, index: number) => string);

    // Для скрытия кнопки удаления
    showRemoveButton?: boolean;

    // Сообщение для кнопок
    message?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    headers: () => [],
    title: "",
    error: "",
    message: "",
    isTable: false,
    showActions: true,
    addButtonText: "Добавить",
    removeButtonText: "Удалить",
    minRows: 1,
    rowClass: "",
    itemClass: "",
    gridTemplateColumns: "",
    showRemoveButton: undefined,
  });

  const emit = defineEmits(["add", "remove", "update:modelValue"]);

  const gridStyle = computed(() => {
    if (props.gridTemplateColumns) {
      return {
        "grid-template-columns": props.gridTemplateColumns,
      };
    }

    return {
      "grid-template-columns": props.headers
        .map((col) => col.width || "1fr")
        .join(" "),
    };
  });

  const getColumnStyle = (column: Header) => {
    const style: Record<string, string> = {};
    if (column.width) style.width = column.width;
    if (column.minWidth) style.minWidth = column.minWidth;
    if (column.maxWidth) style.maxWidth = column.maxWidth;
    if (column.flex) style.flex = column.flex;

    return style;
  };

  const getRowClass = (item: unknown, index: number) => {
    if (typeof props.rowClass === "function") {
      return props.rowClass(item, index);
    }
    return props.rowClass;
  };

  const getItemClass = (item: unknown, index: number) => {
    if (typeof props.itemClass === "function") {
      return props.itemClass(item, index);
    }
    return props.itemClass;
  };
</script>

<template>
  <div :class="block.editable">
    <div v-if="title" :class="block.title">
      >
      {{ title }}
    </div>

    <div v-if="loading" :class="block.loading">
      <slot name="loading">Загрузка данных...</slot>
    </div>

    <div v-else-if="error" :class="block.error">
      <slot name="error" :error="error">
        Ошибка загрузки данных: {{ error }}
      </slot>
    </div>

    <template v-else>
      <slot name="content" :items="modelValue">
        <div v-if="isTable" :class="block.table">
          <div :class="block.tableWrap">
            <!-- Заголовок таблицы -->
            <div
              v-if="headers?.length"
              :class="block.tableHeader"
              :style="gridStyle"
            >
              <div
                v-for="(column, idx) in headers"
                :key="idx"
                :class="block.headerCell"
                :style="getColumnStyle(column)"
              >
                <div :class="block.cellTitleBlock">
                  <div :class="block.cellTitle">{{ column.label }}</div>
                  <div v-if="column?.elements" :class="block.subRow">
                    <div
                      v-for="(subcol, ind) in column?.elements"
                      :key="ind"
                      :class="block.subCol"
                      :style="{ width: subcol.width || '100%' }"
                    >
                      {{ subcol?.label }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Строки таблицы -->
            <div :class="block.tableBody">
              <div
                v-for="(item, index) in modelValue"
                :key="index"
                :class="[getRowClass(item, index), block.tableRow]"
                :style="gridStyle"
              >
                <slot name="row" :item="item" :index="index" />
                <div v-if="item?.elements" :class="block.subRow">
                  <div
                    v-for="(subcol, indx) in item?.elements"
                    :key="indx"
                    :class="block.subCol"
                    :style="{ width: subcol.width || '100%' }"
                  >
                    {{ subcol?.label }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Дефолтное отображение списка -->
        <div v-else :class="block.list">
          <div
            v-for="(item, index) in modelValue"
            :key="index"
            :class="[getItemClass(item, index), block.item]"
          >
            <slot name="item" :item="item" :index="index" />
          </div>
        </div>
      </slot>
    </template>

    <StepsCoreBlockActions
      v-if="showActions"
      :add-button-text="addButtonText"
      :remove-button-text="removeButtonText"
      :row-count="modelValue.length"
      :min-rows="minRows"
      :message-button="message"
      :show-remove="showRemoveButton ?? modelValue.length > minRows"
      @add="emit('add')"
      @remove="emit('remove')"
    />

    <div v-if="$slots.footer" :class="block.footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style module="block" lang="scss">
  .editable {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .title {
    font-size: rem(14);
    font-weight: bold;
    margin-bottom: rem(8);
  }

  .loading {
    display: flex;
  }

  .error {
    color: var(--a-errorText);
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: rem(8);
  }

  .item {
    padding: rem(8);
    background-color: var(--a-bgTable);
    border-radius: rem(8);
    border: 1px solid var(--a-borderAccentLight);
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: rem(16);
    border-bottom: 1px solid var(--a-borderAccentLight);
  }

  /* Таблица */
  .table {
    display: flex;
    flex-direction: column;
    max-width: rem(1500);
    width: 100%;
    margin-bottom: rem(14);
    border-radius: rem(8);
    overflow-x: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--a-borderMain) var(--a-mainBg);

    &::-webkit-scrollbar {
      height: rem(8);
    }

    &::-webkit-scrollbar-track {
      background: var(--a-bgAccentExLight);
      border-radius: rem(4);
    }

    &::-webkit-scrollbar-thumb {
      background-color: var(--a-borderAccentLight);
      border-radius: rem(4);
    }
  }

  .tableWrap {
    display: flex;
    flex-direction: column;
    min-width: fit-content;
  }

  .tableHeader {
    display: grid;
    position: sticky;
    top: 0;
    z-index: 2;
    min-width: fit-content;
  }

  .tableBody {
    display: flex;
    flex-direction: column;
    min-width: fit-content;
  }

  .tableRow {
    display: grid;
    min-width: fit-content;
  }

  .headerCell {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: var(--a-bgAccentExLight);
    border-right: 1px solid var(--a-borderLght);

    &:last-child {
      border-right: none;
      border-top-right-radius: rem(8);
    }
  }

  .cellTitleBlock {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    width: 100%;
    height: 100%;
    text-align: center;
  }

  .cellTitle {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    padding: rem(4) rem(10);
    font-size: rem(10);
    font-weight: bold;
    text-align: center;
  }

  .subRow {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: rem(40);
    border-top: 1px solid var(--a-borderLght);
  }

  .subCol {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    padding: rem(4);
    font-size: rem(10);
    font-weight: bold;
    border-right: 1px solid var(--a-borderLght);

    &:last-child {
      border-right: none;
    }
  }
</style>
