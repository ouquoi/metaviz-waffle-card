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

const GAP = 3;
const MARGIN = 6;
const LEGEND_H = 28;

export function WaffleChart({
  series,
  settings,
  width,
  height,
  colorScheme,
  onClick,
}: CustomVisualizationProps<Settings>) {
  const [hoveredCat, setHoveredCat] = useState<number | null>(null);

  const isDark = colorScheme === "dark";
  const bgColor = isDark ? "#1c1c1c" : "#ffffff";
  const textColor = isDark ? "#cccccc" : "#696e7b";
  const emptyColor = isDark ? "#3a3a3a" : "#e8e8e8";

  const gridColumns = settings?.gridColumns ?? 20;
  const gridRows = settings?.gridRows ?? 5;
  const cellSize = settings?.cellSize ?? "auto";
  const mode = settings?.mode ?? "percent";
  const unitsPerCell = Math.max(1, settings?.unitsPerCell ?? 1);
  const fillDirection = settings?.fillDirection ?? "row-left-right";
  const sort = settings?.sort ?? "value_desc";
  const minOneCell = settings?.minOneCell ?? true;
  const showLegend = settings?.showLegend ?? true;
  const legendValue = settings?.legendValue ?? "percent";

  // Use props directly — Metabase passes correct dimensions per card size
  const cw = (width ?? 0) > 0 ? Math.floor(width ?? 0) : 0;
  const ch = (height ?? 0) > 0 ? Math.floor(height ?? 0) : 0;

  if (!cw || !ch) return null;

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

  if (categories.length === 0) return null;

  if (sort === "value_desc") categories.sort((a, b) => b.value - a.value);
  else if (sort === "value_asc") categories.sort((a, b) => a.value - b.value);

  // Apply per-category color and label overrides (indexed by sorted display order)
  categories = categories.map((cat, i) => ({
    ...cat,
    color: (settings?.[`series_${i}_color` as keyof Settings] as string | undefined) || cat.color,
    label: ((settings?.[`series_${i}_label` as keyof Settings] as string | undefined) || "").trim() || cat.label,
  }));

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

  // Flat sequence of category indices
  const seq: number[] = [];
  categories.forEach((_, i) => {
    for (let k = 0; k < cellCounts[i]; k++) seq.push(i);
  });
  while (seq.length < totalCells) seq.push(-1);

  // Layout
  const legendVisible = showLegend && categories.length > 0;
  const svgH = ch - (legendVisible ? LEGEND_H : 0);

  const FIXED_SIZES: Record<string, number> = { xs: 8, s: 12, m: 18, l: 26, xl: 36 };
  const fixedPx = cellSize !== "auto" ? FIXED_SIZES[cellSize] : null;

  const cellW = fixedPx ?? Math.max(4, Math.floor((cw - 2 * MARGIN - GAP * (gridColumns - 1)) / gridColumns));
  const cellH = fixedPx ?? Math.max(4, Math.floor((svgH - 2 * MARGIN - GAP * (gridRows - 1)) / gridRows));

  const gridW = cellW * gridColumns + GAP * (gridColumns - 1);
  const gridH = cellH * gridRows + GAP * (gridRows - 1);
  const gx = Math.round((cw - gridW) / 2);
  const gy = Math.round((svgH - gridH) / 2);

  function cellPos(idx: number): { col: number; row: number } {
    if (fillDirection === "row-left-right") {
      return { col: idx % gridColumns, row: Math.floor(idx / gridColumns) };
    }
    const col = Math.floor(idx / gridRows);
    const row = gridRows - 1 - (idx % gridRows);
    return { col, row };
  }

  const hovered = hoveredCat !== null ? categories[hoveredCat] : null;
  const hoveredPct =
    hovered && totalValue > 0
      ? ((hovered.value / totalValue) * 100).toFixed(1)
      : null;

  return (
    <div
      style={{
        width: cw,
        height: ch,
        backgroundColor: bgColor,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
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
        width={cw}
        height={svgH}
        style={{ display: "block", flexShrink: 0 }}
        onMouseLeave={() => setHoveredCat(null)}
      >
        {seq.map((catIdx, idx) => {
          const { col, row } = cellPos(idx);
          const x = gx + col * (cellW + GAP);
          const y = gy + row * (cellH + GAP);
          const color = catIdx >= 0 ? categories[catIdx].color : emptyColor;
          const dim = hoveredCat !== null && catIdx !== hoveredCat;
          return (
            <g
              key={idx}
              style={{
                opacity: dim ? 0.15 : 1,
                transition: "opacity 0.15s",
                cursor: catIdx >= 0 ? "pointer" : "default",
              }}
              onMouseEnter={() => setHoveredCat(catIdx >= 0 ? catIdx : null)}
              onClick={() => {
                if (catIdx >= 0 && onClick) {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (onClick as any)({
                    dimensions: [
                      { value: categories[catIdx].label, column: cols[dimIdx] },
                    ],
                  });
                }
              }}
            >
              <rect
                x={x}
                y={y}
                width={cellW}
                height={cellH}
                rx={Math.max(2, Math.round(Math.min(cellW, cellH) * 0.18))}
                fill={color}
                opacity={0}
              >
                <animate
                  attributeName="opacity"
                  from="0"
                  to="1"
                  dur="0.3s"
                  begin={`${idx * 7}ms`}
                  fill="freeze"
                />
              </rect>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      {legendVisible && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "3px 14px",
            justifyContent: "center",
            alignItems: "center",
            height: LEGEND_H,
            padding: "0 12px",
            flexShrink: 0,
            overflow: "hidden",
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
                      dimensions: [{ value: cat.label, column: cols[dimIdx] }],
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
