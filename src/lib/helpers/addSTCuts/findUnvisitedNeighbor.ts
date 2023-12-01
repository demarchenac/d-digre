import type { BiDirectedNode } from "~/types";

export function findUnvisitedNeighbor(
  visitedNodes: Record<string, boolean>,
  source?: BiDirectedNode,
) {
  if (!source) return -1;

  const sourceNeighbors = Array.from(source.connectedTo);

  for (const neighbor of sourceNeighbors) {
    if (!visitedNodes[neighbor.toString()]) {
      return neighbor;
    }
  }

  return -1;
}
