"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAtom, useStore } from "jotai";
import { Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { TuplePairPattern, AppState, TrimmingMethod, AlgorithmMetadata } from "~/types";
import {
  findSourceTargetPaths,
  getNonRepeatingNodePaths,
  getSourceTargetSolution,
  getVisibleNodeAndLinksFromPaths,
  pushRelabel,
  shuffle,
  zeros,
} from "~/lib/helpers";
import { algorithmAtom, graphAtom, stateAtom } from "~/lib/jotai";
import { getNodesAndLinks } from "~/lib/helpers/getNodesAndLinks";

const nonPermissibleStatus: AppState[] = ["no-graph"];

export function WithAlgorithmControls() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useAtom(stateAtom, { store: useStore() });
  const [graph, setGraph] = useAtom(graphAtom, { store: useStore() });
  const [algorithm, setAlgorithm] = useAtom(algorithmAtom, { store: useStore() });

  if (nonPermissibleStatus.includes(state)) return null;

  const onRunPushRelabel = () => {
    if (!graph) return;

    setIsLoading(true);

    const withPushRelabel = { ...graph };

    let minimalMaximumFlow = Number.POSITIVE_INFINITY;
    let maximalMaximumFlow = 0;

    const shouldMergeWithTrimmed: Record<TuplePairPattern, boolean> = {};

    for (const source of graph.sources) {
      for (const target of graph.targets) {
        const stSolution = getSourceTargetSolution({
          algorithm: pushRelabel,
          capacities: graph.capacities,
          source,
          target,
          targets: graph.targets,
        });

        console.log({ "@": `[raw] - ${source}_${target}`, ...stSolution });
        withPushRelabel.pushRelabel.raw[`raw:${source}_${target}`] = stSolution;

        if (stSolution.maxFlow < minimalMaximumFlow) minimalMaximumFlow = stSolution.maxFlow;
        if (stSolution.maxFlow > maximalMaximumFlow) maximalMaximumFlow = stSolution.maxFlow;
      }
    }

    console.log("-----------------------------");

    let shouldTrimSubgraphs = false;

    for (const raw of Object.entries(withPushRelabel.pushRelabel.raw)) {
      const [signedPair, metadata] = raw;
      const pair = signedPair.replace("raw:", "") as TuplePairPattern;
      shouldMergeWithTrimmed[pair] = false;

      if (minimalMaximumFlow < metadata.maxFlow) {
        shouldTrimSubgraphs = true;
        shouldMergeWithTrimmed[pair] = true;
        const pathsToRemove = metadata.maxFlow - minimalMaximumFlow;

        const removingFirst = Array.from(metadata.paths);
        const removingRandom = shuffle(metadata.paths);
        const removingLongest = Array.from(metadata.paths);
        removingLongest.sort((a, b) => {
          if (a.length > b.length) return -1;
          else if (a.length < b.length) return 1;
          return 0;
        });

        const firstMeta = JSON.parse(JSON.stringify(metadata)) as AlgorithmMetadata;
        const randomMeta = JSON.parse(JSON.stringify(metadata)) as AlgorithmMetadata;
        const longestMeta = JSON.parse(JSON.stringify(metadata)) as AlgorithmMetadata;

        for (let removed = 0; removed < pathsToRemove; removed++) {
          const firstRemoved = removingFirst.shift();
          const randomRemoved = removingRandom.shift();
          const longestRemoved = removingLongest.shift();

          if (firstRemoved) {
            for (let sourceIndex = 0; sourceIndex < firstRemoved.length - 1; sourceIndex++) {
              const targetIndex = sourceIndex + 1;
              const row = firstRemoved[sourceIndex]!;
              const col = firstRemoved[targetIndex]!;
              firstMeta.flow[row]![col] = 0;
              firstMeta.capacities[row]![col] = 0;
              firstMeta.adjacency[row]![col] = 0;
            }
          }

          if (randomRemoved) {
            for (let sourceIndex = 0; sourceIndex < randomRemoved.length - 1; sourceIndex++) {
              const targetIndex = sourceIndex + 1;
              const row = randomRemoved[sourceIndex]!;
              const col = randomRemoved[targetIndex]!;
              randomMeta.flow[row]![col] = 0;
              randomMeta.capacities[row]![col] = 0;
              randomMeta.adjacency[row]![col] = 0;
            }
          }

          if (longestRemoved) {
            for (let sourceIndex = 0; sourceIndex < longestRemoved.length - 1; sourceIndex++) {
              const targetIndex = sourceIndex + 1;
              const row = longestRemoved[sourceIndex]!;
              const col = longestRemoved[targetIndex]!;
              longestMeta.flow[row]![col] = 0;
              longestMeta.capacities[row]![col] = 0;
              longestMeta.adjacency[row]![col] = 0;
            }
          }
        }

        const firstVisibility = getVisibleNodeAndLinksFromPaths(removingFirst);
        const longestVisibility = getVisibleNodeAndLinksFromPaths(removingLongest);
        const randomVisibility = getVisibleNodeAndLinksFromPaths(removingRandom);

        withPushRelabel.pushRelabel.trimmed[`trimmed_first:${pair}`] = {
          ...firstMeta,
          maxFlow: minimalMaximumFlow,
          paths: removingFirst,
          encoders: [],
          visibleNodes: Array.from(firstVisibility.nodes),
          visibleLinks: Array.from(firstVisibility.links),
        };

        withPushRelabel.pushRelabel.trimmed[`trimmed_longest:${pair}`] = {
          ...longestMeta,
          maxFlow: minimalMaximumFlow,
          paths: removingLongest,
          encoders: [],
          visibleNodes: Array.from(longestVisibility.nodes),
          visibleLinks: Array.from(longestVisibility.links),
        };

        withPushRelabel.pushRelabel.trimmed[`trimmed_random:${pair}`] = {
          ...randomMeta,
          maxFlow: minimalMaximumFlow,
          paths: removingRandom,
          encoders: [],
          visibleNodes: Array.from(randomVisibility.nodes),
          visibleLinks: Array.from(randomVisibility.links),
        };

        console.log({
          "@": `[first] - ${pair}`,
          ...withPushRelabel.pushRelabel.trimmed[`trimmed_first:${pair}`],
        });

        console.log({
          "@": `[longest] - ${pair}`,
          ...withPushRelabel.pushRelabel.trimmed[`trimmed_longest:${pair}`],
        });

        console.log({
          "@": `[random] - ${pair}`,
          ...withPushRelabel.pushRelabel.trimmed[`trimmed_random:${pair}`],
        });
      }
    }

    console.log("*****************************");

    const rawMergedCapacity = zeros(graph.adjacency.length).map(() =>
      zeros(graph.adjacency.length),
    );
    const rawMergedFlow = zeros(graph.adjacency.length).map(() => zeros(graph.adjacency.length));

    const rawMergedPaths: string[] = [];

    for (const kindMap of Object.entries(shouldMergeWithTrimmed)) {
      const [pair] = kindMap as [TuplePairPattern, boolean];
      const meta = withPushRelabel.pushRelabel.raw[`raw:${pair}`]!;
      meta.capacities.forEach((row, rowIndex) => {
        row.forEach((capacity, nodeIndex) => {
          rawMergedCapacity[rowIndex]![nodeIndex] = Math.max(
            rawMergedCapacity[rowIndex]![nodeIndex]!,
            capacity,
          );
        });
      });
      meta.flow.forEach((row, rowIndex) => {
        row.forEach((flow, nodeIndex) => {
          rawMergedFlow[rowIndex]![nodeIndex] = Math.max(
            rawMergedFlow[rowIndex]![nodeIndex]!,
            flow,
          );
        });
      });

      meta.paths.forEach((path) => rawMergedPaths.push(path.join("-")));
    }

    const rawMergedAdjacency = rawMergedCapacity.map((row) =>
      row.map((node) => (node > 0 ? 1 : 0)),
    );

    const nonRepeatedPathsForRawMerged = Array.from(new Set(rawMergedPaths)).map((path) =>
      path.split("-").map(Number),
    );

    const visibleLinks: string[] = [];
    for (const path of nonRepeatedPathsForRawMerged) {
      for (let targetIndex = 1; targetIndex < path.length; targetIndex++) {
        const sourceIndex = targetIndex - 1;
        visibleLinks.push(`${path[sourceIndex]}-${path[targetIndex]}`);
      }
    }

    const { nodes: rawMergedNodes } = getNodesAndLinks(rawMergedCapacity);
    const fixedNodes = rawMergedNodes.map((node) => ({
      ...node,
      incoming: node.incoming.filter((incoming) => visibleLinks.includes(`${incoming}-${node.id}`)),
      outgoing: node.outgoing.filter((outgoing) => visibleLinks.includes(`${node.id}-${outgoing}`)),
    }));

    const rawEncoders = fixedNodes
      .filter((node) => node.incoming.length >= 2 && node.outgoing.length > 0)
      .map((node) => node.id);

    const rawMergedVisibility = getVisibleNodeAndLinksFromPaths(nonRepeatedPathsForRawMerged);

    withPushRelabel.pushRelabel.rawMerged = {
      capacities: rawMergedCapacity,
      adjacency: rawMergedAdjacency,
      flow: rawMergedFlow,
      maxFlow: maximalMaximumFlow,
      paths: nonRepeatedPathsForRawMerged,
      nodeCount: rawMergedAdjacency.length,
      targets: Array.from(graph.targets),
      encoders: Array.from(rawEncoders),
      visibleNodes: Array.from(rawMergedVisibility.nodes),
      visibleLinks: Array.from(rawMergedVisibility.links),
    };

    console.log({
      "@": `[raw merged]`,
      ...withPushRelabel.pushRelabel.rawMerged,
    });

    console.log("vvvvvvvvvvvvvvvvvvvvvvvvvvvvv");

    if (shouldTrimSubgraphs) {
      for (const method of ["first", "longest", "random"] as TrimmingMethod[]) {
        const trimmedMergedCapacity = zeros(graph.adjacency.length).map(() =>
          zeros(graph.adjacency.length),
        );
        const trimmedMergedFlow = zeros(graph.adjacency.length).map(() =>
          zeros(graph.adjacency.length),
        );

        const trimmedMergedPaths: string[] = [];

        for (const kindMap of Object.entries(shouldMergeWithTrimmed)) {
          const [pair, shouldUseTrimmed] = kindMap as [TuplePairPattern, boolean];

          const meta = shouldUseTrimmed
            ? withPushRelabel.pushRelabel.trimmed[`trimmed_${method}:${pair}`]!
            : withPushRelabel.pushRelabel.raw[`raw:${pair}`]!;

          meta.capacities.forEach((row, rowIndex) => {
            row.forEach((node, nodeIndex) => {
              trimmedMergedCapacity[rowIndex]![nodeIndex] = Math.max(
                trimmedMergedCapacity[rowIndex]![nodeIndex]!,
                node,
              );
            });
          });
          meta.flow.forEach((row, rowIndex) => {
            row.forEach((node, nodeIndex) => {
              trimmedMergedFlow[rowIndex]![nodeIndex] = Math.max(
                trimmedMergedFlow[rowIndex]![nodeIndex]!,
                node,
              );
            });
          });

          meta.paths.forEach((path) => trimmedMergedPaths.push(path.join("-")));
        }

        const trimmedMergedAdjacency = trimmedMergedCapacity.map((row) =>
          row.map((node) => (node > 0 ? 1 : 0)),
        );

        const nonRepeatedPathsForTrimmedMerged = Array.from(new Set(trimmedMergedPaths)).map(
          (path) => path.split("-").map(Number),
        );

        const { nodes: trimmedMerged } = getNodesAndLinks(trimmedMergedCapacity);
        const trimmedEncoders = trimmedMerged
          .filter((node) => node.incoming.length >= 2 && node.outgoing.length > 0)
          .map((node) => node.id);

        const trimmingMethodVisibility = getVisibleNodeAndLinksFromPaths(
          nonRepeatedPathsForTrimmedMerged,
        );

        withPushRelabel.pushRelabel.trimmedMerged[method] = {
          capacities: trimmedMergedCapacity,
          adjacency: trimmedMergedAdjacency,
          flow: trimmedMergedFlow,
          maxFlow: minimalMaximumFlow,
          paths: nonRepeatedPathsForTrimmedMerged,
          nodeCount: trimmedMergedAdjacency.length,
          targets: Array.from(graph.targets),
          encoders: Array.from(trimmedEncoders),
          visibleNodes: Array.from(trimmingMethodVisibility.nodes),
          visibleLinks: Array.from(trimmingMethodVisibility.links),
        };

        console.log({
          "@": `[merged ${method}]`,
          ...withPushRelabel.pushRelabel.trimmedMerged[method],
        });
      }
    }

    console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");

    setGraph(withPushRelabel);
    setState("ran-algorithm");
    setAlgorithm("push-relabel");
    setIsLoading(false);
    router.push("push-relabel");
  };

  const algorithmIsNotPushRelabel = algorithm !== "push-relabel";

  return (
    <>
      {algorithmIsNotPushRelabel && (
        <Button variant="ghost" onClick={onRunPushRelabel} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Run Push Relabel
        </Button>
      )}
    </>
  );
}
