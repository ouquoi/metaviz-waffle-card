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
        throw new Error("Sélectionnez une dimension et une mesure");
      }
      const data = series[0]?.data;
      if (!data) {
        throw new Error("Sélectionnez une dimension et une mesure");
      }
      const cols = data.cols;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hasDimension = (cols as any[]).some((c) => !isNumericCol(c));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hasMetric = (cols as any[]).some((c) => isNumericCol(c));
      if (!hasDimension || !hasMetric) {
        throw new Error("Sélectionnez une dimension et une mesure");
      }
    },

    settings: {
      gridColumns: defineSetting({
        id: "gridColumns",
        title: "Colonnes",
        widget: "number",
        getDefault() {
          return 20;
        },
      }),
      gridRows: defineSetting({
        id: "gridRows",
        title: "Lignes",
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
              { name: "Pourcentage (1 case = 1 %)", value: "percent" },
              { name: "Unité (N unités par case)", value: "unit" },
            ],
          };
        },
      }),
      unitsPerCell: defineSetting({
        id: "unitsPerCell",
        title: "Unités par case (mode unité)",
        widget: "number",
        getDefault() {
          return 1;
        },
      }),
      fillDirection: defineSetting({
        id: "fillDirection",
        title: "Direction de remplissage",
        widget: "select",
        getDefault() {
          return "row-left-right";
        },
        getProps() {
          return {
            options: [
              { name: "Colonne, bas vers haut", value: "col-bottom-up" },
              { name: "Ligne, gauche à droite", value: "row-left-right" },
            ],
          };
        },
      }),
      sort: defineSetting({
        id: "sort",
        title: "Tri",
        widget: "select",
        getDefault() {
          return "value_desc";
        },
        getProps() {
          return {
            options: [
              { name: "Valeur décroissante", value: "value_desc" },
              { name: "Valeur croissante", value: "value_asc" },
              { name: "Ordre original", value: "none" },
            ],
          };
        },
      }),
      minOneCell: defineSetting({
        id: "minOneCell",
        title: "Minimum 1 case par catégorie",
        widget: "toggle",
        getDefault() {
          return true;
        },
      }),
      showLegend: defineSetting({
        id: "showLegend",
        title: "Afficher la légende",
        widget: "toggle",
        getDefault() {
          return true;
        },
      }),
      legendValue: defineSetting({
        id: "legendValue",
        title: "Valeur dans la légende",
        widget: "select",
        getDefault() {
          return "percent";
        },
        getProps() {
          return {
            options: [
              { name: "Pourcentage", value: "percent" },
              { name: "Valeur", value: "value" },
              { name: "Les deux", value: "both" },
            ],
          };
        },
      }),
    },

    VisualizationComponent: WaffleChart,
  });
};

export default createVisualization;
