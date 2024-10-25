import { copy } from "~/lib/helpers";
import { isActive } from "./isActive";
import { getResidualCapacityOf } from "./getResidualCapacityOf";
import type { CanPush } from "./types";

export const canPush: CanPush = ({ from, to }, config) => {
  const mutableConfig = copy(config);
  const fromIsActive = isActive(from, mutableConfig);

  const residualCapacity = getResidualCapacityOf({ from, to }, mutableConfig);
  const hasResidualCapacity = residualCapacity > 0;

  const heightOfFrom = mutableConfig.heights[from];
  const heightOfTo = mutableConfig.heights[to]!;

  const heightOfToIsBiggerByOne = heightOfFrom === heightOfTo + 1;

  return fromIsActive && hasResidualCapacity && heightOfToIsBiggerByOne;
};
