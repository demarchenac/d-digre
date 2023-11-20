import { fromDirEntry } from "./fromDirEntry";
import { fromFileEntry } from "./fromFileEntry";

// https://developer.mozilla.org/en-US/docs/Web/API/FileSystemEntry
export async function fromEntry(entry: FileSystemEntry) {
  return entry.isDirectory
    ? fromDirEntry(entry as FileSystemDirectoryEntry)
    : fromFileEntry(entry as FileSystemFileEntry);
}
