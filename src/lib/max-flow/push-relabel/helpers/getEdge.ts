import type { HeightExcessTuple } from "../types";

export function getEdge(
  startingEdges: number[][],
  residualAdjacencyList: number[][],
  heightExcessList: HeightExcessTuple[],
  start: number,
): [boolean, number | undefined] {
  if (!residualAdjacencyList[start]) return [false, undefined];

  const edges = startingEdges[start];
  if (!edges) return [false, undefined];

  const heightExcessTuple = heightExcessList[start];
  if (!heightExcessTuple) return [false, undefined];

  const startingHeight = heightExcessTuple[0];

  const candidates = residualAdjacencyList[start].filter((neighbor) => {
    if (!heightExcessList[neighbor]) return false;
    return startingHeight === heightExcessList[neighbor][0] + 1;
  });

  if (!candidates.length) return [false, undefined];

  const matchingNeighbor = candidates.find((neighbor) => edges.includes(neighbor));

  if (matchingNeighbor != null) return [true, matchingNeighbor];

  const firstMatch = candidates[0];
  if (firstMatch != null) return [true, firstMatch];

  return [false, undefined];
}
