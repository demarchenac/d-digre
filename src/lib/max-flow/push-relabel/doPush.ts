import { copy } from "~/lib/helpers";
import { getResidualCapacityOf } from "./getResidualCapacityOf";
import type { DoPush } from "./types";

export const doPush: DoPush = ({ from, to }, config, decorator = "") => {
  const mutableConfig = copy(config);
  const residualCapacity = getResidualCapacityOf({ from, to }, mutableConfig);

  const pushableUnits = Math.min(mutableConfig.excesses[from]!, residualCapacity);

  // console.log(`Push${decorator} (${from},  ${to}): ${pushableUnits}`);

  mutableConfig.flow[from]![to] += pushableUnits;
  mutableConfig.flow[to]![from] -= pushableUnits;

  mutableConfig.excesses[from] -= pushableUnits;
  mutableConfig.excesses[to] += pushableUnits;

  return copy(mutableConfig);
};
