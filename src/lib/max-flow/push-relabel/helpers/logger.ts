import { copy } from "~/lib/helpers";

export function inline2x2Print(input: number[][]) {
  const text = copy(input)
    .map((l) => "[" + l.join(", ") + "]")
    .join(", ");

  return "(" + text + ")";
}

export function blocked2x2Print(input: number[][]) {
  const maxValue = Math.max(...input.flat());
  const digits = maxValue.toString().length;

  const text = copy(input)
    .map((l) => {
      const padded = l.map((v) => v.toString().padStart(digits), " ");
      return `\t[${padded.join(", ")}]`;
    })
    .join(",\n");

  return `(\n${text}\n)`;
}
