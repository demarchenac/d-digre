import type { FileWithPath } from "../types";
import { toFileWithPath } from "./toFileWithPath";

// https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileEntry
export async function fromFileEntry(entry: FileSystemFileEntry) {
  return new Promise<FileWithPath>((resolve, reject) => {
    entry.file(
      (file: FileWithPath) => {
        const fwp = toFileWithPath(file, entry.fullPath);
        resolve(fwp);
      },
      (err: DOMException) => {
        reject(err);
      },
    );
  });
}
