import { range } from "~/lib/helpers";

export function getResidualAdjacencyListGraph(graph: number[][]) {
  const numberOfVertices = graph.length;
  const residualAdjacencyList = Array<number[]>(numberOfVertices).fill([]);

  for (const u of range(numberOfVertices)) {
    if (!residualAdjacencyList[u]) continue;

    for (const v of range(numberOfVertices)) {
      if (!graph[u]) continue;
      if (!graph[u][v]) continue;
      if (!(graph[u][v] > 0)) continue;

      residualAdjacencyList[u] = residualAdjacencyList[u].concat([v]);
    }
  }

  return residualAdjacencyList;
}
