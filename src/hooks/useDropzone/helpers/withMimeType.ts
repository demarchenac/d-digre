import { COMMON_MIME_TYPES } from "../constants";
import type { FileWithPath, Extension } from "../types";

export function withMimeType(file: FileWithPath) {
  const { name } = file;
  const hasExtension = name && name.lastIndexOf(".") !== -1;

  if (hasExtension && !file.type) {
    const extension = name.split(".").pop()!.toLowerCase();
    const type = COMMON_MIME_TYPES.get(extension as Extension);
    if (type) {
      Object.defineProperty(file, "type", {
        value: type,
        writable: false,
        configurable: false,
        enumerable: true,
      });
    }
  }

  return file;
}
