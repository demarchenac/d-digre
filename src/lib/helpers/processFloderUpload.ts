import type { DropEvent } from "react-dropzone";
import type { FileDTO } from "~/types";

export type ProcessFolderUploadOptions = {
  onUpload?: (files: FileDTO[]) => void;
};

export async function processFolderUpload(
  event: DropEvent,
  { onUpload }: ProcessFolderUploadOptions,
): Promise<FileDTO[]> {
  if (!event) return Promise.resolve([]);

  const files: FileDTO[] = [];
  let fileList: FileList | null = null;
  if ("dataTransfer" in event && event.dataTransfer) fileList = event.dataTransfer.files;
  else if (event.target && "files" in event.target) fileList = event.target.files;

  if (!fileList) return Promise.resolve([]);

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList.item(i);
    if (!file) continue;
    const lastSlash = file.webkitRelativePath.lastIndexOf("/");
    const folder = lastSlash >= 0 ? file.webkitRelativePath.substring(0, lastSlash) : null;

    Object.defineProperty(file, "folder", { value: folder });
    files.push(file);
  }

  onUpload?.(files);
  return Promise.resolve(files);
}
