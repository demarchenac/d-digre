import { copy } from "~/lib/helpers";
import { addToQueue } from "./addToQueue";
import { isActive } from "./isActive";
import { pushOrRelabel } from "./pushOrRelabel";
import type { Discharge } from "./types";

export const discharge: Discharge = (config) => {
  let mutableConfig = copy(config);

  const from = mutableConfig.queue.shift();
  // console.log("Active node:", from);
  if (!from) return copy(mutableConfig);

  const initialHeight = mutableConfig.heights[from]!;
  let mutableHeight = mutableConfig.heights[from]!;

  while (mutableConfig.excesses[from]! > 0 && Math.abs(initialHeight - mutableHeight) === 0) {
    mutableConfig = pushOrRelabel(from, mutableConfig);
    mutableHeight = mutableConfig.heights[from]!;

    for (const to of mutableConfig.edges[from]!)
      if (isActive(to, mutableConfig)) mutableConfig = addToQueue(to, mutableConfig);

    for (const to of mutableConfig.residualEdges[from]!)
      if (isActive(to, mutableConfig)) mutableConfig = addToQueue(to, mutableConfig, "->'");
  }

  if (isActive(from, mutableConfig)) mutableConfig = addToQueue(from, mutableConfig, "*");

  return copy(mutableConfig);
};
