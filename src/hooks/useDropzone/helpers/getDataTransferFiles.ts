import type { FileWithPath } from "../types";
import { flatten } from "./flatten";
import { fromList } from "./fromList";
import { noIgnoredFiles } from "./noIgnoredFiles";
import { toFilePromises } from "./toFilePromises";
import { toFileWithPath } from "./toFileWithPath";

export async function getDataTransferFiles(dataTransfer: DataTransfer, type: string) {
  // IE11 does not support dataTransfer.items
  // See https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/items#Browser_compatibility
  if (dataTransfer.items) {
    const items = fromList(dataTransfer.items).filter((item) => item.kind === "file");
    // According to https://html.spec.whatwg.org/multipage/dnd.html#dndevents,
    // only 'dragstart' and 'drop' has access to the data (source node)
    if (type !== "drop") {
      return items;
    }
    const files = await Promise.all(items.map(toFilePromises));
    return noIgnoredFiles(flatten<FileWithPath>(files));
  }

  return noIgnoredFiles(fromList(dataTransfer.files).map((file) => toFileWithPath(file)));
}
