// Modified by Sekar Nagarajan (2026-09-15 12:40)
import {
  createBaseAxisStyle,
  createBaseGrid,
  createBaseLegend,
  createBaseTooltip,
  type ChartTokens,
  type ECOption,
} from "@solverminds/shared-ui/chart";

import type {
  CarbonLegResult,
  CarbonResultDTO,
  DisplayUnit,
  TransportMode,
} from "../types/carbon.types";
import { formatCo2e } from "../types/carbon.types";

const MODE_LABELS: Record<TransportMode, string> = {
  SEA: "Sea",
  ROAD: "Road",
  RAIL: "Rail",
  AIR: "Air",
  INLAND_WATER: "Inland water",
};

export function transportModeLabel(mode: TransportMode | string): string {
  return MODE_LABELS[mode as TransportMode] ?? String(mode);
}

/** Stable token colors per mode — shared by leg bars and mode donut. */
function modeColor(mode: TransportMode | string, tokens: ChartTokens): string {
  switch (mode) {
    case "SEA":
      return tokens.colorPrimary;
    case "ROAD":
      return tokens.colorWarning;
    case "RAIL":
      return tokens.colorSuccess;
    case "AIR":
      return tokens.colorError;
    case "INLAND_WATER":
      return tokens.colorInfo;
    default:
      return tokens.colorTextSecondary;
  }
}

function legCo2e(leg: CarbonLegResult, unit: DisplayUnit): number {
  return unit === "kg" ? leg.co2eKg : leg.co2eTonnes;
}

function scopeValues(
  result: CarbonResultDTO,
  unit: DisplayUnit,
): { ttw: number; wtt: number } {
  if (unit === "kg") {
    return { ttw: result.ttwCo2eKg, wtt: result.wttCo2eKg };
  }
  return { ttw: result.ttwCo2eTonnes, wtt: result.wttCo2eTonnes };
}

