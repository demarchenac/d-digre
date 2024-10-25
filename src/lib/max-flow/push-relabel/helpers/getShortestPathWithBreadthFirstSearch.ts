import { Deque } from "../deque";
import { type AdjacencyTuple } from "../types";

export function getShortestPathWithBreadthFirstSearch(
  residualAdjacencyList: number[][],
  start: number,
  target: number,
) {
  const visited = new Set<number>();
  const queue = new Deque<AdjacencyTuple>([[start, [start]]]);
  let currentNode: number | undefined;

  while (!queue.isEmpty()) {
    const [visiting, path] = queue.popLeft()!;
    currentNode = visiting;

    if (visiting === target) return path;

    if (visited.has(visiting)) continue;

    visited.add(visiting);

    if (!residualAdjacencyList[visiting]) continue;

    for (const neighbor of residualAdjacencyList[visiting]) {
      if (visited.has(neighbor)) continue;

      queue.append([neighbor, path.concat([neighbor])]);
    }
  }

  if (currentNode !== target) return [];
}
