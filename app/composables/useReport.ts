import type { ReportData } from "~/types/report";

export const useReport = () => {
  const { data: report, error, isLoading, fetchData } = useApi<ReportData>();

  const fetchReport = async (): Promise<ReportData | null> => {
    try {
      return await fetchData("/api/tenants/reports/-1", {
        method: "GET",
      });
    } catch (err) {
      console.error("Failed to fetch report:", err);
      return null;
    }
  };

  return {
    report,
    error,
    isLoading,
    fetchReport,
  };
};
