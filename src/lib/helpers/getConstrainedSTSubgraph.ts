import { copy } from "./copy";
import { findSourceTargetPaths } from "./findSourceTargetPaths";
import { getEdgesToToggleByPaths } from "./getEdgesToToggleByPaths";

type GetConstrainedSTSubgraphArguments = {
  capacities: number[][];
  source: number;
  target: number;
  maxFlowAlgorithm: (...args: [number[][], number, number]) => {
    maxFlow: number;
    flow: number[][];
  };
};

export function getConstrainedSTSubgraph({
  capacities,
  source,
  target,
  maxFlowAlgorithm,
}: GetConstrainedSTSubgraphArguments) {
  let mutableCapacities = JSON.parse(JSON.stringify(capacities)) as number[][];
  let stMetadata = maxFlowAlgorithm(mutableCapacities, source, target);
  const expectedPaths = stMetadata.maxFlow;

  let stCapacities = stMetadata.flow.map((row) => row.map((flow) => (flow > 0 ? flow : 0)));
  let stAdjacency = stMetadata.flow.map((row) => row.map((flow) => (flow > 0 ? 1 : 0)));
  let stPaths = findSourceTargetPaths(stAdjacency, source, target);

  if (expectedPaths === stPaths.length) return { stMetadata, stCapacities, stAdjacency, stPaths };

  const collisions = getEdgesToToggleByPaths(stPaths, target);
  if (!collisions) {
    console.log("COULD NOT FIND ANY EDGE TO REMOVE");
    return { stMetadata, stCapacities, stAdjacency, stPaths };
  }

  console.log({ paths: stPaths });
  console.log("Collisions to test:", { collisions });

  for (const collision of collisions) {
    const { incidence, bifurcation } = collision;

    let incidenceMetadata: ReturnType<typeof maxFlowAlgorithm> | undefined;
    let bifurcationMetadata: ReturnType<typeof maxFlowAlgorithm> | undefined;
    let mutedCapacities = copy(mutableCapacities);
    if (incidence) {
      const [sToRemove, tToRemove] = incidence;
      mutedCapacities[sToRemove]![tToRemove]! = 0;
      incidenceMetadata = maxFlowAlgorithm(mutedCapacities, source, target);
    }

    mutedCapacities = copy(mutableCapacities);
    if (bifurcation) {
      const [sToRemove, tToRemove] = bifurcation;
      mutedCapacities[sToRemove]![tToRemove]! = 0;
      bifurcationMetadata = maxFlowAlgorithm(mutedCapacities, source, target);
    }

    if (incidenceMetadata?.maxFlow === expectedPaths) {
      stCapacities = incidenceMetadata.flow.map((row) => row.map((flow) => (flow > 0 ? flow : 0)));
      stAdjacency = incidenceMetadata.flow.map((row) => row.map((flow) => (flow > 0 ? 1 : 0)));
      stPaths = findSourceTargetPaths(stAdjacency, source, target);

      if (stPaths.length === expectedPaths)
        return { stMetadata: incidenceMetadata, stCapacities, stAdjacency, stPaths };
    }

    if (bifurcationMetadata?.maxFlow === expectedPaths) {
      stCapacities = bifurcationMetadata.flow.map((row) =>
        row.map((flow) => (flow > 0 ? flow : 0)),
      );
      stAdjacency = bifurcationMetadata.flow.map((row) => row.map((flow) => (flow > 0 ? 1 : 0)));
      stPaths = findSourceTargetPaths(stAdjacency, source, target);

      if (stPaths.length === expectedPaths)
        return { stMetadata: bifurcationMetadata, stCapacities, stAdjacency, stPaths };
    }
  }

  console.log("Everything was futile!");
  return { stMetadata, stCapacities, stAdjacency, stPaths };
  /**
   * If we've got this far, then we need to reduce the maximum flow since no path can be found to
   * match the current maximum flow.
   */
  const { incidence } = collisions.find((collision) => collision.incidence !== undefined) ?? {
    incidence: undefined,
  };

  if (!incidence) {
    alert(`[WRONG MAX FLOW] S: ${source}, T: ${target} => ${stPaths.length}`);
    return { stMetadata, stCapacities, stAdjacency, stPaths };
  }

  console.log("Removing incidence", { incidence });

  const [sToRemove, tToRemove] = incidence;
  stCapacities[sToRemove]![tToRemove]! = 0;

  stMetadata = maxFlowAlgorithm(stCapacities, source, target);
  stCapacities = stMetadata.flow.map((row) => row.map((flow) => (flow > 0 ? flow : 0)));
  stAdjacency = stMetadata.flow.map((row) => row.map((flow) => (flow > 0 ? 1 : 0)));
  stPaths = findSourceTargetPaths(stAdjacency, source, target);

  return { stMetadata, stCapacities, stAdjacency, stPaths };
}
