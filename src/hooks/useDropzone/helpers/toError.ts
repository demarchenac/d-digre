import type { FileError } from "../types";

export function toInvalidFileTypeError(accept?: string | string[]): FileError {
  const parsed = Array.isArray(accept) && accept.length === 1 ? accept[0] : accept;
  const messageSuffix = Array.isArray(parsed) ? `one of ${parsed.join(", ")}` : parsed;
  return {
    code: "file-invalid-type",
    message: `File type must be ${messageSuffix}`,
  };
}

export function toFileTooLargeError(maxSize: number): FileError {
  return {
    code: "file-too-large",
    message: `File is larger than ${maxSize} ${maxSize === 1 ? "byte" : "bytes"}`,
  };
}

export function toFileTooSmallError(minSize: number): FileError {
  return {
    code: "file-too-small",
    message: `File is smaller than ${minSize} ${minSize === 1 ? "byte" : "bytes"}`,
  };
}

export function toTooManyFilesError(): FileError {
  return {
    code: "too-many-files",
    message: "Too many files",
  };
}
