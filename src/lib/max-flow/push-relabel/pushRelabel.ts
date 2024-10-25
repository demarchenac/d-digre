import { range } from "~/lib/helpers";
import {
  getEdge,
  getExcessAndHeightList,
  getNeighborHeights,
  getPreFlow,
  getResidualAdjacencyListGraph,
} from "./helpers";

export function pushRelabel(graph: number[][], source: number, target: number) {
  let maxFlow = 0;
  const residualAdjacency = getResidualAdjacencyListGraph(graph);
  const heightExcessList = getExcessAndHeightList(graph, residualAdjacency, source, target);
  const { queue, residualGraph } = getPreFlow(graph, source, target);

  while (!queue.isEmpty()) {
    const vertex = queue.popLeft();
    console.log(`\nv: ${vertex}, ${queue.toString()}\n`);

    if (!vertex) continue;

    let [canPush, unsafeNeighbor] = getEdge(residualAdjacency, heightExcessList, vertex);

    if (!heightExcessList[vertex]) continue;

    // push
    while (canPush && unsafeNeighbor != null && heightExcessList[vertex][1] > 0) {
      const neighbor = unsafeNeighbor;
      console.log(`\tPushing: ${neighbor}`);

      if (!heightExcessList[neighbor]) continue;
      if (!residualGraph[vertex]) continue;
      if (!residualGraph[neighbor]) continue;
      if (!residualAdjacency[vertex]) continue;
      if (!residualAdjacency[neighbor]) continue;
      if (residualGraph[vertex][neighbor] == null) continue;
      if (residualGraph[neighbor][vertex] == null) continue;

      const flowToPush = Math.min(heightExcessList[vertex][1], residualGraph[vertex][neighbor]);

      residualGraph[vertex][neighbor] -= flowToPush;
      residualGraph[neighbor][vertex] += flowToPush;

      if (!residualAdjacency[neighbor].includes(vertex)) residualAdjacency[neighbor].push(vertex);

      if (residualGraph[vertex][neighbor] === 0 && residualAdjacency[vertex].includes(neighbor)) {
        const neighborIndex = residualAdjacency[vertex].indexOf(neighbor);
        if (neighborIndex !== -1) residualAdjacency[vertex].splice(neighborIndex, 1);
      }

      heightExcessList[vertex][1] -= flowToPush;
      heightExcessList[neighbor][1] += flowToPush;

      if (neighbor === target) maxFlow += flowToPush;

      if (![source, target].includes(neighbor) && !queue.includes(neighbor)) queue.append(neighbor);

      const edge = getEdge(residualAdjacency, heightExcessList, vertex);
      canPush = edge[0];
      unsafeNeighbor = edge[1];
    }

    // relabel
    if (heightExcessList[vertex][1] > 0) {
      console.log(`\tRelabeling: ${vertex}`);
      heightExcessList[vertex][0] =
        Math.min(...getNeighborHeights(residualAdjacency, heightExcessList, vertex)) + 1;
      queue.append(vertex);
    }
  }

  const flow = range(graph.length).map((v) =>
    range(graph.length).map((w) => {
      if (!graph[v]) return 0;
      if (graph[v][w] == null) return 0;
      if (!residualGraph[v]) return 0;
      if (residualGraph[v][w] == null) return 0;

      if (graph[v][w] - residualGraph[v][w] <= 0) return 0;
      else return graph[v][w] - residualGraph[v][w];
    }),
  );

  return { residualAdjacency, residualGraph, maxFlow, flow };
}
