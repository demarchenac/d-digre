import { copy } from "~/lib/helpers";
import { getResidualCapacityOf } from "./getResidualCapacityOf";
import { isActive } from "./isActive";
import type { CanRelabel } from "./types";

export const canRelabelBackwards: CanRelabel = (from, config) => {
  const mutableConfig = copy(config);

  const fromIsActive = isActive(from, mutableConfig);
  if (!fromIsActive) return false;

  for (const to of mutableConfig.residualEdges[from]!) {
    const residualCapacity = getResidualCapacityOf({ from, to }, mutableConfig);

    const hasResidualCapacity = residualCapacity > 0;
    const isHeightDifferenceAdmissible = mutableConfig.heights[from]! <= mutableConfig.heights[to]!;

    if (hasResidualCapacity && isHeightDifferenceAdmissible) return true;
  }

  return false;
};
