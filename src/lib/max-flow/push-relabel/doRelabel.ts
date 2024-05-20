import { copy } from "~/lib/helpers";
import { getResidualCapacityOf } from "./getResidualCapacityOf";
import type { DoRelabel } from "./types";

export const doRelabel: DoRelabel = (from, config) => {
  const mutableConfig = copy(config);

  if (config.edges[from]!.length === 0) {
    mutableConfig.heights[from] = Number.POSITIVE_INFINITY;
    // console.log(`Relabel (${from}): ${Number.POSITIVE_INFINITY}`);
    return mutableConfig;
  }

  const nextSuitableHeights = config.edges[from]!.filter(
    (to) => getResidualCapacityOf({ from, to }, mutableConfig) > 0,
  ).map((to) => mutableConfig.heights[to]! + 1);

  const newHeight = Math.min(...nextSuitableHeights);
  mutableConfig.heights[from] = newHeight;

  // console.log(`Relabel (${from}): ${newHeight}`);

  return copy(mutableConfig);
};
