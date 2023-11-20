import type { FileValidator } from "../types";
import { isFileAccepted } from "./isFileAccepted";
import { isFileSizeAccepted } from "./isFileSizeAccepted";

export function isEveryFileAccepted({
  files,
  accept,
  minSize,
  maxSize,
  multiple,
  maxFiles,
  validator,
}: {
  files: File[];
  accept?: string | string[];
  minSize?: number;
  maxSize?: number;
  multiple: boolean;
  maxFiles?: number;
  validator?: FileValidator;
}) {
  if (
    (!multiple && files.length > 1) ||
    (multiple && maxFiles && maxFiles >= 1 && files.length > maxFiles)
  ) {
    return false;
  }

  return files.every((file) => {
    const [accepted] = isFileAccepted(file, accept);
    const [sizeMatch] = isFileSizeAccepted(file, minSize, maxSize);
    const customErrors = validator ? validator(file) : null;
    return accepted && sizeMatch && !customErrors;
  });
}
