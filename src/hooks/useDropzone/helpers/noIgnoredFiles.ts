import { FILES_TO_IGNORE } from "../constants";
import type { FileWithPath } from "../types";

export function noIgnoredFiles(files: FileWithPath[]) {
  return files.filter((file) => FILES_TO_IGNORE.indexOf(file.name) === -1);
}
