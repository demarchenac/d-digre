import { copy } from "~/lib/helpers";
import type { AddToQueue } from "./types";

export const addToQueue: AddToQueue = (node, config, prefix = "->") => {
  const mutableConfig = copy(config);
  if (mutableConfig.queue.indexOf(node) >= 0) return copy(mutableConfig);

  // console.log(`${prefix} Adding ${node} to the Queue`);
  mutableConfig.queue.push(node);

  return copy(mutableConfig);
};
