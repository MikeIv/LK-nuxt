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
  const data = ref<FileUploadResponse | null>(null);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  async function saveFile(file: File) {
    loading.value = true;
    error.value = null;

    const formData = new FormData();
    formData.append("file", file, file.name);

    for (const [key, value] of formData.entries()) {
      console.log("KEY", key);
      console.log("value", value);
    }

    try {
      const response = await customFetch("storage/upload", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload file");
      }

      const responseData = await response.json();

      if (!responseData.payload) {
        throw new Error("Invalid server response format");
      }

      const transformedData: FileUploadResponse = {
        id: responseData.payload.id,
        name: file.name,
        url: responseData.payload.url,
        mime_type: file.type,
        size: file.size,
        created_at: responseData.payload.created_at,
        updated_at: responseData.payload.updated_at,
      };

      data.value = transformedData;
      return transformedData;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error("Upload failed");
      throw error.value;
    } finally {
      loading.value = false;
    }
  }

  return {
    data,
    loading,
    error,
    saveFile,
  };
}
