import { discharge } from "./discharge";
import { initialize } from "./initialize";
import type { PushRelabel } from "./types";

export const pushRelabel: PushRelabel = (capacities, source, target) => {
  let config = initialize(capacities, source, target);

  // console.log("Edges");
  // console.table(config.edges);
  // console.log("---------------------");
  // console.log("Edges'");
  // console.table(config.residualEdges);
  // console.log("---------------------");

  // console.log("Queue", config.queue.join(", "));
  // console.log("H:", config.heights.join(" "));

  // console.log("---------------------");

  while (config.queue.length > 0) {
    config = discharge(config);
    //console.log("  H:", config.heights.join(" "));
    //console.log("  Q:", config.queue.join(" "));

    // console.log("---------------------");
  }

  return {
    ...config,
    maxFlow: config.flow.reduce((sum, _, row) => sum + config.flow[row]![target]!, 0),
  };
};
