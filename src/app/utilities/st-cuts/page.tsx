"use client";

import { useAtomValue } from "jotai";
import { DirectedGraph } from "~/components/d3/directed-graph";
import { graphAtom } from "~/lib/jotai";

export default function STCutsPage() {
  const graph = useAtomValue(graphAtom);

  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform text-center">
      {!graph && <p>Please upload your graph</p>}
      {graph && <DirectedGraph data={graph} />}
    </div>
  );
}
