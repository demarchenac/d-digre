import { type HeightExcessTuple } from "../types";

export function getNeighborHeights(
  residualAdjacencyList: number[][],
  heightExcessList: HeightExcessTuple[],
  start: number,
) {
  const heights: number[] = [];

  if (!residualAdjacencyList[start]) return heights;

  for (const neighbor of residualAdjacencyList[start]) {
    if (!heightExcessList[neighbor]) continue;

    heights.push(heightExcessList[neighbor][0]);
  }

  return heights;
}
