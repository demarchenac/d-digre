import type { DirectedNode, DirectedGraph, Link } from "~/types";
import { range } from "./range";
import { findSourceTargetPaths } from "./findSourceTargetPaths";
import { zeros } from "./zeros";

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

  let contents = await file.text();

  if (contents.startsWith("\r\n")) {
    contents = contents.replace("\r\n", "Untitled Graph\r\n");
  }

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
    shouldRender: true,
    height: 0,
    depth: 0,
    maxDepth: 0,
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
        from: source,
        to: target,
        weight: metadata.capacities[source]?.[target] ?? 0,
        isSelected: false,
        shouldRender: true,
      };
      if (link.weight > 0) links.push(link);
    }),
  );

  links.forEach(({ from: source, to: target }) => {
    nodes[source]?.outgoing.push(target);
    nodes[target]?.incoming.push(source);
  });

  const sources = nodes
    .map(({ id, incoming }) => (incoming.length === 0 ? id : null))
    .filter((id) => id !== null) as number[];

  // compute heights
  nodes.forEach(({ id }) => {
    if (sources.includes(id)) return;

    const node = nodes[id];
    if (!node) return;

    let longest: number[] = [];

    for (const source of sources) {
      const paths = findSourceTargetPaths(metadata.adjacency, source, node.id);
      paths.sort((a, b) => {
        if (a.length > b.length) return -1;
        else if (a.length < b.length) return 1;
        return 0;
      });

      const longestPath = paths.at(0);

      if (!longestPath) continue;
      if (longestPath.length < longest.length) continue;

      longest = Array.from(longestPath);
    }

    node.height = longest.length - 1;
  });

  const heights = Array.from(new Set(nodes.map((n) => n.height))).sort();
  const depths = zeros(heights.length);

  // enumerate nodes per level with computed depth and keep track of maxDepth per level
  heights.forEach((height) => {
    let depth = 0;
    const levelNodes = nodes.filter((node) => node.height === height);
    levelNodes.forEach(({ id }, index) => {
      const node = nodes[id];
      if (!node) return;

      node.depth = depth;

      if (index === levelNodes.length - 1) depths[height] = depth;

      depth++;
    });
  });

  // set maxDepth for each node at its corresponding level
  heights.forEach((height) => {
    const levelNodes = nodes.filter((node) => node.height === height);
    levelNodes.forEach(({ id }) => {
      const node = nodes[id];
      if (!node) return;
      node.maxDepth = depths[height] ?? 0;
    });
  });

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
    maxDepth: Math.max(...depths),
    renderWeights: false,
    sources,
    targets,
    nodes,
    links,
    pushRelabel: { raw: {}, trimmed: {}, trimmedMerged: {} },
  };

  return graph;
}
