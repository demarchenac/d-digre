import { addSTCuts } from "~/lib/helpers";
import { type DirectedGraph } from "~/types";

addEventListener("message", (e: MessageEvent<DirectedGraph>) => {
  const graph = e.data;
  const withCuts = addSTCuts(graph);
  postMessage(withCuts);
});
