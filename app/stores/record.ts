import { reactive, ref } from "vue";
import { defineStore } from "pinia";
import { customFetch } from "@/utils/fetchWrapper";

interface Record {
  id: number;
  period: {
    start: string;
    end: string;
  };
  visitors: number;
  sales: number;
  cashiers: Cashier[];
  totalCashiersSum: number;
  totalCashiersSumNds: number;
  nonCashiers: NonCashier[];
  files: File[];
}

interface Cashier {
  id: number;
  regId: string;
  sumStart: number;
  sumEnd: number;
  sumReturned: number;
  sum: number;
}

interface NonCashier {
  name: string;
  sum: number;
  nds: number;
}

export interface fileField {
  name: string;
  value: File | null | "";
}

export interface sumField {
  name: string;
  sum: string;
  nds: string;
}

export interface CashiersPayload {
  id: string;
  name: string;
  serial_number: string;
  fn_number: string;
  order?: string;
}

export const useRecord = defineStore(
  "record",
  () => {
    const defaultState = reactive({
      id: 1,
      period: {
        start: "",
        end: "",
      },
      visitors: 0,
      sales: 0,
      cashiers: [
        {
          id: 1,
          regId: "",
          sumStart: 0,
          sumEnd: 0,
          sumReturned: 0,
          sum: 0,
        },
      ],

      nonCashiers: [
        {
          name: "",
          sum: 0,
          nds: 0,
        },
      ],
      nonCashiersExtend: [
        {
          name: "",
          sum: 0,
          nds: 0,
        },
      ],
    });
    let record: Record = reactive(defaultState);
    const isError = ref(false);

    function setRecordDataFromPageZero(period, visitors, sales) {
      record.period = period;
      record.visitors = visitors;
      record.sales = sales;
      console.log(record.sales);
    }

    function setRecordDataFromPageOne(cashiers) {
      record.cashiers = cashiers;
    }

    async function submitRecord() {
      let data;
      try {
        const res = await customFetch(`reports`, {
          method: "POST",
          body: JSON.stringify(record),
        });
        data = await res.json();
        console.log(data);
      } catch {
        console.log("error");
      }
      return { data };
    }

    function $reset() {
      record = defaultState;
    }

    async function editRequest(body) {
      let data;
      try {
        const res = await customFetch(`reports/request`, {
          method: "POST",
          body: JSON.stringify(body),
        });
        data = await res.json();
        console.log(data);
      } catch (e) {
        console.log(e);
      } finally {
        console.log("finally");
      }

      return { data };
    }

    async function getRecordsList() {
      let data;
      try {
        const res = await customFetch(`reports`, {
          method: "GET",
        });
        data = await res.json();
        console.log(data);
      } catch (e) {
        console.log(e);
      } finally {
        console.log("finally");
      }

      console.log(data);

      return { data };
    }

    async function getCashiers() {
      let data:
        | {
            message: string;
            success: boolean;
            payload: CashiersPayload[];
          }
        | undefined;
      try {
        const res = await customFetch(`tenants/kkts`, {
          method: "GET",
        });
        data = await res.json();
        console.log(data);
      } catch (e) {
        if (e) {
          console.log(e);
        }
      } finally {
        if (data) {
          console.log("finally");
        }
      }

      return data?.payload;
    }

    async function setCashiers(cashiers) {
      let data:
        | {
            message: string;
            success: boolean;
            payload: CashiersPayload[];
          }
        | undefined;
      try {
        const res = await customFetch(`tenants/kkts`, {
          method: "POST",
          body: JSON.stringify(cashiers),
        });
        data = await res.json();
        console.log(data);
      } catch (e) {
        if (e) {
          console.log(e);
        }
      } finally {
        if (data) {
          console.log("finally");
        }
      }

      console.log(
        data?.payload.map((kkt) => {
          return {
            ...kkt,
            disabled: true,
          };
        }),
      );
      return data?.payload.map((kkt) => {
        return {
          ...kkt,
          disabled: true,
        };
      });
    }

    async function getReportsList() {
      let data:
        | {
            message: string;
            success: boolean;
            payload: CashiersPayload[];
          }
        | undefined;
      try {
        const res = await customFetch(`tenants/reports`, {
          method: "GET",
        });
        data = await res.json();
        console.log(data);
      } catch (e) {
        if (e) {
          console.log(e);
        }
      } finally {
        if (data) {
          console.log("finally");
        }
      }

      return data?.payload;
    }

    return {
      record,
      isError,
      getCashiers,
      setCashiers,
      getReportsList,
      setRecordDataFromPageZero,
      setRecordDataFromPageOne,
      $reset,
      submitRecord,
      editRequest,
      getRecordsList,
    };
  },

  {
    persist: false,
  },
);
