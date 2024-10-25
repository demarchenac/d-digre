import type { AlgorithmMetadata } from "~/types";
import { getVisibleNodeAndLinksFromPaths } from "./getVisibleNodeAndLinksFromPaths";
import { getFixedMetadataByPaths } from "./getFixedMetadataByPaths";
import { getConstrainedSTSubgraph } from "./getConstrainedSTSubgraph";

type GetSourceTargetMetadataArguments = {
  capacities: number[][];
  source: number;
  target: number;
  targets: number[];
  algorithm: (...args: [number[][], number, number]) => {
    maxFlow: number;
    flow: number[][];
  };
};

export function getSourceTargetSolution({
  capacities,
  source,
  target,
  targets,
  algorithm,
}: GetSourceTargetMetadataArguments): AlgorithmMetadata {
  const { stAdjacency, stCapacities, stMetadata, stPaths } = getConstrainedSTSubgraph({
    capacities: Array.from(capacities),
    source,
    target,
    maxFlowAlgorithm: algorithm,
  });

  const stVisibility = getVisibleNodeAndLinksFromPaths(stPaths);

  const metadata = {
    ...stMetadata!,
    paths: stPaths,
    capacities: stCapacities,
    adjacency: stAdjacency,
    nodeCount: stAdjacency.length,
    targets: Array.from(targets),
    encoders: [],
    visibleNodes: Array.from(stVisibility.nodes),
    visibleLinks: Array.from(stVisibility.links),
  };

  return getFixedMetadataByPaths(metadata);
}
