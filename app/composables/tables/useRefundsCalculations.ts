// ~/composables/tables/useRefundsCalculations.ts
import { computed, type Ref } from "vue";
import type { RefundsTableRow } from "~/types/tables";

export const useRefundsCalculations = (rows: Ref<RefundsTableRow[]>) => {
  const totalWithVAT = computed(() => {
    const total = rows.value.reduce((sum, row) => {
      const returns =
        parseFloat(String(row.returns_goods_services_with_nds)) || 0;
      const certificates =
        parseFloat(String(row.gift_certificates_sold_with_nds)) || 0;
      console.log(
        `Row ${row.name}: returns=${returns}, certificates=${certificates}`,
      );
      return sum + returns + certificates;
    }, 0);
    console.log("Total with VAT:", total);
    return total;
  });

  const totalVAT = computed(() => {
    const total = rows.value.reduce((sum, row) => {
      const returnsVAT =
        parseFloat(String(row.returns_goods_services_nds)) || 0;
      const certificatesVAT =
        parseFloat(String(row.gift_certificates_sold_nds)) || 0;
      return sum + returnsVAT + certificatesVAT;
    }, 0);
    console.log("Total VAT:", total);
    return total;
  });

  return {
    totalWithVAT,
    totalVAT,
  };
};
