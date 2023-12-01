import type { BiDirectedNode } from "~/types";
import { findUnvisitedNeighbor } from "./findUnvisitedNeighbor";

export function dfs(nodes: BiDirectedNode[], source?: BiDirectedNode) {
  const jumpsFromSource: Record<string, number> = {};
  for (const node of nodes) {
    jumpsFromSource[node.id.toString()] = Infinity;
  }

  if (!source) return jumpsFromSource;

  jumpsFromSource[source.id.toString()] = 0;
  if (source.connectedTo.length === 0) return jumpsFromSource;

  const stack = [source.id];
  const visitedNodes: Record<string, boolean> = { [source.id.toString()]: true };

  while (stack.length) {
    const idToVisit = stack.pop();
    const node = nodes.find((node) => node.id === idToVisit);

    const unvisitedNode = findUnvisitedNeighbor(visitedNodes, node);

    if (idToVisit !== undefined && idToVisit >= 0 && unvisitedNode >= 0) {
      if (!visitedNodes[unvisitedNode]) {
        const distanceAtToVisit = jumpsFromSource[idToVisit];
        if (distanceAtToVisit !== undefined && jumpsFromSource[unvisitedNode] === Infinity) {
          jumpsFromSource[unvisitedNode] = distanceAtToVisit + 1;
        }
        visitedNodes[unvisitedNode] = true;

        stack.push(...[idToVisit, unvisitedNode]);
      }
    } else {
      // if all vertices are visited then we don;t have to add any value in stack
      visitedNodes[unvisitedNode] = true;
    }
  }

  return jumpsFromSource;
}
