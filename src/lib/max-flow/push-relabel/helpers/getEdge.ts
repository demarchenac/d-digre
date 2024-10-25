import { type HeightExcessTuple } from "../types";

export function getEdge(
  residualAdjacencyList: number[][],
  heightExcessList: HeightExcessTuple[],
  start: number,
): [boolean, number | undefined] {
  if (!residualAdjacencyList[start]) return [false, undefined];
  if (!heightExcessList[start]) return [false, undefined];

  for (const neighbor of residualAdjacencyList[start]) {
    if (!heightExcessList[neighbor]) continue;
    if (heightExcessList[start][0] === heightExcessList[neighbor][0] + 1) return [true, neighbor];
  }

  return [false, undefined];
}
