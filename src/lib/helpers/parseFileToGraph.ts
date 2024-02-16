import type { DirectedNode, DirectedGraph, Link } from "~/types";
import { range } from "./range";

export async function parseFileToGraph({
  file,
  startsAt1,
}: {
  file?: File;
  startsAt1: boolean;
}): Promise<DirectedGraph | undefined> {
  if (!file) {
    console.error("Expected a file to parse");
    alert("Expected a file to parse");
    return;
  }

  const contents = await file.text();
  const lines = contents
    .split(/\n/g)
    .map((line) => line.replace(/\r/, "").trim().replace(/\s+/g, " "))
    .filter((line) => line.trim().length > 0);

  const capacities = lines.slice(2)?.map((row) => row.split(" ").map(Number));

  const metadata = {
    startsAt1: startsAt1 ?? false,
    description: lines.at(0) ?? "",
    capacities,
    adjacency: capacities.map((row) => row.map((node) => (node > 0 ? 1 : 0))),
  };

  const numberOfVertexes = metadata.capacities[0]?.length ?? 0;
  const isSquared =
    metadata.capacities.length === numberOfVertexes &&
    metadata.capacities.every((weights) => weights.length === numberOfVertexes);

  if (!isSquared) {
    console.error("Graph isn't squared");
    alert("Graph isn't squared");
    return;
  }

  const nodeList = range(0, metadata.capacities.length);

  const nodes: DirectedNode[] = nodeList.map((node) => ({
    isSelected: false,
    id: node,
    outgoing: [],
    incoming: [],
  }));

  const links: Link[] = [];
  nodeList.forEach((source) =>
    nodeList.forEach((target) => {
      const link = {
        source,
        target,
        weight: metadata.capacities[source]?.[target] ?? 0,
        isSelected: false,
      };
      if (link.weight > 0) links.push(link);
    }),
  );

  links.forEach(({ source, target }) => {
    nodes[source]?.outgoing.push(target);
    nodes[target]?.incoming.push(source);
  });

  const sources = nodes
    .map(({ id, incoming }) => (incoming.length === 0 ? id : null))
    .filter((id) => id !== null) as number[];

  const targets = nodes
    .map(({ id, outgoing }) => (outgoing.length === 0 ? id : null))
    .filter((id) => id !== null) as number[];

  nodes.forEach(({ id }) => {
    const node = nodes[id];
    if (!node) return;

    const isSource = sources.includes(id);
    const isTarget = targets.includes(id);

    if (!isSource && !isTarget) node.set = 2;
    else if (isSource) node.set = 1;
    else if (isTarget) node.set = 3;
  });

  const graph: DirectedGraph = {
    ...metadata,
    renderWeights: false,
    sources,
    targets,
    nodes,
    links,
    pushRelabel: {},
  };

  return graph;
}
