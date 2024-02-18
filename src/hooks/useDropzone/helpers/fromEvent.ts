import type { FileWithPath } from "../types";
import { getDataTransferFiles } from "./getDataTransferFiles";
import { getInputFiles } from "./getInputFiles";
import { isChangeEvent } from "./isChangeEvt";
import { isDataTransfer } from "./isDataTransfer";
import { isObject } from "./isObject";

/**
 * Convert a DragEvent's DataTrasfer object to a list of File objects
 * NOTE: If some of the items are folders,
 * everything will be flattened and placed in the same list but the paths will be kept as a {path} property.
 *
 * EXPERIMENTAL: A list of https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle objects can also be passed as an arg
 * and a list of File objects will be returned.
 *
 * @param event
 */
export async function fromEvent(
  event: React.DragEvent | React.ChangeEvent<HTMLInputElement>,
): Promise<(FileWithPath | DataTransferItem)[]> {
  if (isObject<DragEvent>(event) && isDataTransfer(event.dataTransfer)) {
    return getDataTransferFiles(event.dataTransfer, event.type);
  } else if (isChangeEvent(event)) {
    return getInputFiles(event);
  }
  return [];
}
