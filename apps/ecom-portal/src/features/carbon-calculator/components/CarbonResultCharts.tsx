// Modified by Sekar Nagarajan (2026-09-15 12:23)
import { AppChart, useChartTokens } from "@solverminds/shared-ui/chart";
import { useMemo } from "react";

import type { CarbonResultDTO, DisplayUnit } from "../types/carbon.types";
import {
  createCarbonLegsBarOption,
  createCarbonModeDonutOption,
  createCarbonScopeDonutOption,
} from "../utils/carbon-chart-options";

interface CarbonResultChartsProps {
  result: CarbonResultDTO;
  unit: DisplayUnit;
}

export function CarbonResultCharts({ result, unit }: CarbonResultChartsProps) {
  const tokens = useChartTokens();
  const hasLegs = result.legs.length > 0;

  const scopeOption = useMemo(
    () => createCarbonScopeDonutOption({ result, unit, tokens }),
    [result, unit, tokens],
  );
  const legsOption = useMemo(
    () =>
      createCarbonLegsBarOption({ legs: result.legs, unit, tokens }),
    [result.legs, unit, tokens],
  );
  const modeOption = useMemo(
    () =>
      createCarbonModeDonutOption({ legs: result.legs, unit, tokens }),
    [result.legs, unit, tokens],
  );

  return (
    <div className="co2-charts">
      <section className="co2-chart-card" aria-label="Emission scope chart">
        <header className="co2-chart-card__header">
          <h3 className="co2-chart-card__title">Emission Scope</h3>
          <p className="co2-chart-card__hint">
            Tank-to-wheel vs well-to-tank share of total CO₂e
          </p>
        </header>
        <AppChart
          className="co2-chart-card__canvas"
          option={scopeOption}
          tokens={tokens}
          height={280}
          ariaLabel="Tank-to-wheel versus well-to-tank CO2e split"
        />
      </section>

      <section className="co2-chart-card" aria-label="Emissions by leg chart">
        <header className="co2-chart-card__header">
          <h3 className="co2-chart-card__title">By Transport Leg</h3>
          <p className="co2-chart-card__hint">
            CO₂e contribution for each origin–destination leg
          </p>
        </header>
        <AppChart
          className="co2-chart-card__canvas"
          option={legsOption}
          tokens={tokens}
          empty={!hasLegs}
          emptyMessage="No leg breakdown available"
          height={280}
          ariaLabel="CO2e by transport leg"
        />
      </section>

      <section className="co2-chart-card" aria-label="Emissions by mode chart">
        <header className="co2-chart-card__header">
          <h3 className="co2-chart-card__title">By Transport Mode</h3>
          <p className="co2-chart-card__hint">
            Combined CO₂e across sea, road, rail, and other modes
          </p>
        </header>
        <AppChart
          className="co2-chart-card__canvas"
          option={modeOption}
          tokens={tokens}
          empty={!hasLegs}
          emptyMessage="No mode breakdown available"
          height={280}
          ariaLabel="CO2e by transport mode"
        />
      </section>
    </div>
  );
}
