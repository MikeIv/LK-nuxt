interface FileUploadResponse {
  id: number;
  name: string;
  url: string;
  mime_type: string;
  size: number;
  created_at: string;
  updated_at: string;
}

export function useSaveFile() {
  const { callApi, isLoading } = useApi<FileUploadResponse>(); // Изменили тип здесь

  async function saveFile(file: File): Promise<FileUploadResponse> {
    console.debug("[saveFile] Starting file upload:", file.name);

    if (!file || !(file instanceof File)) {
      console.error("[saveFile] Invalid file provided");
      throw new Error("Invalid file provided");
    }

    const formData = new FormData();
    formData.append("file", file, file.name);
    console.debug("[saveFile] FormData created");

    try {
      console.debug("[saveFile] Sending request to server...");
      const response = await callApi("storage/upload", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      console.debug("[saveFile] Server response:", response);

      if (!response) {
        console.error("[saveFile] No response received from server");
        throw new Error("No response received from server");
      }

      // Проверяем основные обязательные поля
      if (!response.id || !response.url) {
        console.error(
          "[saveFile] Invalid server response - missing required fields",
          response,
        );
        throw new Error("Invalid server response - missing required fields");
      }

      console.debug("[saveFile] Upload successful:", file.name);
      return {
        id: response.id,
        name: response.name || file.name,
        url: response.url,
        mime_type: response.mime_type || file.type,
        size: response.size || file.size,
        created_at: response.created_at,
        updated_at: response.updated_at,
      };
    } catch (error) {
      console.error("[saveFile] Upload failed:", {
        fileName: file.name,
        error: error,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      });
      throw new Error(`Failed to upload ${file.name}: ${error.message}`);
    }
  }

  return {
    loading: isLoading,
    saveFile,
  };
}
