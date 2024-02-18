import type { FileWithPath } from "../types";
import { withMimeType } from "./withMimeType";

export function toFileWithPath(
  file: FileWithPath,
  path?: string,
): FileWithPath {
  const f = withMimeType(file);
  if (typeof f.path !== "string") {
    // on electron, path is already set to the absolute path
    const { webkitRelativePath } = file;
    Object.defineProperty(f, "path", {
      value:
        typeof path === "string"
          ? path
          : // If <input webkitdirectory> is set,
          // the File will have a {webkitRelativePath} property
          // https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/webkitdirectory
          typeof webkitRelativePath === "string" &&
            webkitRelativePath.length > 0
          ? webkitRelativePath
          : file.name,
      writable: false,
      configurable: false,
      enumerable: true,
    });
  }

  return f;
}
