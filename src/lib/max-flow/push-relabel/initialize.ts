import { zeros, copy } from "~/lib/helpers";
import { initializeHeights } from "./initializeHeights";
import type { Initialize } from "./types";

export const initialize: Initialize = (capacities, source, target) => {
  const excesses: number[] = zeros(capacities.length);

  const heights = initializeHeights(capacities, source, target);

  const flow: number[][] = zeros(capacities.length).map(() => zeros(capacities.length));

  heights[source] = capacities.length;
  excesses[source] = Number.POSITIVE_INFINITY;

  const queue = capacities[source]!.map((capacity, index) => ({ capacity, index }))
    .filter(({ capacity }) => (capacity > 0 ? true : false))
    .map(({ index }) => index);

  for (const queued of queue) {
    excesses[queued]! = capacities[source]![queued]!;
    flow[source]![queued] = capacities[source]![queued]!;
    flow[queued]![source] -= capacities[source]![queued]!;
  }

  const nodes: number[] = zeros(capacities.length).map((_, i) => i);
  const middleNodes = nodes.filter((node) => node !== source && node !== target);

  const edges: number[][] = [];
  const residualEdges: number[][] = [];

  for (const from of nodes) {
    edges[from] = [];
    if (!residualEdges[from]) residualEdges[from] = [];

    for (const to of nodes) {
      if (capacities[from]![to]! > 0) edges[from]!.push(to);
      if (to === source) continue;

      if (capacities[from]![to]! > 0) {
        if (!residualEdges[to]) residualEdges[to] = [];

        residualEdges[to]!.push(from);
      }
    }
  }

  return {
    queue: copy(queue.filter((node) => node !== target)),
    middleNodes: copy(middleNodes),
    heights: copy(heights),
    excesses: copy(excesses),
    capacities: copy(capacities),
    edges: copy(edges),
    residualEdges: copy(residualEdges),
    flow: copy(flow),
  };
};
