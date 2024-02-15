import { zeros } from "./zeros";

function push(
  capacities: number[][],
  flow: number[][],
  excess: number[],
  u: number,
  v: number,
): void {
  const send: number = Math.min(excess[u]!, capacities[u]![v]! - flow[u]![v]!);
  flow[u]![v] += send;
  flow[v]![u] -= send;
  excess[u] -= send;
  excess[v] += send;
}

function relabel(capacities: number[][], flow: number[][], height: number[], u: number): void {
  let v: number;
  let min_height: number = Number.POSITIVE_INFINITY;

  for (v = 0; v < capacities.length; v++) {
    if (capacities[u]![v]! - flow[u]![v]! > 0) {
      min_height = Math.min(min_height, height[v]!);
      height[u] = min_height + 1;
    }
  }
}

function discharge(
  capacities: number[][],
  flow: number[][],
  excess: number[],
  height: number[],
  seen: number[],
  u: number,
): void {
  while (excess[u]! > 0) {
    if (seen[u]! < capacities.length) {
      const v: number = seen[u]!;
      if (capacities[u]![v]! - flow[u]![v]! > 0 && height[u]! > height[v]!) {
        push(capacities, flow, excess, u, v);
      } else {
        seen[u] += 1;
      }
    } else {
      relabel(capacities, flow, height, u);
      seen[u] = 0;
    }
  }
}

function moveToFront(i: number, A: number[]): void {
  const temp: number = A[i]!;
  let n: number;

  for (n = i; n > 0; n--) {
    A[n] = A[n - 1]!;
  }

  A[0] = temp;
}

export function pushRelabel(
  capacities: number[][],
  source: number,
  sink: number,
): { maxFlow: number; flow: number[][] } {
  const flow: number[][] = zeros(capacities.length).map(() => zeros(capacities.length));
  const excess: number[] = zeros(capacities.length);
  const height: number[] = zeros(capacities.length);
  const seen: number[] = zeros(capacities.length);

  const list: number[] = new Array(capacities.length - 2).fill(0).map((_, index) => index + 1);

  for (let i = 0, p = 0; i < capacities.length; i++) {
    if (i != source && i != sink) {
      list[p] = i;
      p++;
    }
  }

  height[source] = capacities.length;
  excess[source] = Number.POSITIVE_INFINITY;

  for (let i = 0; i < capacities.length; i++) {
    push(capacities, flow, excess, source, i);
  }

  let p = 0;

  const iterations = [
    {
      flow: flow.map((row) => row.map((v) => v)),
      excess: [...excess],
      height: [...height],
      seen: [...seen],
      p,
    },
  ];

  while (p < capacities.length - 2) {
    const u: number = list[p]!;
    const old_height: number = height[u]!;
    discharge(capacities, flow, excess, height, seen, u);

    if (height[u]! > old_height) {
      moveToFront(p, list);
      p = 0;
    } else {
      p += 1;
    }
    iterations.push({
      flow: flow.map((row) => row.map((v) => v)),
      excess: [...excess],
      height: [...height],
      seen: [...seen],
      p,
    });
  }

  let maxFlow = 0;

  for (let i = 0; i < capacities.length; i++) {
    maxFlow += flow[source]![i]!;
  }

  const printable = iterations.map(({ excess, flow, height, seen, p }) => ({
    excess: excess.join(", "),
    flow: flow.map((row) => row.join(", ")).join("\n"),
    height: height.join(", "),
    seen: seen.join(", "),
    p,
  }));

  // console.table(printable);

  return { maxFlow, flow };
}
