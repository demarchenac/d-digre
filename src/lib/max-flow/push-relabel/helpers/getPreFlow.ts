import { range } from "~/lib/helpers";
import { Deque } from "../deque";

export function getPreFlow(graph: number[][], source: number, target: number) {
  const numberOfVertices = graph.length;
  const listOfVertices = range(numberOfVertices);
  const queue = new Deque<number>();

  const residualGraph = listOfVertices.map((v) => {
    const row = graph[v];
    if (!row) return [];

    return listOfVertices
      .map((w) => {
        if (row[w] == null) return undefined;

        return row[w];
      })
      .filter((v) => v != null) as number[];
  });

  for (const w of listOfVertices) {
    if (!residualGraph[w]) continue;
    if (!residualGraph[source]) continue;
    if (!graph[source]) continue;
    if (graph[source][w] == null) continue;

    residualGraph[w][source] = graph[source][w];
    residualGraph[source][w] = 0;

    if (graph[source][w] > 0 && w !== target) queue.append(w);
  }

  return { queue, residualGraph };
}
