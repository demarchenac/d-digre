import { fromDataTransferItem } from "./fromDataTransferItem";
import { fromDirEntry } from "./fromDirEntry";

// https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem
export function toFilePromises(item: DataTransferItem) {
  if (typeof item.webkitGetAsEntry !== "function") {
    return fromDataTransferItem(item);
  }

  const entry = item.webkitGetAsEntry();

  // Safari supports dropping an image node from a different window and can be retrieved using
  // the DataTransferItem.getAsFile() API
  // NOTE: FileSystemEntry.file() throws if trying to get the file
  if (entry && entry.isDirectory) {
    return fromDirEntry(entry as FileSystemDirectoryEntry);
  }

  return fromDataTransferItem(item);
}
