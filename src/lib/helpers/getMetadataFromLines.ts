export type GetMetadataFromLinesReturnValue = {
  startsAt1: boolean;
  description: string;
  capacities: number[][];
  adjacency: (0 | 1)[][];
};

export function getMetadataFromLines(
  lines: string[],
  startsAt1?: boolean,
): GetMetadataFromLinesReturnValue {
  const capacities = lines.slice(2)?.map((row) => row.split(" ").map(Number));

  return {
    startsAt1: startsAt1 ?? false,
    description: lines.at(0) ?? "",
    capacities,
    adjacency: capacities.map((row) => row.map((node) => (node > 0 ? 1 : 0))),
  };
}
