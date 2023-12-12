import { type STCutMetadata } from "~/types";

const delimiters = {
  inner: ":",
  outer: "-",
};

export function parseCutToId(cut: Pick<STCutMetadata, "sources" | "targets" | "capacity">) {
  const sources = cut.sources.join(delimiters.inner);
  const targets = cut.targets.join(delimiters.inner);
  return [sources, targets, cut.capacity].join(delimiters.outer);
}
