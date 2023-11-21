import type { AcceptAttribute } from "../types";
import { isExtension } from "./isExtension";
import { isMimeType } from "./isMimeType";

/**
 * Convert the `{accept}` dropzone prop to an array of MIME types/extensions.
 * @param {AcceptProp} accept
 * @returns {string}
 */
export function parseAcceptAsList(accept?: Partial<AcceptAttribute>): string | undefined {
  if (accept) {
    return (
      Object.entries(accept)
        .reduce(
          (accumulator, [mime, extensions]) => [...accumulator, mime, ...extensions] as string[],
          [] as string[],
        )
        // Silently discard invalid entries as pickerOptionsFromAccept warns about these
        .filter((mimeOrExtension) => isMimeType(mimeOrExtension) || isExtension(mimeOrExtension))
        .join(",")
    );
  }

  return undefined;
}
