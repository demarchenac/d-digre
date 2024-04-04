import type { AlgorithmMetadata, TrimmingMethod, TuplePairPattern } from "~/types";
import { zeros } from "./zeros";

type GetTrimmedMergedSolutionsArguments = {
  shouldTrimSubgraphs: boolean;
  min: number;
  adjacency: number[][];
  map: Record<TuplePairPattern, boolean>;
  rawSolutions: Record<TuplePairPattern, AlgorithmMetadata>;
  first: Record<TuplePairPattern, AlgorithmMetadata>;
  longest: Record<TuplePairPattern, AlgorithmMetadata>;
  random: Record<TuplePairPattern, AlgorithmMetadata>;
};

export function getTrimmedMergedSolutions({
  adjacency: rawAdjacency,
  first,
  longest,
  map,
  min,
  random,
  rawSolutions,
  shouldTrimSubgraphs,
}: GetTrimmedMergedSolutionsArguments): Record<TrimmingMethod, AlgorithmMetadata> | null {
  if (!shouldTrimSubgraphs) return null;

  const methodMap: Record<TrimmingMethod, Record<TuplePairPattern, AlgorithmMetadata>> = {
    first: first,
    longest: longest,
    random: random,
  };

  const solutions = {} as Record<TrimmingMethod, AlgorithmMetadata>;

  for (const method of ["first", "longest", "random"] as TrimmingMethod[]) {
    const allPaths: string[] = [];
    const capacities = zeros(rawAdjacency.length).map(() => zeros(rawAdjacency.length));
    const flow = zeros(rawAdjacency.length).map(() => zeros(rawAdjacency.length));

    for (const pairMap of Object.entries(map)) {
      const [pair, shouldUseTrimmed] = pairMap as [TuplePairPattern, boolean];

      const solution = shouldUseTrimmed ? methodMap[method][pair]! : rawSolutions[pair]!;

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

      solution.paths.forEach((path) => allPaths.push(path.join("-")));
    }

    const adjacency = capacities.map((row) => row.map((node) => (node > 0 ? 1 : 0)));

    const paths = Array.from(new Set(allPaths)).map((path) => path.split("-").map(Number));
    const targets = Array.from(new Set(paths.map((path) => path.at(-1) ?? 0)));

    solutions[method] = {
      capacities: capacities,
      adjacency: adjacency,
      flow: flow,
      maxFlow: min,
      paths: paths,
      nodeCount: capacities.length,
      targets,
    };
  }

  return solutions;
}
