/**
 * Check if string is a file extension.
 * @param {string} extension
 */
export function isExtension(extension: string) {
  return /^.*\.[\w]+$/.test(extension);
}
