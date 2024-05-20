import { SetHelpers } from "../set";

type Collision = {
  incidence: [number, number] | undefined;
  bifurcation: [number, number] | undefined;
};

type GetEdgeToToggleByPathsMethod = (paths: number[][], target: number) => Collision[] | undefined;

const addToCollisions = (collisions: Collision[], collision: Collision): void => {
  const exists = collisions.some((existing) => {
    if (
      !existing.incidence &&
      !collision.incidence &&
      !existing.bifurcation &&
      !collision.bifurcation
    ) {
      return true;
    }

    if (
      existing.incidence &&
      collision.incidence &&
      existing.incidence.join("-") === collision.incidence.join("-") &&
      !existing.bifurcation &&
      !collision.bifurcation
    ) {
      return true;
    }

    if (
      !existing.incidence &&
      !collision.incidence &&
      existing.bifurcation &&
      collision.bifurcation &&
      existing.bifurcation.join("-") === collision.bifurcation.join("-")
    ) {
      return true;
    }

    if (
      existing.incidence &&
      collision.incidence &&
      existing.incidence.join("-") === collision.incidence.join("-") &&
      existing.bifurcation &&
      collision.bifurcation &&
      existing.bifurcation.join("-") === collision.bifurcation.join("-")
    ) {
      return true;
    }

    return false;
  });

  if (exists) return;

  collisions.push(collision);
};

export const getEdgesToToggleByPaths: GetEdgeToToggleByPathsMethod = (paths, target) => {
  const goodPathsNodes: Set<number>[] = [];
  const goodPathsEdges: Set<string>[] = [];
  const collisions: Collision[] = [];

  for (const path of paths) {
    const edgesOfPath = new Set(
      Array.from(
        path
          .map((vertex, index, pathRef) => [vertex, pathRef?.[index + 1] ?? undefined])
          .filter(([_v, nextVertex]) => nextVertex !== target && Boolean(nextVertex))
          .map((edge) => edge.join("-")),
      ),
    );
    const nodesOfPath = new Set(path.slice(1, path.length - 1));

    const edgeCollision = goodPathsEdges
      .map((goodPathEdges) => SetHelpers.intersection(goodPathEdges, edgesOfPath))
      .filter((intersection) => intersection.size > 0)
      .at(0);

    const nodeCollision = goodPathsNodes
      .map((goodPathNodes) => SetHelpers.intersection(goodPathNodes, nodesOfPath))
      .filter((intersection) => intersection.size > 0)
      .at(0);

    // nothing collides
    if (!edgeCollision && !nodeCollision) {
      goodPathsEdges.push(edgesOfPath);
      goodPathsNodes.push(nodesOfPath);
      continue;
    }

    const edges = Array.from(edgesOfPath);

    // let's handle edge collisions first since if and edge is colliding, a node is also colliding
    if (edgeCollision) {
      // we need to find two edges, the one prior to the collision and the one after the collision
      const collisionList = Array.from(edgeCollision);
      const firstCollision = collisionList.at(0)!;
      const lastCollision = collisionList.at(-1)!;

      const indexOfFirstCollision = edges.indexOf(firstCollision);
      const indexOfLastCollision = edges.indexOf(lastCollision);

      const isFirstCollisionWithSource = indexOfFirstCollision === 0;
      const isLastCollisionWithTarget = indexOfLastCollision === -1;

      // if we're colliding with source and target we can ignore this collision.
      if (isFirstCollisionWithSource && isLastCollisionWithTarget) continue;

      const collision: Collision = { incidence: undefined, bifurcation: undefined };

      // check if the prior edge of the collision is attached to the source.
      if (indexOfFirstCollision - 1 > 0) {
        collision.incidence = edges
          .at(indexOfFirstCollision - 1)!
          .split("-")
          .map(Number) as [number, number];
      }

      // check if the next edge of the collision is attached to the target.
      if (indexOfLastCollision + 1 < edges.length) {
        collision.bifurcation = edges
          .at(indexOfLastCollision + 1)!
          .split("-")
          .map(Number) as [number, number];
      }

      // nothing collides
      if (!collision.incidence && !collision.bifurcation) continue;

      addToCollisions(collisions, collision);
    }

    if (nodeCollision) {
      // there should be only one node collision
      if (nodeCollision.size !== 1) continue;

      const collidedNode = Array.from(nodeCollision).at(0)!;
      const indexOfCollidedNode = path.indexOf(collidedNode);
      const priorNode = path[indexOfCollidedNode - 1]!;
      const nextNode = path[indexOfCollidedNode + 1]!;

      const priorEdge = `${priorNode}-${collidedNode}`;
      const nextEdge = `${collidedNode}-${nextNode}`;

      const indexOfPriorEdge = edges.indexOf(priorEdge);
      const indexOfNextEdge = edges.indexOf(nextEdge);

      const isPriorEdgeSourceEdge = indexOfPriorEdge === 0;
      const isNextEdgeTargetEdge = indexOfNextEdge === -1;

      // if we're colliding with source and target we can ignore this collision.
      if (isPriorEdgeSourceEdge && isNextEdgeTargetEdge) continue;

      const collision: Collision = { incidence: undefined, bifurcation: undefined };

      // check if the prior edge isn't the source edge.
      if (!isPriorEdgeSourceEdge) collision.incidence = [priorNode, collidedNode];

      // check if the next edge isn't the target edge.
      if (!isNextEdgeTargetEdge) collision.bifurcation = [collidedNode, nextNode];

      // nothing collides
      if (!collision.incidence && !collision.bifurcation) continue;

      addToCollisions(collisions, collision);
    }
  }

  return collisions;
};
