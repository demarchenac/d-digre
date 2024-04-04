export async function getFileLines(file: File) {
  let contents = await file.text();

  if (contents.startsWith("\r\n")) {
    contents = contents.replace("\r\n", "Untitled Graph\r\n");
  }

  const lines = contents
    .split(/\n/g)
    .map((line) => line.replace(/\r/, "").trim().replace(/\s+/g, " "))
    .filter((line) => line.trim().length > 0);

  return lines;
}
