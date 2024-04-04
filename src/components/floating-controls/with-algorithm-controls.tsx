"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAtom, useStore } from "jotai";
import { Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { TuplePairPattern, AppState, TrimmingMethod } from "~/types";
import { findSourceTargetPaths, getUniquePaths, pushRelabel, shuffle, zeros } from "~/lib/helpers";
import { algorithmAtom, graphAtom, stateAtom } from "~/lib/jotai";

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
        const pushRelabelMetadata = pushRelabel(graph.capacities, source, target);

        const allPaths = findSourceTargetPaths(graph.adjacency, source, target);
        const paths = getUniquePaths(allPaths, source, target);

        const subgraphCapacities = pushRelabelMetadata.flow.map((row) =>
          row.map((nodeFlow) => (nodeFlow > 0 ? nodeFlow : 0)),
        );

        const subgraphAdjacency = pushRelabelMetadata.flow.map((row) =>
          row.map((nodeFlow) => (nodeFlow > 0 ? 1 : 0)),
        );

        const metadata = {
          ...pushRelabelMetadata,
          paths: paths,
          capacities: subgraphCapacities,
          adjacency: subgraphAdjacency,
          nodeCount: subgraphAdjacency.length,
          targets: Array.from(graph.targets),
        };

        withPushRelabel.pushRelabel.raw[`raw:${source}_${target}`] = metadata;

        if (pushRelabelMetadata.maxFlow < minimalMaximumFlow) {
          minimalMaximumFlow = pushRelabelMetadata.maxFlow;
        }

        if (pushRelabelMetadata.maxFlow > maximalMaximumFlow) {
          maximalMaximumFlow = pushRelabelMetadata.maxFlow;
        }
      }
    }

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

        for (let removed = 0; removed < pathsToRemove; removed++) {
          removingFirst.shift();
          removingRandom.shift();
          removingLongest.shift();
        }

        withPushRelabel.pushRelabel.trimmed[`trimmed_first:${pair}`] = {
          ...metadata,
          maxFlow: minimalMaximumFlow,
          paths: removingFirst,
        };

        withPushRelabel.pushRelabel.trimmed[`trimmed_longest:${pair}`] = {
          ...metadata,
          maxFlow: minimalMaximumFlow,
          paths: removingLongest,
        };

        withPushRelabel.pushRelabel.trimmed[`trimmed_random:${pair}`] = {
          ...metadata,
          maxFlow: minimalMaximumFlow,
          paths: removingRandom,
        };
      }
    }

    const rawMergedCapacity = zeros(graph.adjacency.length).map(() =>
      zeros(graph.adjacency.length),
    );
    const rawMergedFlow = zeros(graph.adjacency.length).map(() => zeros(graph.adjacency.length));

    const rawMergedPaths: string[] = [];

    for (const kindMap of Object.entries(shouldMergeWithTrimmed)) {
      const [pair] = kindMap as [TuplePairPattern, boolean];
      const meta = withPushRelabel.pushRelabel.raw[`raw:${pair}`]!;
      meta.capacities.forEach((row, rowIndex) => {
        row.forEach((node, nodeIndex) => {
          rawMergedCapacity[rowIndex]![nodeIndex] = Math.max(
            rawMergedCapacity[rowIndex]![nodeIndex]!,
            node,
          );
        });
      });
      meta.flow.forEach((row, rowIndex) => {
        row.forEach((node, nodeIndex) => {
          rawMergedFlow[rowIndex]![nodeIndex] = Math.max(
            rawMergedFlow[rowIndex]![nodeIndex]!,
            node,
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

    withPushRelabel.pushRelabel.rawMerged = {
      capacities: rawMergedCapacity,
      adjacency: rawMergedAdjacency,
      flow: rawMergedFlow,
      maxFlow: maximalMaximumFlow,
      paths: nonRepeatedPathsForRawMerged,
      nodeCount: rawMergedAdjacency.length,
      targets: Array.from(graph.targets),
    };

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

        withPushRelabel.pushRelabel.trimmedMerged[method] = {
          capacities: trimmedMergedCapacity,
          adjacency: trimmedMergedAdjacency,
          flow: trimmedMergedFlow,
          maxFlow: minimalMaximumFlow,
          paths: nonRepeatedPathsForTrimmedMerged,
          nodeCount: trimmedMergedAdjacency.length,
          targets: Array.from(graph.targets),
        };
      }
    }

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
