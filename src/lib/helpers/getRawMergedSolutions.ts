import type { AlgorithmMetadata, TuplePairPattern } from "~/types";
import { zeros } from "./zeros";
import { getNodesAndLinks } from "./getNodesAndLinks";
import { getVisibleNodeAndLinksFromPaths } from "./getVisibleNodeAndLinksFromPaths";

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
      row.forEach((capacity, nodeIndex) => {
        capacities[rowIndex]![nodeIndex] = Math.max(capacities[rowIndex]![nodeIndex]!, capacity);
      });
    });

    solution.flow.forEach((row, rowIndex) => {
      row.forEach((flowValue, nodeIndex) => {
        flow[rowIndex]![nodeIndex] = Math.max(flow[rowIndex]![nodeIndex]!, flowValue);
      });
    });

    solution.paths.forEach((path) => paths.push(path.join("-")));
  }

  const adjacency = capacities.map((row) => row.map((node) => (node > 0 ? 1 : 0)));

  const nonRepeatedPathsForRawMerged = Array.from(new Set(paths)).map((path) =>
    path.split("-").map(Number),
  );

  const visibleLinks: string[] = [];
  for (const path of nonRepeatedPathsForRawMerged) {
    for (let targetIndex = 1; targetIndex < path.length; targetIndex++) {
      const sourceIndex = targetIndex - 1;
      visibleLinks.push(`${path[sourceIndex]}-${path[targetIndex]}`);
    }
  }

  const { nodes: rawMergedNodes } = getNodesAndLinks(capacities);
  const fixedNodes = rawMergedNodes.map((node) => ({
    ...node,
    incoming: node.incoming.filter((incoming) => visibleLinks.includes(`${incoming}-${node.id}`)),
    outgoing: node.outgoing.filter((outgoing) => visibleLinks.includes(`${node.id}-${outgoing}`)),
  }));

  const encoders = fixedNodes
    .filter((node) => node.incoming.length >= 2 && node.outgoing.length > 0)
    .map((node) => node.id);

  const visibility = getVisibleNodeAndLinksFromPaths(nonRepeatedPathsForRawMerged);

  const targets = Array.from(new Set(nonRepeatedPathsForRawMerged.map((path) => path.at(-1) ?? 0)));

  return {
    capacities: capacities,
    adjacency: adjacency,
    flow: flow,
    maxFlow: max,
    paths: nonRepeatedPathsForRawMerged,
    nodeCount: capacities.length,
    targets,
    encoders,
    visibleLinks: visibility.links,
    visibleNodes: visibility.nodes,
  };
}
