import type { IsActive } from "./types";

export const isActive: IsActive = (node: number, { middleNodes, heights, excesses }) =>
  middleNodes.indexOf(node) >= 0 &&
  heights[node]! < Number.POSITIVE_INFINITY &&
  excesses[node]! > 0;
