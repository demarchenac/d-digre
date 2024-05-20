import { copy, zeros } from "~/lib/helpers";
import { getPaths } from "../helpers";
import type { InitializeHeights } from "./types";

export const initializeHeights: InitializeHeights = (capacities, source, target) => {
  const invertedCapacities = zeros(capacities.length).map(() => zeros(capacities.length));
  const heights: number[] = zeros(capacities.length);

  for (let from = 0; from < capacities.length; from++)
    for (let to = 0; to < capacities.length; to++)
      if (capacities[from]![to]! === 1) invertedCapacities![to]![from] = 1;

  for (let from = 0; from < capacities.length; from++) {
    if (from === source || from === target) continue;

    const distance = getPaths(invertedCapacities, target, from).at(0)?.length;
    if (!distance || distance <= 0) continue;

    heights[from] = distance - 1;
  }

  heights[source] = capacities.length;

  return copy(heights);
};
