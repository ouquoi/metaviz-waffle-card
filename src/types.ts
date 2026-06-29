export type Settings = {
  gridColumns?: number;
  gridRows?: number;
  mode?: "percent" | "unit";
  unitsPerCell?: number;
  fillDirection?: "col-bottom-up" | "row-left-right";
  sort?: "value_desc" | "value_asc" | "none";
  minOneCell?: boolean;
  showLegend?: boolean;
  legendValue?: "percent" | "value" | "both";
};
