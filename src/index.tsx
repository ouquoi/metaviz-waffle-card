import { type CreateCustomVisualization, defineConfig } from "@metabase/custom-viz";
import { WaffleChart } from "./WaffleChart";
import type { Settings } from "./types";
import { isNumericCol } from "./utils";

const COLORS = [
  "#509EE3", "#88BF4D", "#F9CF48", "#EF8C8C", "#98D9D9",
  "#7172AD", "#F2A86F", "#4C5773", "#A989C5", "#EDA1D5",
];

// Returns the number of data rows — used to show/hide per-series settings.
// getHidden receives (settings, extra) where extra.series is the raw series array,
// or falls back to treating the first arg as a series array (older Metabase builds).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function seriesCount(s: any, extra?: any): number {
  const rows =
    extra?.series?.[0]?.data?.rows ??
    extra?.rawSeries?.[0]?.data?.rows ??
    s?.[0]?.data?.rows;
  return rows?.length ?? 0;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDef = any;

const createVisualization: CreateCustomVisualization<Settings> = ({
  defineSetting,
}) => {
  // Wrapper that bypasses SDK types to allow getHidden (supported at runtime
  // in Metabase but absent from @metabase/custom-viz type definitions).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ds = (def: AnyDef) => (defineSetting as any)(def);

  return defineConfig<Settings>({
    id: "waffle-chart",
    getName: () => "Waffle Chart",
    minSize: { width: 3, height: 3 },
    defaultSize: { width: 6, height: 4 },

    checkRenderable(series) {
      if (!series || series.length === 0) {
        throw new Error("Select a dimension and a metric");
      }
      const data = series[0]?.data;
      if (!data) {
        throw new Error("Select a dimension and a metric");
      }
      const cols = data.cols;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hasDimension = (cols as any[]).some((c) => !isNumericCol(c));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hasMetric = (cols as any[]).some((c) => isNumericCol(c));
      if (!hasDimension || !hasMetric) {
        throw new Error("Select a dimension and a metric");
      }
    },

    settings: {
      gridColumns: defineSetting({
        id: "gridColumns",
        title: "Columns",
        widget: "number",
        getDefault() { return 20; },
      }),
      gridRows: defineSetting({
        id: "gridRows",
        title: "Rows",
        widget: "number",
        getDefault() { return 5; },
      }),
      cellShape: defineSetting({
        id: "cellShape",
        title: "Cell shape",
        widget: "select",
        getDefault() { return "rounded"; },
        getProps() {
          return {
            options: [
              { name: "Rounded square", value: "rounded" },
              { name: "Square", value: "square" },
              { name: "Circle", value: "circle" },
              { name: "Diamond", value: "diamond" },
              { name: "Cross", value: "cross" },
              { name: "Star", value: "star" },
            ],
          };
        },
      }),
      cellSize: defineSetting({
        id: "cellSize",
        title: "Cell size",
        widget: "select",
        getDefault() { return "auto"; },
        getProps() {
          return {
            options: [
              { name: "Auto (fill card)", value: "auto" },
              { name: "XS — 8 px", value: "xs" },
              { name: "S — 12 px", value: "s" },
              { name: "M — 18 px", value: "m" },
              { name: "L — 26 px", value: "l" },
              { name: "XL — 36 px", value: "xl" },
            ],
          };
        },
      }),
      mode: defineSetting({
        id: "mode",
        title: "Mode",
        widget: "select",
        getDefault() { return "percent"; },
        getProps() {
          return {
            options: [
              { name: "Percent (1 cell = 1%)", value: "percent" },
              { name: "Unit (N units per cell)", value: "unit" },
            ],
          };
        },
      }),
      unitsPerCell: defineSetting({
        id: "unitsPerCell",
        title: "Units per cell",
        widget: "number",
        getDefault() { return 1; },
      }),
      fillDirection: defineSetting({
        id: "fillDirection",
        title: "Fill direction",
        widget: "select",
        getDefault() { return "row-left-right"; },
        getProps() {
          return {
            options: [
              { name: "Row, left to right", value: "row-left-right" },
              { name: "Column, bottom to top", value: "col-bottom-up" },
            ],
          };
        },
      }),
      sort: defineSetting({
        id: "sort",
        title: "Sort",
        widget: "select",
        getDefault() { return "value_desc"; },
        getProps() {
          return {
            options: [
              { name: "Value descending", value: "value_desc" },
              { name: "Value ascending", value: "value_asc" },
              { name: "Original order", value: "none" },
            ],
          };
        },
      }),
      minOneCell: defineSetting({
        id: "minOneCell",
        title: "Minimum 1 cell per category",
        widget: "toggle",
        getDefault() { return true; },
      }),
      showLegend: defineSetting({
        id: "showLegend",
        title: "Show legend",
        widget: "toggle",
        getDefault() { return true; },
      }),
      legendValue: defineSetting({
        id: "legendValue",
        title: "Legend value",
        widget: "select",
        getDefault() { return "percent"; },
        getProps() {
          return {
            options: [
              { name: "Percent", value: "percent" },
              { name: "Value", value: "value" },
              { name: "Both", value: "both" },
            ],
          };
        },
      }),

      // Per-series color overrides — shown only when the series exists in the data
      series_0_color: ds({ id: "series_0_color", title: "Series 1 — Color", widget: "color", getDefault() { return COLORS[0]; }, getHidden(s: any, e?: any) { return seriesCount(s, e) < 1; } }),
      series_1_color: ds({ id: "series_1_color", title: "Series 2 — Color", widget: "color", getDefault() { return COLORS[1]; }, getHidden(s: any, e?: any) { return seriesCount(s, e) < 2; } }),
      series_2_color: ds({ id: "series_2_color", title: "Series 3 — Color", widget: "color", getDefault() { return COLORS[2]; }, getHidden(s: any, e?: any) { return seriesCount(s, e) < 3; } }),
      series_3_color: ds({ id: "series_3_color", title: "Series 4 — Color", widget: "color", getDefault() { return COLORS[3]; }, getHidden(s: any, e?: any) { return seriesCount(s, e) < 4; } }),
      series_4_color: ds({ id: "series_4_color", title: "Series 5 — Color", widget: "color", getDefault() { return COLORS[4]; }, getHidden(s: any, e?: any) { return seriesCount(s, e) < 5; } }),
      series_5_color: ds({ id: "series_5_color", title: "Series 6 — Color", widget: "color", getDefault() { return COLORS[5]; }, getHidden(s: any, e?: any) { return seriesCount(s, e) < 6; } }),
      series_6_color: ds({ id: "series_6_color", title: "Series 7 — Color", widget: "color", getDefault() { return COLORS[6]; }, getHidden(s: any, e?: any) { return seriesCount(s, e) < 7; } }),
      series_7_color: ds({ id: "series_7_color", title: "Series 8 — Color", widget: "color", getDefault() { return COLORS[7]; }, getHidden(s: any, e?: any) { return seriesCount(s, e) < 8; } }),

      // Per-series label overrides — shown only when the series exists in the data
      series_0_label: ds({ id: "series_0_label", title: "Series 1 — Label", widget: "input", getDefault() { return ""; }, getHidden(s: any, e?: any) { return seriesCount(s, e) < 1; } }),
      series_1_label: ds({ id: "series_1_label", title: "Series 2 — Label", widget: "input", getDefault() { return ""; }, getHidden(s: any, e?: any) { return seriesCount(s, e) < 2; } }),
      series_2_label: ds({ id: "series_2_label", title: "Series 3 — Label", widget: "input", getDefault() { return ""; }, getHidden(s: any, e?: any) { return seriesCount(s, e) < 3; } }),
      series_3_label: ds({ id: "series_3_label", title: "Series 4 — Label", widget: "input", getDefault() { return ""; }, getHidden(s: any, e?: any) { return seriesCount(s, e) < 4; } }),
      series_4_label: ds({ id: "series_4_label", title: "Series 5 — Label", widget: "input", getDefault() { return ""; }, getHidden(s: any, e?: any) { return seriesCount(s, e) < 5; } }),
      series_5_label: ds({ id: "series_5_label", title: "Series 6 — Label", widget: "input", getDefault() { return ""; }, getHidden(s: any, e?: any) { return seriesCount(s, e) < 6; } }),
      series_6_label: ds({ id: "series_6_label", title: "Series 7 — Label", widget: "input", getDefault() { return ""; }, getHidden(s: any, e?: any) { return seriesCount(s, e) < 7; } }),
      series_7_label: ds({ id: "series_7_label", title: "Series 8 — Label", widget: "input", getDefault() { return ""; }, getHidden(s: any, e?: any) { return seriesCount(s, e) < 8; } }),
    },

    VisualizationComponent: WaffleChart,
  });
};

export default createVisualization;
