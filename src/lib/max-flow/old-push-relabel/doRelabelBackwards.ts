import { copy } from "~/lib/helpers";
import type { DoRelabel } from "./types";

export const doRelabelBackwards: DoRelabel = (from, config) => {
  const mutableConfig = copy(config);

  if (config.residualEdges[from]!.length === 0) {
    mutableConfig.heights[from] = Number.POSITIVE_INFINITY;
    // console.log(`Relabel' (${from}): ${Number.POSITIVE_INFINITY}`);
    return mutableConfig;
  }

  const nextSuitableHeights = config.residualEdges[from]!.filter(
    (to) => mutableConfig.flow[from]![to]! < 0,
  ).map((to) => mutableConfig.heights[to]! + 1);

  const newHeight = Math.min(...nextSuitableHeights);
  mutableConfig.heights[from] = newHeight;

  // console.log(`Relabel' (${from}): ${newHeight}`);

  return copy(mutableConfig);
};
