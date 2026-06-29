import { type CreateCustomVisualization, defineConfig } from "@metabase/custom-viz";
import { WaffleChart } from "./WaffleChart";
import type { Settings } from "./types";
import { isNumericCol } from "./utils";

const COLORS = [
  "#509EE3", "#88BF4D", "#F9CF48", "#EF8C8C", "#98D9D9",
  "#7172AD", "#F2A86F", "#4C5773", "#A989C5", "#EDA1D5",
];

// Returns the number of data rows — used to show/hide per-series settings.
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
  // Bypasses SDK types to allow getHidden (runtime-supported but not typed).
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
      if (!data) throw new Error("Select a dimension and a metric");
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
      // ── Grid ────────────────────────────────────────────────────────────
      gridColumns: defineSetting({
        id: "gridColumns",
        title: "Columns",
        widget: "number",
        getSection() { return "Grid"; },
        getDefault() { return 20; },
      }),
      gridRows: defineSetting({
        id: "gridRows",
        title: "Rows",
        widget: "number",
        getSection() { return "Grid"; },
        getDefault() { return 5; },
      }),
      fillDirection: defineSetting({
        id: "fillDirection",
        title: "Fill direction",
        widget: "select",
        getSection() { return "Grid"; },
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

      // ── Cells ───────────────────────────────────────────────────────────
      cellShape: defineSetting({
        id: "cellShape",
        title: "Cell shape",
        widget: "select",
        getSection() { return "Cells"; },
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
        getSection() { return "Cells"; },
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

      // ── Data ────────────────────────────────────────────────────────────
      mode: defineSetting({
        id: "mode",
        title: "Mode",
        widget: "select",
        getSection() { return "Data"; },
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
        getSection() { return "Data"; },
        getDefault() { return 1; },
      }),
      sort: defineSetting({
        id: "sort",
        title: "Sort",
        widget: "select",
        getSection() { return "Data"; },
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
        getSection() { return "Data"; },
        getDefault() { return true; },
      }),

      // ── Legend ──────────────────────────────────────────────────────────
      showLegend: defineSetting({
        id: "showLegend",
        title: "Show legend",
        widget: "toggle",
        getSection() { return "Legend"; },
        getDefault() { return true; },
      }),
      legendValue: defineSetting({
        id: "legendValue",
        title: "Legend value",
        widget: "select",
        getSection() { return "Legend"; },
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

      // ── Series (one section per series, shown only if series exists) ────
      series_0_color: ds({ id: "series_0_color", title: "Color", widget: "color", getSection() { return "Series 1"; }, getDefault() { return COLORS[0]; }, getHidden(s: any, e?: any) { return seriesCount(s, e) < 1; } }),
      series_0_label: ds({ id: "series_0_label", title: "Label", widget: "input", getSection() { return "Series 1"; }, getDefault() { return ""; }, getHidden(s: any, e?: any) { return seriesCount(s, e) < 1; } }),

      series_1_color: ds({ id: "series_1_color", title: "Color", widget: "color", getSection() { return "Series 2"; }, getDefault() { return COLORS[1]; }, getHidden(s: any, e?: any) { return seriesCount(s, e) < 2; } }),
      series_1_label: ds({ id: "series_1_label", title: "Label", widget: "input", getSection() { return "Series 2"; }, getDefault() { return ""; }, getHidden(s: any, e?: any) { return seriesCount(s, e) < 2; } }),

      series_2_color: ds({ id: "series_2_color", title: "Color", widget: "color", getSection() { return "Series 3"; }, getDefault() { return COLORS[2]; }, getHidden(s: any, e?: any) { return seriesCount(s, e) < 3; } }),
      series_2_label: ds({ id: "series_2_label", title: "Label", widget: "input", getSection() { return "Series 3"; }, getDefault() { return ""; }, getHidden(s: any, e?: any) { return seriesCount(s, e) < 3; } }),

      series_3_color: ds({ id: "series_3_color", title: "Color", widget: "color", getSection() { return "Series 4"; }, getDefault() { return COLORS[3]; }, getHidden(s: any, e?: any) { return seriesCount(s, e) < 4; } }),
      series_3_label: ds({ id: "series_3_label", title: "Label", widget: "input", getSection() { return "Series 4"; }, getDefault() { return ""; }, getHidden(s: any, e?: any) { return seriesCount(s, e) < 4; } }),

      series_4_color: ds({ id: "series_4_color", title: "Color", widget: "color", getSection() { return "Series 5"; }, getDefault() { return COLORS[4]; }, getHidden(s: any, e?: any) { return seriesCount(s, e) < 5; } }),
      series_4_label: ds({ id: "series_4_label", title: "Label", widget: "input", getSection() { return "Series 5"; }, getDefault() { return ""; }, getHidden(s: any, e?: any) { return seriesCount(s, e) < 5; } }),

      series_5_color: ds({ id: "series_5_color", title: "Color", widget: "color", getSection() { return "Series 6"; }, getDefault() { return COLORS[5]; }, getHidden(s: any, e?: any) { return seriesCount(s, e) < 6; } }),
      series_5_label: ds({ id: "series_5_label", title: "Label", widget: "input", getSection() { return "Series 6"; }, getDefault() { return ""; }, getHidden(s: any, e?: any) { return seriesCount(s, e) < 6; } }),

      series_6_color: ds({ id: "series_6_color", title: "Color", widget: "color", getSection() { return "Series 7"; }, getDefault() { return COLORS[6]; }, getHidden(s: any, e?: any) { return seriesCount(s, e) < 7; } }),
      series_6_label: ds({ id: "series_6_label", title: "Label", widget: "input", getSection() { return "Series 7"; }, getDefault() { return ""; }, getHidden(s: any, e?: any) { return seriesCount(s, e) < 7; } }),

      series_7_color: ds({ id: "series_7_color", title: "Color", widget: "color", getSection() { return "Series 8"; }, getDefault() { return COLORS[7]; }, getHidden(s: any, e?: any) { return seriesCount(s, e) < 8; } }),
      series_7_label: ds({ id: "series_7_label", title: "Label", widget: "input", getSection() { return "Series 8"; }, getDefault() { return ""; }, getHidden(s: any, e?: any) { return seriesCount(s, e) < 8; } }),
    },

    VisualizationComponent: WaffleChart,
  });
};

export default createVisualization;
