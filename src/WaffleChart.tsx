import { useState } from "react";
import { type CustomVisualizationProps } from "@metabase/custom-viz";
import type { Settings } from "./types";
import { isNumericCol, largestRemainder } from "./utils";

const COLORS = [
  "#509EE3", "#88BF4D", "#F9CF48", "#EF8C8C", "#98D9D9",
  "#7172AD", "#F2A86F", "#4C5773", "#A989C5", "#EDA1D5",
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Col = Record<string, any>;

interface Category {
  label: string;
  value: number;
  color: string;
}

const GAP = 4;
const PADDING = 12;
const ANIM = `@keyframes waffleIn{from{opacity:0;transform:scale(.55)}to{opacity:1;transform:scale(1)}}`;

export function WaffleChart({
  series,
  settings,
  width,
  height,
  colorScheme,
  onClick,
}: CustomVisualizationProps<Settings>) {
  const [hoveredCat, setHoveredCat] = useState<number | null>(null);

  const gridColumns = settings?.gridColumns ?? 20;
  const gridRows = settings?.gridRows ?? 5;
  const mode = settings?.mode ?? "percent";
  const unitsPerCell = Math.max(1, settings?.unitsPerCell ?? 1);
  const fillDirection = settings?.fillDirection ?? "row-left-right";
  const sort = settings?.sort ?? "value_desc";
  const minOneCell = settings?.minOneCell ?? true;
  const showLegend = settings?.showLegend ?? true;
  const legendValue = settings?.legendValue ?? "percent";
  const isDark = colorScheme === "dark";

  if (!width || !height) return null;

  const data = series?.[0]?.data;
  if (!data) return null;

  const cols = data.cols as Col[];
  const dimIdx = cols.findIndex((c: Col) => !isNumericCol(c));
  const metIdx = cols.findIndex((c: Col) => isNumericCol(c));
  if (dimIdx === -1 || metIdx === -1) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let categories: Category[] = (data.rows as any[][])
    .map((row, i) => {
      const raw = row[metIdx];
      const value = typeof raw === "number" ? raw : parseFloat(String(raw ?? 0));
      return {
        label: String(row[dimIdx] ?? ""),
        value: isNaN(value) || value < 0 ? 0 : value,
        color: COLORS[i % COLORS.length],
      };
    })
    .filter((c) => c.value > 0);

  if (sort === "value_desc") categories.sort((a, b) => b.value - a.value);
  else if (sort === "value_asc") categories.sort((a, b) => a.value - b.value);

  const totalCells = gridColumns * gridRows;
  const totalValue = categories.reduce((s, c) => s + c.value, 0);

  let cellCounts: number[];
  if (totalValue === 0) {
    cellCounts = categories.map(() => 0);
  } else if (mode === "percent") {
    cellCounts = largestRemainder(
      categories.map((c) => c.value / totalValue),
      totalCells,
    );
  } else {
    const raw = categories.map((c) => Math.floor(c.value / unitsPerCell));
    const used = raw.reduce((a, b) => a + b, 0);
    cellCounts =
      used <= totalCells
        ? raw
        : largestRemainder(
            categories.map((c) => c.value / totalValue),
            totalCells,
          );
  }

  if (minOneCell) {
    let added = 0;
    for (let i = 0; i < cellCounts.length; i++) {
      if (cellCounts[i] === 0 && categories[i].value > 0) {
        cellCounts[i] = 1;
        added++;
      }
    }
    if (added > 0) {
      let excess = cellCounts.reduce((a, b) => a + b, 0) - totalCells;
      const byDesc = [...cellCounts.map((n, i) => ({ n, i }))].sort(
        (a, b) => b.n - a.n,
      );
      for (let k = 0; k < byDesc.length && excess > 0; k++) {
        const take = Math.min(byDesc[k].n - 1, excess);
        if (take > 0) {
          cellCounts[byDesc[k].i] -= take;
          excess -= take;
        }
      }
    }
  }

  // Build flat sequence — row-by-row or col-bottom-up
  const seq: number[] = [];
  categories.forEach((_, i) => {
    for (let k = 0; k < cellCounts[i]; k++) seq.push(i);
  });
  while (seq.length < totalCells) seq.push(-1);

  // Layout
  const LEGEND_H = showLegend && categories.length > 0 ? 30 : 0;
  const availW = width - PADDING * 2;
  const availH = height - PADDING * 2 - LEGEND_H;

  const cellSize = Math.max(
    4,
    Math.floor(
      Math.min(
        (availW - GAP * (gridColumns - 1)) / gridColumns,
        (availH - GAP * (gridRows - 1)) / gridRows,
      ),
    ),
  );

  const gridW = cellSize * gridColumns + GAP * (gridColumns - 1);
  const gridH = cellSize * gridRows + GAP * (gridRows - 1);
  const gx = (width - gridW) / 2;
  const gy = PADDING;

  // Map linear index → grid position
  function cellPos(idx: number): { col: number; row: number } {
    if (fillDirection === "row-left-right") {
      return { col: idx % gridColumns, row: Math.floor(idx / gridColumns) };
    }
    // col-bottom-up: fill column by column, each column from bottom to top
    const col = Math.floor(idx / gridRows);
    const row = gridRows - 1 - (idx % gridRows);
    return { col, row };
  }

  const emptyColor = isDark ? "#3a3a3a" : "#e8e8e8";
  const bgColor = isDark ? "#1c1c1c" : "#ffffff";
  const textColor = isDark ? "#cccccc" : "#696e7b";

  const hovered = hoveredCat !== null ? categories[hoveredCat] : null;
  const hoveredPct =
    hovered && totalValue > 0
      ? ((hovered.value / totalValue) * 100).toFixed(1)
      : null;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: bgColor,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <style>{ANIM}</style>

      {/* Tooltip */}
      {hovered && (
        <div
          style={{
            position: "absolute",
            top: 6,
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: isDark ? "#2a2a2a" : "#ffffff",
            border: `1.5px solid ${hovered.color}`,
            borderRadius: 5,
            padding: "3px 10px",
            fontSize: 12,
            color: textColor,
            pointerEvents: "none",
            zIndex: 20,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: hovered.color, fontWeight: 700 }}>
            {hovered.label}
          </span>
          {" · "}
          {hovered.value.toLocaleString()}
          {hoveredPct ? ` (${hoveredPct}%)` : ""}
        </div>
      )}

      {/* SVG waffle grid */}
      <svg
        width={width}
        height={gridH + gy * 2}
        style={{ flexShrink: 0, display: "block" }}
        onMouseLeave={() => setHoveredCat(null)}
      >
        {seq.map((catIdx, idx) => {
          const { col, row } = cellPos(idx);
          const x = gx + col * (cellSize + GAP);
          const y = gy + row * (cellSize + GAP);
          const color = catIdx >= 0 ? categories[catIdx].color : emptyColor;
          const dim =
            hoveredCat !== null && catIdx !== hoveredCat;
          return (
            <g
              key={idx}
              style={{
                opacity: dim ? 0.15 : 1,
                transition: "opacity 0.15s",
                cursor: catIdx >= 0 ? "pointer" : "default",
              }}
              onMouseEnter={() =>
                setHoveredCat(catIdx >= 0 ? catIdx : null)
              }
              onClick={() => {
                if (catIdx >= 0 && onClick) {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (onClick as any)({
                    dimensions: [
                      {
                        value: categories[catIdx].label,
                        column: cols[dimIdx],
                      },
                    ],
                  });
                }
              }}
            >
              <rect
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                rx={Math.max(2, Math.round(cellSize * 0.18))}
                fill={color}
                style={{
                  animation: `waffleIn 0.28s ease-out both`,
                  animationDelay: `${idx * 7}ms`,
                }}
              />
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      {showLegend && categories.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "3px 14px",
            justifyContent: "center",
            padding: "4px 12px 6px",
            flexShrink: 0,
          }}
        >
          {categories.map((cat, i) => {
            const pct =
              totalValue > 0
                ? ((cat.value / totalValue) * 100).toFixed(1)
                : "0.0";
            const isOther = hoveredCat !== null && hoveredCat !== i;
            let valPart: string;
            if (legendValue === "percent") valPart = `${pct}%`;
            else if (legendValue === "value") valPart = cat.value.toLocaleString();
            else valPart = `${cat.value.toLocaleString()} · ${pct}%`;

            return (
              <span
                key={i}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 12,
                  color: textColor,
                  opacity: isOther ? 0.25 : 1,
                  transition: "opacity 0.15s",
                  cursor: "pointer",
                  userSelect: "none",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={() => setHoveredCat(i)}
                onMouseLeave={() => setHoveredCat(null)}
                onClick={() => {
                  if (onClick) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (onClick as any)({
                      dimensions: [
                        { value: cat.label, column: cols[dimIdx] },
                      ],
                    });
                  }
                }}
              >
                <i
                  style={{
                    display: "inline-block",
                    width: 9,
                    height: 9,
                    borderRadius: 2,
                    backgroundColor: cat.color,
                    flexShrink: 0,
                  }}
                />
                {cat.label} · {valPart}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
