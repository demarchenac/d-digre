"use client";

import { useEffect, useRef, useState } from "react";
import { useAtom, useStore } from "jotai";
import { Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { graphAtom, stateAtom } from "~/lib/jotai";
import { type DirectedGraph } from "~/types";

export function WithGraphControls() {
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useAtom(stateAtom, { store: useStore() });
  const [graph, setGraph] = useAtom(graphAtom, { store: useStore() });
  const worker = useRef<Worker>();

  useEffect(() => {
    worker.current = new Worker(new URL("~/workers/st-cut.worker.ts", import.meta.url));
    worker.current.onmessage = ({ data: withCuts }) => {
      setGraph(withCuts as DirectedGraph);
      setState("with-st-cuts");
      setIsLoading(false);
    };
    return () => {
      worker.current?.terminate();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state !== "with-graph") return null;

  const onComputeSTCutsClick = () => {
    if (!graph) return;

    setIsLoading(true);
    worker.current?.postMessage(graph);
  };

  return (
    <Button variant="ghost" onClick={onComputeSTCutsClick} disabled={isLoading}>
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Compute s-t cuts
    </Button>
  );
}
