import type { Node, Graph, Link } from "~/types";
import { range } from "./range";

export async function parseFileToGraph({
  file,
  startsAt1,
}: {
  file?: File;
  startsAt1: boolean;
}): Promise<Graph | undefined> {
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

  const metadata = {
    startsAt1,
    description: lines.at(0) ?? "",
    adjacency: lines.slice(2)?.map((row) => row.split(" ").map(Number)),
  };

  const numberOfVertexes = metadata.adjacency[0]?.length ?? 0;
  const isSquared =
    metadata.adjacency.length === numberOfVertexes &&
    metadata.adjacency.every((weights) => weights.length === numberOfVertexes);

  if (!isSquared) {
    console.error("Graph isn't squared");
    alert("Graph isn't squared");
    return;
  }

  const nodeList = range(0, metadata.adjacency.length);

  const nodes: Node[] = nodeList.map((node) => ({
    id: node,
    outgoing: [],
    incoming: [],
  }));

  const links: Link[] = [];
  nodeList.forEach((source) =>
    nodeList.forEach((target) => {
      const link = { source, target, weight: metadata.adjacency[source]?.[target] ?? 0 };
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

  const graph: Graph = {
    ...metadata,
    renderWeights: false,
    sources,
    targets,
    nodes,
    links,
    stCuts: {},
  };

  console.log({ graph });

  return graph;
}
