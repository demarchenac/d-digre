import { scaleOrdinal } from "d3";
import { type DirectedNode } from "~/types";

export const strokeWidth = 2;
export const radius = 15;

export const colors = {
  source: { fill: "!fill-sky-500", stroke: "!stroke-sky-500" },
  target: { fill: "!fill-green-500", stroke: "!stroke-green-500" },
  encoder: { fill: "!fill-indigo-500", stroke: "!fill-indigo-500" },
  default: { fill: "fill-slate-800", stroke: "stroke-slate-800" },
  disabled: { fill: "fill-slate-700", stroke: "stroke-slate-700" },
  highlight: {
    node: { fill: "fill-amber-600" },
    edge: { fill: "fill-amber-800", stroke: "stroke-amber-800" },
  },
};

export const colorId = {
  source: 1,
  default: 2,
  target: 3,
  disabled: 4,
  encoder: 5,
} as const;

export const color = scaleOrdinal(
  [colorId.source, colorId.default, colorId.target, colorId.disabled, colorId.encoder],
  [
    colors.source.fill,
    colors.default.fill,
    colors.target.fill,
    colors.disabled.fill,
    colors.encoder.fill,
  ],
);

export const getNodeColor = (node: DirectedNode) => {
  if (!node.shouldRender) return colorId.disabled;
  if (node.isEncoder) return colorId.encoder;
  if (!node.set) return colorId.default;
  return node.set;
};
