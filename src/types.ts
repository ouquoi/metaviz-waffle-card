export type Settings = {
  gridColumns?: number;
  gridRows?: number;
  cellSize?: "auto" | "xs" | "s" | "m" | "l" | "xl";
  cellShape?: "rounded" | "square" | "circle" | "diamond" | "cross" | "star";
  mode?: "percent" | "unit";
  unitsPerCell?: number;
  fillDirection?: "col-bottom-up" | "row-left-right";
  sort?: "value_desc" | "value_asc" | "none";
  minOneCell?: boolean;
  showLegend?: boolean;
  legendValue?: "percent" | "value" | "both";
  // Per-category overrides (indexed by sorted display order, up to 4)
  series_0_color?: string; series_1_color?: string;
  series_2_color?: string; series_3_color?: string;
  series_0_label?: string; series_1_label?: string;
  series_2_label?: string; series_3_label?: string;
};
