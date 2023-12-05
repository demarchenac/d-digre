import { useAtomValue, useStore } from "jotai";
import { graphAtom, stateAtom } from "~/lib/jotai";

export function WithPlaybackControls() {
  const state = useAtomValue(stateAtom, { store: useStore() });
  const graph = useAtomValue(graphAtom, { store: useStore() });

  if (state !== "with-st-cuts") return null;
  if (!graph) return null;

  return <p>Here goes the playback controls</p>;
}
