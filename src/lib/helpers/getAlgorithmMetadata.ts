import { type AlgorithmMetadata } from "~/types";

type GetAlgorithmMetadataArguments = Pick<AlgorithmMetadata, "flow" | "maxFlow" | "paths">;

export function getAlgorithmMetadata({
  flow,
  maxFlow,
  paths,
}: GetAlgorithmMetadataArguments): AlgorithmMetadata {
  const capacities = flow.map((row) => row.map((nodeFlow) => (nodeFlow > 0 ? nodeFlow : 0)));
  const adjacency = flow.map((row) => row.map((nodeFlow) => (nodeFlow > 0 ? 1 : 0)));
  const targets = Array.from(new Set(paths.map((path) => path.at(-1) ?? 0)));

  return {
    maxFlow,
    flow,
    paths,
    capacities,
    adjacency,
    nodeCount: adjacency.length,
    targets,
  };
}
