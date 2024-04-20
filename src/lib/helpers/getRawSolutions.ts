import type { AlgorithmMetadata, TuplePairPattern } from "~/types";
import { pushRelabel } from "./pushRelabel";
import { getSourceTargetSolution } from "./getSourceTargetSolution";

type GetRawSolutionsArguments = {
  sources: number[];
  targets: number[];
  adjacency: (0 | 1)[][];
  capacities: number[][];
};

export function getRawSolutions({ capacities, sources, targets }: GetRawSolutionsArguments) {
  const solutions: Record<TuplePairPattern, AlgorithmMetadata> = {};
  let min = Number.POSITIVE_INFINITY;
  let max = 0;

  for (const source of sources) {
    for (const target of targets) {
      const solution = getSourceTargetSolution({
        algorithm: pushRelabel,
        capacities,
        source,
        target,
        targets,
      });

      solutions[`${source}_${target}`] = solution;

      if (solution.maxFlow < min) min = solution.maxFlow;
      if (solution.maxFlow > max) max = solution.maxFlow;
    }
  }

  return { min, max, solutions };
}
