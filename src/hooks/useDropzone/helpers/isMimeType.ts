/**
 * Check if mime is a MIME type string.
 *
 * See accepted format: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#unique_file_type_specifiers.
 *
 * @param {string} mime
 */
export function isMimeType(mime: string) {
  return (
    mime === "audio/*" ||
    mime === "video/*" ||
    mime === "image/*" ||
    mime === "text/*" ||
    /\w+\/[-+.\w]+/g.test(mime)
  );
}
