import type { GetResidualCapacityOf } from "./types";

export const getResidualCapacityOf: GetResidualCapacityOf = ({ from, to }, { capacities, flow }) =>
  capacities[from]![to]! - flow[from]![to]!;
