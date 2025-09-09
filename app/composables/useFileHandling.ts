import type { Ref } from "vue";
import type { FileData } from "@/types/tables";

interface FileHandlingOptions<TableRow> {
  editableRows: Ref<TableRow[]>;
  emit: (event: string, ...args: unknown[]) => void;
  getFileIds: (row: TableRow) => number[];
  setFileData: (row: TableRow, filesData: FileData[]) => TableRow;
}

export function useFileHandling<TableRow>({
  editableRows,
  emit,
  setFileData,
}: FileHandlingOptions<TableRow>) {
  const handleFileUploaded = (payload: {
    index: number;
    filesData: FileData[];
  }) => {
    const currentRow = editableRows.value[payload.index];

    const currentFiles = currentRow.files || [];
    const updatedFiles = [...currentFiles, ...payload.filesData];

    // Обновляем строку с новыми файлами
    editableRows.value[payload.index] = setFileData(currentRow, updatedFiles);

    emit("files-uploaded", {
      index: payload.index,
      filesData: updatedFiles,
    });
  };

  const handleFileRemoved = (payload: { index: number; fileIndex: number }) => {
    const currentRow = editableRows.value[payload.index];
    const currentFiles = [...(currentRow.files || [])];

    currentFiles.splice(payload.fileIndex, 1);

    editableRows.value[payload.index] = setFileData(currentRow, currentFiles);
    emit("file-removed", payload);
  };

  return {
    handleFileUploaded,
    handleFileRemoved,
  };
}
