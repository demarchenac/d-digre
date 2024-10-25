import { type AlgorithmMetadata } from "~/types";
import { copy } from "./copy";
import { findSourceTargetPaths } from "./findSourceTargetPaths";
import { getEdgesToToggleByPaths } from "./getEdgesToToggleByPaths";
import { getFixedMetadataByPaths } from "./getFixedMetadataByPaths";
import { getNonRepeatingNodePaths } from "./getNonRepeatingNodePaths";

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
  const mutableCapacities = JSON.parse(JSON.stringify(capacities)) as number[][];
  const stMetadata = maxFlowAlgorithm(mutableCapacities, source, target);
  console.log({ initialRun: copy(stMetadata) });
  const expectedPaths = stMetadata.maxFlow;

  let stCapacities = stMetadata.flow.map((row) => row.map((flow) => (flow > 0 ? flow : 0)));
  let stAdjacency = stMetadata.flow.map((row) => row.map((flow) => (flow > 0 ? 1 : 0)));
  let stPaths = findSourceTargetPaths(stAdjacency, source, target);

  const snapshot = copy({ stMetadata, stCapacities, stAdjacency, stPaths });
  return snapshot;

  if (expectedPaths === stPaths.length) return { stMetadata, stCapacities, stAdjacency, stPaths };

  const collisions = getEdgesToToggleByPaths(stPaths, target);
  if (!collisions) {
    console.log("COULD NOT FIND ANY EDGE TO REMOVE");
    return { stMetadata, stCapacities, stAdjacency, stPaths };
  }

  console.log({ paths: stPaths });
  console.log("Collisions to test:", { collisions });

  for (const collision of collisions!) {
    const { incidence, bifurcation } = collision;

    let incidenceMetadata: ReturnType<typeof maxFlowAlgorithm> | undefined;
    let bifurcationMetadata: ReturnType<typeof maxFlowAlgorithm> | undefined;
    let sharedMetadata: ReturnType<typeof maxFlowAlgorithm> | undefined;
    let mutedCapacities = copy(mutableCapacities);
    if (incidence) {
      const [sToRemove, tToRemove] = incidence!;
      mutedCapacities[sToRemove]![tToRemove] = 0;
      incidenceMetadata = maxFlowAlgorithm(mutedCapacities, source, target);
    }

    mutedCapacities = copy(mutableCapacities);
    if (bifurcation) {
      const [sToRemove, tToRemove] = bifurcation!;
      mutedCapacities[sToRemove]![tToRemove] = 0;
      bifurcationMetadata = maxFlowAlgorithm(mutedCapacities, source, target);
    }

    mutedCapacities = copy(mutableCapacities);
    if (incidence && bifurcation) {
      const [sInToRemove, tInToRemove] = incidence!;
      const [sBiToRemove, tBiToRemove] = bifurcation!;
      mutedCapacities[sInToRemove]![tInToRemove] = 0;
      mutedCapacities[sBiToRemove]![tBiToRemove] = 0;
      sharedMetadata = maxFlowAlgorithm(mutedCapacities, source, target);
    }

    if (incidenceMetadata?.maxFlow === expectedPaths) {
      stCapacities = incidenceMetadata!.flow.map((row) => row.map((flow) => (flow > 0 ? flow : 0)));
      stAdjacency = incidenceMetadata!.flow.map((row) => row.map((flow) => (flow > 0 ? 1 : 0)));
      stPaths = findSourceTargetPaths(stAdjacency, source, target);

      if (stPaths.length === expectedPaths)
        return { stMetadata: incidenceMetadata, stCapacities, stAdjacency, stPaths };
    }

    if (bifurcationMetadata?.maxFlow === expectedPaths) {
      stCapacities = bifurcationMetadata!.flow.map((row) =>
        row.map((flow) => (flow > 0 ? flow : 0)),
      );
      stAdjacency = bifurcationMetadata!.flow.map((row) => row.map((flow) => (flow > 0 ? 1 : 0)));
      stPaths = findSourceTargetPaths(stAdjacency, source, target);

      if (stPaths.length === expectedPaths)
        return { stMetadata: bifurcationMetadata, stCapacities, stAdjacency, stPaths };
    }

    if (sharedMetadata?.maxFlow === expectedPaths) {
      stCapacities = sharedMetadata!.flow.map((row) => row.map((flow) => (flow > 0 ? flow : 0)));
      stAdjacency = sharedMetadata!.flow.map((row) => row.map((flow) => (flow > 0 ? 1 : 0)));
      stPaths = findSourceTargetPaths(stAdjacency, source, target);

      if (stPaths.length === expectedPaths)
        return { stMetadata: sharedMetadata, stCapacities, stAdjacency, stPaths };
    }
  }

  /**
   * We could try block source or target edges.
   */
  stCapacities = snapshot.stCapacities;
  const sourceCollisions = stCapacities[source]!.map((w, i) => ({ w, i }))
    .filter(({ w }) => w > 0)
    .map(({ i }) => [source, i]);
  const targetCollisions = stCapacities
    .map((row, i) => ({ row, i }))
    .filter(({ row }) => row[target]! > 0)
    .map(({ i }) => [i, target]);

  const borderCollisions = sourceCollisions.concat(targetCollisions);

  console.log("Checking borders: ", { borderCollisions });

  const collisionSolutions: ReturnType<typeof maxFlowAlgorithm>[] = [];
  let maxFlow = 0;

  for (const collision of borderCollisions) {
    const mutedCapacities = copy(snapshot.stCapacities);
    const [sToRemove, tToRemove] = collision;
    mutedCapacities[sToRemove!]![tToRemove!] = 0;
    const collisionMetadata = maxFlowAlgorithm(mutedCapacities, source, target);

    if (collisionMetadata.maxFlow > maxFlow) {
      maxFlow = collisionMetadata.maxFlow;
      collisionSolutions.unshift(collisionMetadata);
    } else {
      collisionSolutions.push(collisionMetadata);
    }
  }

  console.log(copy({ expectedPaths, collisionSolutions }));

  // there's a possibility that the max flow get's reduced by one.
  if (collisionSolutions.at(0)!.maxFlow <= expectedPaths) {
    stCapacities = collisionSolutions
      .at(0)!
      .flow.map((row) => row.map((flow) => (flow > 0 ? flow : 0)));
    stAdjacency = collisionSolutions
      .at(0)!
      .flow.map((row) => row.map((flow) => (flow > 0 ? 1 : 0)));
    stPaths = findSourceTargetPaths(stAdjacency, source, target);

    if (stPaths.length <= expectedPaths)
      return { stMetadata: collisionSolutions.at(0)!, stCapacities, stAdjacency, stPaths };
  }

  console.log("Everything was futile!");

  const metadata = {
    adjacency: snapshot.stAdjacency,
    flow: snapshot.stMetadata.flow,
    maxFlow: snapshot.stMetadata.maxFlow,
    paths: getNonRepeatingNodePaths(Array.from(snapshot.stPaths), source, target),
  } as AlgorithmMetadata;

  console.log({ initialPaths: snapshot.stPaths, uniquePaths: metadata.paths });

  const fixedByUniquePaths = getFixedMetadataByPaths(metadata);

  // return {
  //   stMetadata: { maxFlow: fixedByUniquePaths.maxFlow, flow: fixedByUniquePaths.flow },
  //   stCapacities: fixedByUniquePaths.capacities,
  //   stAdjacency: fixedByUniquePaths.adjacency,
  //   stPaths: fixedByUniquePaths.paths,
  // };

  // /**
  //  * This below here doesn't work well :(
  //  */
  return snapshot;

  // /**
  //  * If we've got this far, then we need to reduce the maximum flow since no path can be found to
  //  * match the current maximum flow.
  //  */
  // const { incidence } = collisions.find((collision) => collision.incidence !== undefined) ?? {
  //   incidence: undefined,
  // };
  // if (!incidence) {
  //   const { bifurcation } = collisions.at(-1)!;
  //   console.log("Removing bifurcation", { bifurcation });

  //   const [sToRemove, tToRemove] = bifurcation!;
  //   stCapacities[sToRemove]![tToRemove]! = 0;

  //   stMetadata = maxFlowAlgorithm(stCapacities, source, target);
  //   stCapacities = stMetadata.flow.map((row) => row.map((flow) => (flow > 0 ? flow : 0)));
  //   stAdjacency = stMetadata.flow.map((row) => row.map((flow) => (flow > 0 ? 1 : 0)));
  //   stPaths = findSourceTargetPaths(stAdjacency, source, target);

  //   return { stMetadata, stCapacities, stAdjacency, stPaths };
  // }

  // console.log("Removing incidence", { incidence });

  // const [sToRemove, tToRemove] = incidence;
  // stCapacities[sToRemove]![tToRemove]! = 0;

  // stMetadata = maxFlowAlgorithm(stCapacities, source, target);
  // stCapacities = stMetadata.flow.map((row) => row.map((flow) => (flow > 0 ? flow : 0)));
  // stAdjacency = stMetadata.flow.map((row) => row.map((flow) => (flow > 0 ? 1 : 0)));
  // stPaths = findSourceTargetPaths(stAdjacency, source, target);

  // return { stMetadata, stCapacities, stAdjacency, stPaths };
}
