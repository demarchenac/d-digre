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
    const vertexIndex = residual[source].indexOf(vertex);

    if (vertexIndex === -1) continue;

    residual[source].splice(vertexIndex, 1);
  }

  for (const vertex of listOfVerticesWithoutSource) {
    const path = getShortestPathWithBreadthFirstSearch(residual, vertex, target);

    if (!path) continue;
    if (!heightAndExcessList[vertex]) continue;

    heightAndExcessList[vertex][0] = path.length - 1;
  }

  return heightAndExcessList;
}
