import { type CreateCustomVisualization, defineConfig } from "@metabase/custom-viz";
import { WaffleChart } from "./WaffleChart";
import type { Settings } from "./types";
import { isNumericCol } from "./utils";

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
        getDefault() {
          return 20;
        },
      }),
      gridRows: defineSetting({
        id: "gridRows",
        title: "Rows",
        widget: "number",
        getDefault() {
          return 5;
        },
      }),
      mode: defineSetting({
        id: "mode",
        title: "Mode",
        widget: "select",
        getDefault() {
          return "percent";
        },
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
        getDefault() {
          return 1;
        },
      }),
      fillDirection: defineSetting({
        id: "fillDirection",
        title: "Fill direction",
        widget: "select",
        getDefault() {
          return "row-left-right";
        },
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
        getDefault() {
          return "value_desc";
        },
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
        getDefault() {
          return true;
        },
      }),
      showLegend: defineSetting({
        id: "showLegend",
        title: "Show legend",
        widget: "toggle",
        getDefault() {
          return true;
        },
      }),
      legendValue: defineSetting({
        id: "legendValue",
        title: "Legend value",
        widget: "select",
        getDefault() {
          return "percent";
        },
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
    },

    VisualizationComponent: WaffleChart,
  });
};

export default createVisualization;
