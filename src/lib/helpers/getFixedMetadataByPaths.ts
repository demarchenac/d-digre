import type { AlgorithmMetadata } from "~/types";
import { zeros } from "./zeros";

export function getFixedMetadataByPaths(metadata: AlgorithmMetadata) {
  const mutable = JSON.parse(JSON.stringify(metadata)) as AlgorithmMetadata;

  mutable.maxFlow = metadata.paths.length;
  mutable.flow = zeros(mutable.adjacency.length).map(() => zeros(mutable.adjacency.length));

  for (const path of metadata.paths) {
    for (let targetIndex = 1; targetIndex < path.length; targetIndex++) {
      const sourceIndex = targetIndex - 1;
      mutable.flow[path[sourceIndex]!]![path[targetIndex]!] = 1;
    }
  }

  const capacities = mutable.flow.map((row) => row.map((flow) => (flow > 0 ? flow : 0)));
  const adjacency = mutable.flow.map((row) => row.map((flow) => (flow > 0 ? 1 : 0)));

  return {
    ...mutable,
    capacities,
    adjacency,
    nodeCount: adjacency.length,
  };
}
