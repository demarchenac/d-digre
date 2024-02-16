export type AppState =
  | "no-graph"
  | "graph-loaded"
  | "ran-algorithm"
  | "selected-raw-source-target"
  | "selected-trimmed-source-target";

export type SelectedAlgorithm = "none" | "push-relabel";

export type MetadataKind = "raw" | "trimmed";
export type TrimmingMethod = "first" | "longest" | "random";
export type TuplePairPattern = `${number}_${number}`;
export type RawPairPattern = `raw:${TuplePairPattern}`;
export type TrimmedPairPattern = `trimmed_${TrimmingMethod}:${TuplePairPattern}`;
export type PairPattern = RawPairPattern | TrimmedPairPattern;
