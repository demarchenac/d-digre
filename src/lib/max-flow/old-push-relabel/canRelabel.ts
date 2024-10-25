import { copy } from "~/lib/helpers";
import { canPush } from "./canPush";
import { canRelabelBackwards } from "./canRelabelBackwards";
import { getResidualCapacityOf } from "./getResidualCapacityOf";
import { isActive } from "./isActive";
import type { CanRelabel } from "./types";

export const canRelabel: CanRelabel = (from, config) => {
  const mutableConfig = copy(config);

  const fromIsActive = isActive(from, mutableConfig);
  if (!fromIsActive) return false;

  let newResidualHeight: number | undefined = undefined;
  const existsResidualRelabel = canRelabelBackwards(from, config);

  if (existsResidualRelabel) {
    const incrementedResidualHeights = config.residualEdges[from]!.filter(
      (to) => mutableConfig.flow[from]![to]! < 0,
    ).map((to) => mutableConfig.heights[to]! + 1);

    newResidualHeight = Math.min(...incrementedResidualHeights);
  }

  const canDoReversePush = config.residualEdges[from]!.filter(
    (to) => mutableConfig.flow[from]![to]! < 0,
  ).some((to) => canPush({ from, to }, mutableConfig));

  if (canDoReversePush) return false;

  for (const to of mutableConfig.edges[from]!) {
    const residualCapacity = getResidualCapacityOf({ from, to }, mutableConfig);
    const hasResidualCapacity = residualCapacity > 0;

    if (hasResidualCapacity) {
      if (!newResidualHeight) return true;

      const newHeight = mutableConfig.heights[to]! + 1;
      if (newHeight <= newResidualHeight) return true;
    }
  }

  return false;
};
