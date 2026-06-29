import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { WaffleChart } from "./WaffleChart";
import type { Settings } from "./types";

const MOCK_SERIES = [
  {
    data: {
      cols: [
        { name: "category", display_name: "Catégorie", base_type: "type/Text" },
        { name: "value", display_name: "Valeur", base_type: "type/Integer" },
      ],
      rows: [
        ["Produit A", 42],
        ["Produit B", 28],
        ["Produit C", 15],
        ["Produit D", 10],
        ["Produit E", 5],
      ],
    },
  },
];

const MOCK_SETTINGS: Settings = {
  gridColumns: 20,
  gridRows: 5,
  mode: "percent",
  fillDirection: "row-left-right",
  sort: "value_desc",
  minOneCell: true,
  showLegend: true,
  legendValue: "percent",
};

function App() {
  return (
    <div style={{ display: "flex", gap: 16, padding: 16, fontFamily: "sans-serif" }}>
      <div>
        <h3 style={{ margin: "0 0 8px" }}>Waffle Chart — 10×10</h3>
        <div style={{ width: 400, height: 350, border: "1px solid #ddd", borderRadius: 8, overflow: "hidden" }}>
          <WaffleChart
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            series={MOCK_SERIES as any}
            settings={MOCK_SETTINGS}
            width={400}
            height={350}
            colorScheme="light"
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            onClick={() => {}}
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            onHover={() => {}}
          />
        </div>
      </div>
      <div>
        <h3 style={{ margin: "0 0 8px" }}>Mode sombre — légende valeurs</h3>
        <div style={{ width: 400, height: 350, border: "1px solid #555", borderRadius: 8, overflow: "hidden", backgroundColor: "#1c1c1c" }}>
          <WaffleChart
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            series={MOCK_SERIES as any}
            settings={{ ...MOCK_SETTINGS, legendValue: "both" }}
            width={400}
            height={350}
            colorScheme="dark"
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            onClick={() => {}}
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            onHover={() => {}}
          />
        </div>
      </div>
    </div>
  );
}

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
