import { fromList } from "./fromList";
import { toFileWithPath } from "./toFileWithPath";

export function getInputFiles(evt: Event) {
  const files = (evt.target as HTMLInputElement).files;
  return fromList(files).map((file) => toFileWithPath(file));
}
