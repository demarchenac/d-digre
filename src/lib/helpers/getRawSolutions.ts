import type { AlgorithmMetadata, TuplePairPattern } from "~/types";
import { findSourceTargetPaths } from "./findSourceTargetPaths";
import { getAlgorithmMetadata } from "./getAlgorithmMetadata";
import { getUniquePaths } from "./getUniquePaths";
import { pushRelabel } from "./pushRelabel";

type GetRawSolutionsArguments = {
  sources: number[];
  targets: number[];
  adjacency: (0 | 1)[][];
  capacities: number[][];
};

export function getRawSolutions({
  adjacency,
  capacities,
  sources,
  targets,
}: GetRawSolutionsArguments) {
  const solutions: Record<TuplePairPattern, AlgorithmMetadata> = {};
  let min = Number.POSITIVE_INFINITY;
  let max = 0;

  for (const source of sources) {
    for (const target of targets) {
      /**
       * Needs to be abstracted as an argument
       */
      const { flow, maxFlow } = pushRelabel(capacities, source, target);
      const allPaths = findSourceTargetPaths(adjacency, source, target);
      const paths = getUniquePaths(allPaths, source, target);
      const solution = getAlgorithmMetadata({ flow, maxFlow, paths });

      solutions[`${source}_${target}`] = solution;

      if (maxFlow < min) min = maxFlow;
      if (maxFlow > max) max = maxFlow;
    }
  }

  return { min, max, solutions };
}
