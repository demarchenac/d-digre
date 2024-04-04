import { shuffle } from "d3";
import type { AlgorithmMetadata, TuplePairPattern } from "~/types";

type GetTrimmedSolutionsArguments = {
  min: number;
  solutions: Record<TuplePairPattern, AlgorithmMetadata>;
};

export function getTrimmedSolutions({ min, solutions }: GetTrimmedSolutionsArguments) {
  let shouldTrimSubgraphs = false;
  const map: Record<TuplePairPattern, boolean> = {};
  const first: Record<TuplePairPattern, AlgorithmMetadata> = {};
  const longest: Record<TuplePairPattern, AlgorithmMetadata> = {};
  const random: Record<TuplePairPattern, AlgorithmMetadata> = {};

  for (const raw of Object.entries(solutions)) {
    const [pair, metadata] = raw as [TuplePairPattern, AlgorithmMetadata];
    map[pair] = false;

    if (min < metadata.maxFlow) {
      shouldTrimSubgraphs = true;
      map[pair] = true;
      const pathsToRemove = metadata.maxFlow - min;

      const removingFirst = Array.from(metadata.paths);
      const removingRandom = shuffle(metadata.paths);
      const removingLongest = Array.from(metadata.paths);
      removingLongest.sort((a, b) => {
        if (a.length > b.length) return -1;
        else if (a.length < b.length) return 1;
        return 0;
      });

      for (let removed = 0; removed < pathsToRemove; removed++) {
        removingFirst.shift();
        removingRandom.shift();
        removingLongest.shift();
      }

      const maxFlow = min;

      first[pair] = { ...metadata, maxFlow, paths: removingFirst };
      longest[pair] = { ...metadata, maxFlow, paths: removingLongest };
      random[pair] = { ...metadata, maxFlow, paths: removingRandom };
    }
  }

  return { shouldTrimSubgraphs, map, first, longest, random };
}