function formatChartValue(value: number, unit: DisplayUnit): string {
  const decimals = unit === "kg" ? 0 : 2;
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Donut: tank-to-wheel vs well-to-tank share of total CO₂e. */
export function createCarbonScopeDonutOption(args: {
  result: CarbonResultDTO;
  unit: DisplayUnit;
  tokens: ChartTokens;
}): ECOption {
  const { result, unit, tokens } = args;
  const { ttw, wtt } = scopeValues(result, unit);
  const slices = [
    {
      name: "Tank-to-wheel",
      value: ttw,
      itemStyle: { color: tokens.colorPrimary },
    },
    {
      name: "Well-to-tank",
      value: wtt,
      itemStyle: { color: tokens.colorSuccess },
    },
  ];

  return {
    color: [tokens.colorPrimary, tokens.colorSuccess],
    tooltip: createBaseTooltip(tokens, {
      trigger: "item",
      formatter: (params) => {
        const point = Array.isArray(params) ? params[0] : params;
        if (!point || point.value == null) return "";
        const value = Number(point.value);
        const percent = Math.round(point.percent ?? 0);
        return `${point.name}<br/>${formatCo2e(value, unit)} (${percent}%)`;
      },
    }),
    legend: createBaseLegend(tokens, {
      orient: "horizontal",
      type: "scroll",
      left: "center",
      bottom: 0,
      itemGap: 16,
    }),
    series: [
      {
        name: "Emission scope",
        type: "pie",
        radius: ["42%", "64%"],
        center: ["50%", "44%"],
        avoidLabelOverlap: true,
        label: { show: false },
        labelLine: { show: false },
        data: slices,
      },
    ],
  };
}

/** Horizontal bar: CO₂e per transport leg — bar color keyed by mode. */
export function createCarbonLegsBarOption(args: {
  legs: CarbonLegResult[];
  unit: DisplayUnit;
  tokens: ChartTokens;
}): ECOption {
  const { legs, unit, tokens } = args;
  const categories = legs.map(
    (leg) => `${leg.from} → ${leg.to} (${transportModeLabel(leg.mode)})`,
  );
  const axis = createBaseAxisStyle(tokens);
  const unitSuffix = unit === "kg" ? "kg CO₂e" : "t CO₂e";

  const modeOrder: TransportMode[] = [
    "SEA",
    "ROAD",
    "RAIL",
    "AIR",
    "INLAND_WATER",
  ];
  const modesPresent = modeOrder.filter((mode) =>
    legs.some((leg) => leg.mode === mode),
  );

  return {
    color: modesPresent.map((mode) => modeColor(mode, tokens)),
    tooltip: createBaseTooltip(tokens, {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params) => {
        const points = Array.isArray(params) ? params : [params];
        const point = points.find((p) => p.value != null && p.value !== "-");
        if (!point || point.value == null) return "";
        const leg = legs[point.dataIndex ?? -1];
        const mode = leg ? transportModeLabel(leg.mode) : point.seriesName;
        return `${point.name}<br/>Mode: ${mode}<br/>${formatCo2e(Number(point.value), unit)}`;
      },
    }),
    legend: createBaseLegend(tokens, {
      orient: "horizontal",
      type: "scroll",
      left: "center",
      top: 0,
      itemGap: 12,
    }),
    grid: createBaseGrid({
      left: 8,
      right: 24,
      top: 36,
      bottom: 8,
    }),
    xAxis: {
      type: "value",
      name: unitSuffix,
      nameLocation: "middle",
      nameGap: 28,
      nameTextStyle: {
        color: tokens.colorTextSecondary,
        fontFamily: tokens.fontFamily,
        fontSize: tokens.fontSizeSM,
      },
      ...axis,
      axisLabel: {
        ...axis.axisLabel,
        formatter: (value: number) => formatChartValue(value, unit),
      },
      splitLine: {
        show: true,
        lineStyle: { color: tokens.colorBorderSecondary },
      },
    },
    yAxis: {
      type: "category",
      data: categories,
      inverse: true,
      ...axis,
      axisLabel: {
        ...axis.axisLabel,
        width: 140,
        overflow: "truncate",
      },
      splitLine: { show: false },
    },
    series: modesPresent.map((mode) => ({
      name: transportModeLabel(mode),
      type: "bar" as const,
      barMaxWidth: 28,
      // Overlay mode series in the same category slot so only the matching bar shows.
      barGap: "-100%",
      data: legs.map((leg) =>
        leg.mode === mode
          ? {
              value: legCo2e(leg, unit),
              itemStyle: {
                color: modeColor(mode, tokens),
                borderRadius: [
                  0,
                  tokens.borderRadius,
                  tokens.borderRadius,
                  0,
                ],
              },
            }
          : null,
      ),
    })),
  };
}

/** Donut: CO₂e rolled up by transport mode. */
export function createCarbonModeDonutOption(args: {
  legs: CarbonLegResult[];
  unit: DisplayUnit;
  tokens: ChartTokens;
}): ECOption {
  const { legs, unit, tokens } = args;
  const byMode = new Map<TransportMode, number>();
  for (const leg of legs) {
    byMode.set(leg.mode, (byMode.get(leg.mode) ?? 0) + legCo2e(leg, unit));
  }
  const slices = Array.from(byMode.entries()).map(([mode, value]) => ({
    name: transportModeLabel(mode),
    value,
    itemStyle: {
      color: modeColor(mode, tokens),
    },
  }));

  return {
    color: slices.map((slice) => slice.itemStyle.color),
    tooltip: createBaseTooltip(tokens, {
      trigger: "item",
      formatter: (params) => {
        const point = Array.isArray(params) ? params[0] : params;
        if (!point || point.value == null) return "";
        const percent = Math.round(point.percent ?? 0);
        return `${point.name}<br/>${formatCo2e(Number(point.value), unit)} (${percent}%)`;
      },
    }),
    legend: createBaseLegend(tokens, {
      orient: "horizontal",
      type: "scroll",
      left: "center",
      bottom: 0,
      itemGap: 16,
    }),
    series: [
      {
        name: "By mode",
        type: "pie",
        radius: ["42%", "64%"],
        center: ["50%", "44%"],
        avoidLabelOverlap: true,
        label: { show: false },
        labelLine: { show: false },
        data: slices,
      },
    ],
  };
}
