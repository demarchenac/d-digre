"use client";

import { useAtomValue, useStore } from "jotai";
import { graphAtom } from "~/lib/jotai";

export default function HomePage() {
  const graph = useAtomValue(graphAtom, { store: useStore() });

  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform text-center">
      {!graph && <p>Please upload your graph</p>}
    </div>
  );
}
