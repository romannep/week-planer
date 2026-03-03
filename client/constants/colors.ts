export const CONTEXT_COLORS = [
  "#e57373",
  "#f06292",
  "#ba68c8",
  "#7986cb",
  "#64b5f6",
  "#4dd0e1",
  "#81c784",
  "#aed581",
  "#dce775",
  "#ffb74d",
  "#ff8a65",
] as const;

export type ContextColor = (typeof CONTEXT_COLORS)[number];
