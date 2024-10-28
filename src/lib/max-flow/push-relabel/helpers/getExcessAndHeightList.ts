import { range } from "~/lib/helpers";
import { type HeightExcessTuple } from "../types";
import { getShortestPathWithBreadthFirstSearch } from "./getShortestPathWithBreadthFirstSearch";

export function getExcessAndHeightList(
  graph: number[][],
  residual: number[][],
  source: number,
  target: number,
) {
  const numberOfVertices = graph.length;
  const listOfVertices = range(numberOfVertices);
  const listOfVerticesWithoutSource = range(1, numberOfVertices);
  const heightAndExcessList: HeightExcessTuple[] = listOfVertices.map(() => [0, 0]);

  if (!heightAndExcessList[source]) return heightAndExcessList;
  if (!residual[source]) return heightAndExcessList;

  heightAndExcessList[source][0] = numberOfVertices;

  for (const vertex of listOfVertices) {
    if (!heightAndExcessList[vertex]) continue;
    if (!graph[source]) continue;
    if (graph[source][vertex] == null) continue;

    heightAndExcessList[source][1] -= graph[source][vertex];
    heightAndExcessList[vertex][1] = graph[source][vertex];

    if (graph[source][vertex] <= 0) continue;
    if (!residual[vertex]) continue;

    residual[vertex].push(source);
    residual[vertex] = residual[vertex].filter((adjacent) => adjacent !== vertex);
  }

  for (const vertex of listOfVerticesWithoutSource) {
    const shortestFromVertexToTarget = getShortestPathWithBreadthFirstSearch(
      residual,
      vertex,
      target,
    );

    if (!shortestFromVertexToTarget) continue;
    if (!heightAndExcessList[vertex]) continue;

    heightAndExcessList[vertex][0] = shortestFromVertexToTarget.length - 1;
    if (heightAndExcessList[vertex][0] < 0) heightAndExcessList[vertex][0] = 0;
  }

  return heightAndExcessList;
}
