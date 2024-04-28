import type { AlgorithmMetadata } from "~/types";
import { findSourceTargetPaths } from "./findSourceTargetPaths";
import { getNonRepeatingNodePaths } from "./getNonRepeatingNodePaths";
import { getVisibleNodeAndLinksFromPaths } from "./getVisibleNodeAndLinksFromPaths";
import { getFixedMetadataByPaths } from "./getFixedMetadataByPaths";

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
  const stMetadata = algorithm(capacities, source, target);

  const stCapacities = stMetadata.flow.map((row) => row.map((flow) => (flow > 0 ? flow : 0)));
  const stAdjacency = stMetadata.flow.map((row) => row.map((flow) => (flow > 0 ? 1 : 0)));

  const paths = findSourceTargetPaths(stAdjacency, source, target);

  const stPaths = getNonRepeatingNodePaths(paths, source, target);
  const stVisibility = getVisibleNodeAndLinksFromPaths(stPaths);

  const metadata = {
    ...stMetadata,
    paths: stPaths,
    capacities: stCapacities,
    adjacency: stAdjacency,
    nodeCount: stAdjacency.length,
    targets: Array.from(targets),
    encoders: [],
    visibleNodes: Array.from(stVisibility.nodes),
    visibleLinks: Array.from(stVisibility.links),
  };

  if (paths.length === stPaths.length) return metadata;

  return getFixedMetadataByPaths(metadata);
}
