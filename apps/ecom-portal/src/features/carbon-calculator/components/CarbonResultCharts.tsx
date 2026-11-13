// Modified by Sekar Nagarajan (2026-09-15 12:23)
import { AppChart, useChartTokens } from "@solverminds/shared-ui/chart";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { CarbonResultDTO, DisplayUnit } from "../types/carbon.types";
import {
  createCarbonLegsBarOption,
  createCarbonModeDonutOption,
  createCarbonScopeDonutOption,
  type CarbonChartCopy,
  type CarbonModeLabels,
} from "../utils/carbon-chart-options";

interface CarbonResultChartsProps {
  result: CarbonResultDTO;
  unit: DisplayUnit;
}

export function CarbonResultCharts({ result, unit }: CarbonResultChartsProps) {
  const { t, i18n } = useTranslation(["carbon-calculator", "common"]);
  const tokens = useChartTokens();
  const hasLegs = result.legs.length > 0;

  const chartCopy = useMemo<CarbonChartCopy>(() => {
    const modes: CarbonModeLabels = {
      SEA: t("modes.SEA"),
      ROAD: t("modes.ROAD"),
      RAIL: t("modes.RAIL"),
      AIR: t("modes.AIR"),
      INLAND_WATER: t("modes.INLAND_WATER"),
    };
    return {
      modes,
      tankToWheel: t("kpi.tankToWheel"),
      wellToTank: t("kpi.wellToTank"),
      emissionScope: t("charts.emissionScopeSeries"),
      byMode: t("charts.byModeSeries"),
      modeTooltip: (mode) => t("charts.modeTooltip", { mode }),
      unitLabels: {
        kg: t("units.kgCo2e"),
        t: t("units.tCo2e"),
      },
    };
  }, [t, i18n.language]);

  const scopeOption = useMemo(
    () => createCarbonScopeDonutOption({ result, unit, tokens, copy: chartCopy }),
    [result, unit, tokens, chartCopy],
  );
  const legsOption = useMemo(
    () =>
      createCarbonLegsBarOption({
        legs: result.legs,
        unit,
        tokens,
        copy: chartCopy,
      }),
    [result.legs, unit, tokens, chartCopy],
  );
  const modeOption = useMemo(
    () =>
      createCarbonModeDonutOption({
        legs: result.legs,
        unit,
        tokens,
        copy: chartCopy,
      }),
    [result.legs, unit, tokens, chartCopy],
  );

  return (
    <div className="co2-charts">
      <section
        className="co2-chart-card"
        aria-label={t("a11y.emissionScopeChart")}
      >
        <header className="co2-chart-card__header">
          <h3 className="co2-chart-card__title">
            {t("charts.emissionScopeTitle")}
          </h3>
          <p className="co2-chart-card__hint">{t("charts.emissionScopeHint")}</p>
        </header>
        <AppChart
          className="co2-chart-card__canvas"
          option={scopeOption}
          tokens={tokens}
          height={280}
          ariaLabel={t("a11y.scopeSplitChart")}
        />
      </section>

      <section
        className="co2-chart-card"
        aria-label={t("a11y.emissionsByLegChart")}
      >
        <header className="co2-chart-card__header">
          <h3 className="co2-chart-card__title">{t("charts.byLegTitle")}</h3>
          <p className="co2-chart-card__hint">{t("charts.byLegHint")}</p>
        </header>
        <AppChart
          className="co2-chart-card__canvas"
          option={legsOption}
          tokens={tokens}
          empty={!hasLegs}
          emptyMessage={t("empty.noLegBreakdownAvailable")}
          height={280}
          ariaLabel={t("a11y.co2eByLeg")}
        />
      </section>

      <section
        className="co2-chart-card"
        aria-label={t("a11y.emissionsByModeChart")}
      >
        <header className="co2-chart-card__header">
          <h3 className="co2-chart-card__title">{t("charts.byModeTitle")}</h3>
          <p className="co2-chart-card__hint">{t("charts.byModeHint")}</p>
        </header>
        <AppChart
          className="co2-chart-card__canvas"
          option={modeOption}
          tokens={tokens}
          empty={!hasLegs}
          emptyMessage={t("empty.noModeBreakdownAvailable")}
          height={280}
          ariaLabel={t("a11y.co2eByMode")}
        />
      </section>
    </div>
  );
}
