export function isEventWithFiles(event: React.DragEvent | React.ChangeEvent<HTMLInputElement>) {
  if (!("dataTransfer" in event)) {
    return Boolean(event.target) && Boolean(event.target.files);
  }
  // https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/types
  // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Recommended_drag_types#file
  return Array.prototype.some.call(
    event.dataTransfer.types,
    (type) => type === "Files" || type === "application/x-moz-file",
  );
}
