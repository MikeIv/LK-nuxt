<script setup lang="ts">
  import {
    useVueTable,
    FlexRender,
    getCoreRowModel,
  } from "@tanstack/vue-table";

  interface Period {
    start: string;
    end: string;
  }

  interface Report {
    can_download_documents: boolean;
    can_edit: boolean;
    can_request_correction: boolean;
    period: Period;
    status: string;
    turnover_amount: number;
    turnover_fee: number;
  }

  interface Props {
    reports: Report[];
    pagination?: {
      currentPage: number;
      lastPage: number;
      perPage: number;
      total: number;
    };
    onPageChange?: (page: number) => void;
  }

  const props = defineProps<Props>();

  const emit = defineEmits(["pageChange"]);

  const columns = [
    {
      header: "№",
      cell: ({ row }) => row.index + 1,
      size: 60,
    },
    {
      accessorKey: "period",
      header: "Период",
      cell: ({ row }) => {
        const start = new Date(row.original.period.start).toLocaleDateString();
        const end = new Date(row.original.period.end).toLocaleDateString();
        return `${start} - ${end}`;
      },
      size: 200,
    },
    {
      accessorKey: "status",
      header: "Статус",
      cell: ({ row }) => {
        const statusMap: Record<string, string> = {
          CorrectionRequested: "Запрошена коррекция",
          // добавьте другие статусы по необходимости
        };
        return statusMap[row.original.status] || row.original.status;
      },
      size: 180,
    },
    {
      accessorKey: "turnover_amount",
      header: "Сумма оборота",
      cell: ({ row }) => row.original.turnover_amount.toLocaleString() + " ₽",
      size: 150,
    },
    {
      accessorKey: "turnover_fee",
      header: "Комиссия",
      cell: ({ row }) => row.original.turnover_fee.toLocaleString() + " ₽",
      size: 150,
    },
    {
      header: "Действия",
      cell: ({ row }) => {
        return row.original.can_download_documents
          ? '<button class="download-btn">Скачать</button>'
          : "Недоступно";
      },
      size: 120,
    },
  ];

  const table = useVueTable({
    data: props.reports,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const pageNumbers = computed(() => {
    if (!props.pagination) return [];
    const { currentPage, lastPage } = props.pagination;
    const range = [];

    // Всегда показываем первую страницу
    range.push(1);

    // Показываем точки, если текущая страница далеко от первой
    if (currentPage > 3) {
      range.push("...");
    }

    // Показываем страницы вокруг текущей
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(lastPage - 1, currentPage + 1);
      i++
    ) {
      range.push(i);
    }

    // Показываем точки, если текущая страница далеко от последней
    if (currentPage < lastPage - 2) {
      range.push("...");
    }

    // Всегда показываем последнюю страницу, если она не первая
    if (lastPage > 1) {
      range.push(lastPage);
    }

    return range;
  });

  const handlePageChange = (page: number) => {
    if (
      page >= 1 &&
      page <= props.pagination?.lastPage &&
      page !== props.pagination?.currentPage
    ) {
      emit("pageChange", page);
    }
  };
</script>

<template>
  <div :class="$style.tableContainer">
    <div :class="$style.tableWrapper">
      <table :class="$style.reportsTable">
        <thead :class="$style.tableHeader">
          <tr
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
          >
            <th
              v-for="header in headerGroup.headers"
              :key="header.id"
              :style="{ width: `${header.column.getSize()}px` }"
            >
              <FlexRender
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </th>
          </tr>
        </thead>
        <tbody :class="$style.tableBody">
          <tr v-for="row in table.getRowModel().rows" :key="row.id">
            <td v-for="cell in row.getVisibleCells()" :key="cell.id">
              <FlexRender
                :render="cell.column.columnDef.cell"
                :props="cell.getContext()"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="pagination" :class="$style.pagination">
      <button
        :class="[
          $style.pageButton,
          { [$style.disabled]: pagination.currentPage === 1 },
        ]"
        @click="handlePageChange(pagination.currentPage - 1)"
      >
        Назад
      </button>

      <div :class="$style.pageNumbers">
        <button
          v-for="page in pageNumbers"
          :key="page"
          :class="[
            $style.pageButton,
            {
              [$style.active]: page === pagination.currentPage,
              [$style.disabled]: page === '...',
            },
          ]"
          @click="handlePageChange(page)"
        >
          {{ page }}
        </button>
      </div>

      <button
        :class="[
          $style.pageButton,
          { [$style.disabled]: pagination.currentPage === pagination.lastPage },
        ]"
        @click="handlePageChange(pagination.currentPage + 1)"
      >
        Вперед
      </button>
    </div>
  </div>
</template>

<style module lang="scss">
  .tableContainer {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .tableWrapper {
    flex: 1;
    overflow: auto;
    position: relative;
  }

  .reportsTable {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
  }

  .tableHeader {
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: #f8fafc;

    th {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
      font-weight: 600;
      color: #64748b;
      position: sticky;
      top: 0;
      background-color: inherit;
    }
  }

  .tableBody {
    tr:hover {
      background-color: #f8fafc;
    }

    td {
      padding: 12px 16px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: top;
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    padding: 16px 0;
    margin-top: auto;
  }

  .pageNumbers {
    display: flex;
    gap: 4px;
  }

  .pageButton {
    padding: 8px 12px;
    border: 1px solid #e2e8f0;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(.disabled) {
      background: #f1f5f9;
      border-color: #cbd5e1;
    }

    &.active {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }

    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .download-btn {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: #2563eb;
    }
  }
</style>
