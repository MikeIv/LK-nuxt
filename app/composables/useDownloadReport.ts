export function useDownloadReport() {
  const downloadingReport = ref(false);
  const error = ref<string | null>(null);

  async function downloadReport(id: string | number) {
    downloadingReport.value = true;
    error.value = null;

    try {
      const response = await $fetch(`/tenants/reports/${id}/pdf`, {
        responseType: "blob",
        headers: {
          Accept: "application/pdf",
        },
      });

      const blob = new Blob([response], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `report_${id}.pdf`;
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      error.value = err?.message || "Ошибка при скачивании отчета";
      console.error("Download error:", err);
      throw err;
    } finally {
      downloadingReport.value = false;
    }
  }

  return {
    downloadingReport,
    error,
    downloadReport,
  };
}
