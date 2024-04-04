import type { AlgorithmMetadata, TuplePairPattern } from "~/types";
import { zeros } from "./zeros";

type GetRawMergedSolutionsArguments = {
  max: number;
  adjacency: number[][];
  map: Record<TuplePairPattern, boolean>;
  solutions: Record<TuplePairPattern, AlgorithmMetadata>;
};

export function getRawMergedSolutions({
  max,
  adjacency: originalAdjacency,
  map,
  solutions,
}: GetRawMergedSolutionsArguments): AlgorithmMetadata {
  const paths: string[] = [];
  const capacities = zeros(originalAdjacency.length).map(() => zeros(originalAdjacency.length));
  const flow = zeros(originalAdjacency.length).map(() => zeros(originalAdjacency.length));

  for (const pairMap of Object.entries(map)) {
    const [pair] = pairMap as [TuplePairPattern, boolean];
    const solution = solutions[pair]!;

    solution.capacities.forEach((row, rowIndex) => {
      row.forEach((node, nodeIndex) => {
        capacities[rowIndex]![nodeIndex] = Math.max(capacities[rowIndex]![nodeIndex]!, node);
      });
    });

    solution.flow.forEach((row, rowIndex) => {
      row.forEach((node, nodeIndex) => {
        flow[rowIndex]![nodeIndex] = Math.max(flow[rowIndex]![nodeIndex]!, node);
      });
    });

    solution.paths.forEach((path) => paths.push(path.join("-")));
  }

  const adjacency = capacities.map((row) => row.map((node) => (node > 0 ? 1 : 0)));

  const nonRepeatedPathsForRawMerged = Array.from(new Set(paths)).map((path) =>
    path.split("-").map(Number),
  );

  const targets = Array.from(new Set(nonRepeatedPathsForRawMerged.map((path) => path.at(-1) ?? 0)));

  return {
    capacities: capacities,
    adjacency: adjacency,
    flow: flow,
    maxFlow: max,
    paths: nonRepeatedPathsForRawMerged,
    nodeCount: capacities.length,
    targets,
  };
}
