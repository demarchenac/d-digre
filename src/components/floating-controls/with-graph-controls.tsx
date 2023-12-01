"use client";

import { useAtom, useStore } from "jotai";
import { Button } from "~/components/ui/button";
import { addSTCuts } from "~/lib/helpers";
import { graphAtom, stateAtom } from "~/lib/jotai";

export function WithGraphControls() {
  const [state, setState] = useAtom(stateAtom, { store: useStore() });
  const [graph, setGraph] = useAtom(graphAtom, { store: useStore() });
  if (state !== "with-graph") return null;

  const onComputeSTCutsClick = () => {
    if (!graph) return;

    setGraph(addSTCuts(graph));
    setState("with-st-cuts");
  };

  return (
    <Button variant="ghost" onClick={onComputeSTCutsClick}>
      Compute s-t cuts
    </Button>
  );
}
