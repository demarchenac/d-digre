import { shuffle } from "d3";
import type { AlgorithmMetadata, TuplePairPattern } from "~/types";
import { getVisibleNodeAndLinksFromPaths } from "./getVisibleNodeAndLinksFromPaths";

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

      const firstMeta = JSON.parse(JSON.stringify(metadata)) as AlgorithmMetadata;
      const randomMeta = JSON.parse(JSON.stringify(metadata)) as AlgorithmMetadata;
      const longestMeta = JSON.parse(JSON.stringify(metadata)) as AlgorithmMetadata;

      for (let removed = 0; removed < pathsToRemove; removed++) {
        const firstRemoved = removingFirst.shift();
        const randomRemoved = removingRandom.shift();
        const longestRemoved = removingLongest.shift();

        if (firstRemoved) {
          for (let sourceIndex = 0; sourceIndex < firstRemoved.length - 1; sourceIndex++) {
            const targetIndex = sourceIndex + 1;
            const row = firstRemoved[sourceIndex]!;
            const col = firstRemoved[targetIndex]!;
            firstMeta.flow[row]![col] = 0;
            firstMeta.capacities[row]![col] = 0;
            firstMeta.adjacency[row]![col] = 0;
          }
        }

        if (randomRemoved) {
          for (let sourceIndex = 0; sourceIndex < randomRemoved.length - 1; sourceIndex++) {
            const targetIndex = sourceIndex + 1;
            const row = randomRemoved[sourceIndex]!;
            const col = randomRemoved[targetIndex]!;
            randomMeta.flow[row]![col] = 0;
            randomMeta.capacities[row]![col] = 0;
            randomMeta.adjacency[row]![col] = 0;
          }
        }

        if (longestRemoved) {
          for (let sourceIndex = 0; sourceIndex < longestRemoved.length - 1; sourceIndex++) {
            const targetIndex = sourceIndex + 1;
            const row = longestRemoved[sourceIndex]!;
            const col = longestRemoved[targetIndex]!;
            longestMeta.flow[row]![col] = 0;
            longestMeta.capacities[row]![col] = 0;
            longestMeta.adjacency[row]![col] = 0;
          }
        }
      }

      const maxFlow = min;

      const firstVisibility = getVisibleNodeAndLinksFromPaths(removingFirst);
      const longestVisibility = getVisibleNodeAndLinksFromPaths(removingLongest);
      const randomVisibility = getVisibleNodeAndLinksFromPaths(removingRandom);

      first[pair] = {
        ...firstMeta,
        maxFlow,
        paths: removingFirst,
        encoders: [],
        visibleNodes: Array.from(firstVisibility.nodes),
        visibleLinks: Array.from(firstVisibility.links),
      };

      longest[pair] = {
        ...longestMeta,
        maxFlow,
        paths: removingLongest,
        encoders: [],
        visibleNodes: Array.from(longestVisibility.nodes),
        visibleLinks: Array.from(longestVisibility.links),
      };

      random[pair] = {
        ...randomMeta,
        maxFlow,
        paths: removingRandom,
        encoders: [],
        visibleNodes: Array.from(randomVisibility.nodes),
        visibleLinks: Array.from(randomVisibility.links),
      };
    }
  }

  return { shouldTrimSubgraphs, map, first, longest, random };
}
