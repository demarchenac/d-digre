"use client";

import { useState } from "react";
import { useAtom, useSetAtom, useStore } from "jotai";
import { Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { algorithmAtom, graphAtom, stateAtom } from "~/lib/jotai";
import { pushRelabel } from "~/lib/helpers/pushRelabel";
import { useRouter } from "next/navigation";
import { type AppState } from "~/types";
import { findSourceTargetPaths } from "~/lib/helpers/findSourceTargetPaths";
import { zeros } from "~/lib/helpers/zeros";

const nonPermissibleStatus: AppState[] = ["no-graph"];

export function WithGraphControls() {
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

    for (const source of graph.sources) {
      for (const target of graph.targets) {
        const pushRelabelMetadata = pushRelabel(graph.capacities, source, target);

        const paths = findSourceTargetPaths(graph.adjacency, source, target);

        let usedNodes: number[] = [];
        const pathsWithoutRepeatingNode = [];
        for (const path of paths) {
          const hasRepeatedNode = path
            .filter((node) => node !== source && node !== target)
            .some((node) => usedNodes.includes(node));

          if (hasRepeatedNode) continue;

          usedNodes = usedNodes.concat(path);
          pathsWithoutRepeatingNode.push(path);
        }

        const capacities = pushRelabelMetadata.flow.map((row) =>
          row.map((nodeFlow) => (nodeFlow > 0 ? nodeFlow : 0)),
        );

        const adjacency = pushRelabelMetadata.flow.map((row) =>
          row.map((nodeFlow) => (nodeFlow > 0 ? 1 : 0)),
        );

        withPushRelabel.pushRelabel[`${source}_${target}`] = {
          ...pushRelabelMetadata,
          paths: pathsWithoutRepeatingNode,
          capacities,
          adjacency,
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
