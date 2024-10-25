import { copy } from "~/lib/helpers";
import { canPush } from "./canPush";
import { doPush } from "./doPush";
import { isActive } from "./isActive";
import { relabel } from "./relabel";
import { relabelBackwards } from "./relabelBackwards";
import type { PushOrRelabel } from "./types";

export const pushOrRelabel: PushOrRelabel = (from, config) => {
  let mutableConfig = copy(config);

  if (!isActive(from, mutableConfig)) return copy(mutableConfig);

  const edges = mutableConfig.edges[from]!;

  let relabelWasMade = false;
  for (const to of edges) {
    const edge = { from, to };
    if (canPush(edge, mutableConfig)) {
      mutableConfig = doPush(edge, mutableConfig);
    } else if (edges.indexOf(to) === edges.length - 1) {
      const relabelMetadata = relabel(from, mutableConfig);
      mutableConfig = copy(relabelMetadata.config);
      if (relabelMetadata.ok) relabelWasMade = true;
    }
  }

  // the only repeatable action is pushing.
  if (relabelWasMade) return copy(mutableConfig);
  if (!isActive(from, mutableConfig)) return copy(mutableConfig);

  const residualEdges = mutableConfig.residualEdges[from]!;

  for (const to of residualEdges) {
    const edge = { from, to };
    if (canPush(edge, mutableConfig)) {
      mutableConfig = doPush(edge, mutableConfig, "'");
    } else if (residualEdges.indexOf(to) === residualEdges.length - 1) {
      const { config } = relabelBackwards(from, mutableConfig);
      mutableConfig = copy(config);
    }
  }

  return copy(mutableConfig);
};
