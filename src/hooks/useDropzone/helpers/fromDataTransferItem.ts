import { toFileWithPath } from "./toFileWithPath";

export function fromDataTransferItem(item: DataTransferItem) {
  const file = item.getAsFile();
  if (!file) {
    const fileAsString = file as unknown as string;
    return Promise.reject(`${fileAsString} is not a File`);
  }
  const fwp = toFileWithPath(file);
  return Promise.resolve(fwp);
}
