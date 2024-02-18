// IE11 does not support Array.from()
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from#Browser_compatibility
// https://developer.mozilla.org/en-US/docs/Web/API/FileList
// https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItemList

// Overload signatures
export function fromList(items: null): File[] | DataTransferItem[];
export function fromList(items: DataTransferItemList): DataTransferItem[];
export function fromList(items: DataTransferItemList | null): DataTransferItem[];
export function fromList(items: FileList): File[];
export function fromList(items: FileList | null): File[];

export function fromList(
  items: DataTransferItemList | FileList | null,
): File[] | DataTransferItem[] {
  if (items === null) {
    return [];
  }

  if ("item" in items) {
    return [...items] as File[];
  } else {
    return [...items] as DataTransferItem[];
  }
}
