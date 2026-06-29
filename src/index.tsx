import { type CreateCustomVisualization, defineConfig } from "@metabase/custom-viz";
import { WaffleChart } from "./WaffleChart";
import type { Settings } from "./types";
import { isNumericCol } from "./utils";

const COLORS = [
  "#509EE3", "#88BF4D", "#F9CF48", "#EF8C8C", "#98D9D9",
  "#7172AD", "#F2A86F", "#4C5773", "#A989C5", "#EDA1D5",
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowCount(series: any): number {
  return series?.[0]?.data?.rows?.length ?? 0;
}

const createVisualization: CreateCustomVisualization<Settings> = ({
  defineSetting,
}) => {
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

      // Per-category color overrides (indexed by sorted display order)
      series_0_color: defineSetting({ id: "series_0_color", title: "Series 1 — Color", widget: "color", getDefault() { return COLORS[0]; } }),
      series_1_color: defineSetting({ id: "series_1_color", title: "Series 2 — Color", widget: "color", getDefault() { return COLORS[1]; } }),
      series_2_color: defineSetting({ id: "series_2_color", title: "Series 3 — Color", widget: "color", getDefault() { return COLORS[2]; } }),
      series_3_color: defineSetting({ id: "series_3_color", title: "Series 4 — Color", widget: "color", getDefault() { return COLORS[3]; } }),
      series_4_color: defineSetting({ id: "series_4_color", title: "Series 5 — Color", widget: "color", getDefault() { return COLORS[4]; } }),
      series_5_color: defineSetting({ id: "series_5_color", title: "Series 6 — Color", widget: "color", getDefault() { return COLORS[5]; } }),
      series_6_color: defineSetting({ id: "series_6_color", title: "Series 7 — Color", widget: "color", getDefault() { return COLORS[6]; } }),
      series_7_color: defineSetting({ id: "series_7_color", title: "Series 8 — Color", widget: "color", getDefault() { return COLORS[7]; } }),

      // Per-category label overrides
      series_0_label: defineSetting({ id: "series_0_label", title: "Series 1 — Label", widget: "input", getDefault() { return ""; } }),
      series_1_label: defineSetting({ id: "series_1_label", title: "Series 2 — Label", widget: "input", getDefault() { return ""; } }),
      series_2_label: defineSetting({ id: "series_2_label", title: "Series 3 — Label", widget: "input", getDefault() { return ""; } }),
      series_3_label: defineSetting({ id: "series_3_label", title: "Series 4 — Label", widget: "input", getDefault() { return ""; } }),
      series_4_label: defineSetting({ id: "series_4_label", title: "Series 5 — Label", widget: "input", getDefault() { return ""; } }),
      series_5_label: defineSetting({ id: "series_5_label", title: "Series 6 — Label", widget: "input", getDefault() { return ""; } }),
      series_6_label: defineSetting({ id: "series_6_label", title: "Series 7 — Label", widget: "input", getDefault() { return ""; } }),
      series_7_label: defineSetting({ id: "series_7_label", title: "Series 8 — Label", widget: "input", getDefault() { return ""; } }),
    },

    VisualizationComponent: WaffleChart,
  });
};

export default createVisualization;
