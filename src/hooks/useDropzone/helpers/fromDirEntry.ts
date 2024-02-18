import type { FileArray, FileValue } from "../types";
import { fromEntry } from "./fromEntry";

// https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryEntry
export function fromDirEntry(entry: FileSystemDirectoryEntry) {
  const reader = entry.createReader();

  return new Promise<FileArray[]>((resolve, reject) => {
    const entries: Promise<FileValue[]>[] = [];

    function readEntries() {
      // https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryEntry/createReader
      // https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryReader/readEntries
      reader.readEntries(
        (fileSystemEntries) => {
          if (!fileSystemEntries.length) {
            Promise.all(entries)
              .then((files) => resolve(files))
              .catch((err) => reject(err));
          } else {
            const items = Promise.all(fileSystemEntries.map(fromEntry));
            entries.push(items);

            // Continue reading
            readEntries();
          }
        },
        (err: DOMException) => {
          reject(err);
        },
      );
    }

    readEntries();
  });
}
