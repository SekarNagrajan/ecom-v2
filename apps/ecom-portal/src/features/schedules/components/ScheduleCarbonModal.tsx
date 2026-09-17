// Modified by Sekar Nagarajan (2026-09-17 11:04)
import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import { InputNumber, Typography } from "antd";
import { useState } from "react";

import { AppIcon, Icons, NavIcons } from "../../../components/icons";
import { calculateCarbonEmissions } from "../mocks/schedules.mock";
import type {
  CarbonCalculationResult,
  ScheduleItem,
} from "../types/schedules.types";

const { Text, Title } = Typography;

interface ScheduleCarbonModalProps {
  schedule: ScheduleItem | null;
  open: boolean;
  onClose: () => void;
}

export function ScheduleCarbonModal({
  schedule,
  open,
  onClose,
}: ScheduleCarbonModalProps) {
  const [boundScheduleId, setBoundScheduleId] = useState<string | null>(null);
  const [containerQty, setContainerQty] = useState(1);
  const [weightTons, setWeightTons] = useState(14);
  const [result, setResult] = useState<CarbonCalculationResult | null>(null);

  if (!schedule) return null;

  // Reset inputs when a different schedule opens (avoid stale results).
  if (boundScheduleId !== schedule.id) {
    setBoundScheduleId(schedule.id);
    setContainerQty(1);
    setWeightTons(14);
    setResult(null);
  }

  const routeLabel = `${schedule.polPortName} (${schedule.polPortId}) → ${schedule.podPortName} (${schedule.podPortId})`;

  const handleQtyChange = (val: number | null) => {
    setContainerQty(val || 1);
    setResult(null);
  };

  const handleWeightChange = (val: number | null) => {
    setWeightTons(val || 14);
    setResult(null);
  };

  const handleCalculate = () => {
    setResult(
      calculateCarbonEmissions(
        routeLabel,
        containerQty,
        weightTons,
        schedule.distanceKm,
      ),
    );
  };

  const handleClose = () => {
    setResult(null);
    onClose();
  };

  return (
    <AppDrawer
      open={open}
      onClose={handleClose}
      width={660}
      destroyOnClose
      classNames={{ body: "schedule-drawer-body custom-scroll" }}
      title={
        <div className="schedule-drawer-title">
          <AppIcon icon={NavIcons.carbon} size={20} />
          <div>
            <Title level={4} className="schedule-drawer-title__text">
              Carbon Footprint
            </Title>
            <Text type="secondary" className="schedule-drawer-title__meta">
              Estimate CO₂e for this schedule voyage
            </Text>
          </div>
        </div>
      }
    >
      <div className="schedule-co2-layout">
        <section className="schedule-co2-criteria" aria-label="Cargo inputs">
          <Text strong className="schedule-co2-section-title">
            Cargo inputs
          </Text>
          <div className="schedule-co2-criteria__row">
            <label className="schedule-co2-field">
              <span className="form-field-label">
                Container quantity (TEU) <Text type="danger"> *</Text>
              </span>
              <InputNumber
                size="large"
                min={1}
                max={100}
                value={containerQty}
                onChange={handleQtyChange}
                className="schedule-field-full"
                aria-label="Container quantity in TEU"
              />
            </label>
            <label className="schedule-co2-field">
              <span className="form-field-label">
                Cargo weight (metric tons) <Text type="danger"> *</Text>
              </span>
              <InputNumber
                size="large"
                min={1}
                max={1000}
                value={weightTons}
                onChange={handleWeightChange}
                className="schedule-field-full"
                aria-label="Cargo weight in metric tons"
              />
            </label>
            <div className="schedule-co2-actions-field">
              <span className="schedule-co2-actions-field__spacer form-field-label">
                &nbsp;
              </span>
              <AppButton
                type="primary"
                size="large"
                icon={<AppIcon icon={Icons.calculator} size={16} />}
                className="schedule-co2-calc-btn"
                onClick={handleCalculate}
              >
                Calculate
              </AppButton>
            </div>
          </div>
        </section>

        {result ? (
          <section
            className="schedule-co2-results"
            aria-label="Emission results"
          >
            <div className="schedule-co2-results__head">
              <Text strong className="schedule-co2-section-title">
                Estimated CO₂e breakdown
              </Text>
            </div>
            <div className="schedule-co2-kpi-grid">
              <div className="schedule-co2-kpi schedule-co2-kpi--total">
                <span className="schedule-co2-kpi__label">Total CO₂e</span>
                <p className="schedule-co2-kpi__value">
                  {result.totalCo2eTons.toLocaleString()}
                  <span className="schedule-co2-kpi__unit"> tons</span>
                </p>
                <span className="schedule-co2-kpi__hint">
                  Combined lifecycle
                </span>
              </div>
              <div className="schedule-co2-kpi schedule-co2-kpi--ttw">
                <span className="schedule-co2-kpi__label">Tank-to-wheel</span>
                <p className="schedule-co2-kpi__value">
                  {result.ttwCo2eTons.toLocaleString()}
                  <span className="schedule-co2-kpi__unit"> tons</span>
                </p>
                <span className="schedule-co2-kpi__hint">
                  Direct vessel burn
                </span>
              </div>
              <div className="schedule-co2-kpi schedule-co2-kpi--wtt">
                <span className="schedule-co2-kpi__label">Well-to-tank</span>
                <p className="schedule-co2-kpi__value">
                  {result.wttCo2eTons.toLocaleString()}
                  <span className="schedule-co2-kpi__unit"> tons</span>
                </p>
                <span className="schedule-co2-kpi__hint">
                  Upstream fuel production
                </span>
              </div>
            </div>
          </section>
        ) : (
          <div className="schedule-co2-idle">
            <AppIcon icon={Icons.calculator} size={28} />
            <Text strong>Ready to estimate</Text>
            <Text type="secondary" className="schedule-co2-idle__hint">
              Enter TEU and cargo weight, then calculate to see the CO₂e
              breakdown for this voyage.
            </Text>
          </div>
        )}

        <aside className="schedule-co2-note" aria-label="Methodology notice">
          <AppIcon icon={Icons.info} size={16} />
          <div>
            <Text strong className="schedule-co2-note__title">
              Methodology
            </Text>
            <Text type="secondary" className="schedule-co2-note__text">
              Estimates follow GLEC and IMO guidance using 8.5 g CO₂ per
              tonne-km for ocean container vessels. Actual emissions may vary
              with weather, speed, and port congestion.
            </Text>
          </div>
        </aside>
      </div>
    </AppDrawer>
  );
}
