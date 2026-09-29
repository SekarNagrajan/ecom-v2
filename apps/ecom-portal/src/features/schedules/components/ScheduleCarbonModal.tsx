// Modified by Sekar Nagarajan (2026-09-17 11:04)
import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import { InputNumber, Typography } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation(["schedules", "common", "modules"]);
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
              {t("carbon.title")}
            </Title>
            <Text type="secondary" className="schedule-drawer-title__meta">
              {t("carbon.subtitle")}
            </Text>
          </div>
        </div>
      }
    >
      <div className="schedule-co2-layout">
        <section
          className="schedule-co2-criteria"
          aria-label={t("carbon.cargoInputsAria")}
        >
          <Text strong className="schedule-co2-section-title">
            {t("carbon.cargoInputs")}
          </Text>
          <div className="schedule-co2-criteria__row">
            <label className="schedule-co2-field">
              <span className="form-field-label">
                {t("carbon.containerQty")} <Text type="danger"> *</Text>
              </span>
              <InputNumber
                size="large"
                min={1}
                max={100}
                value={containerQty}
                onChange={handleQtyChange}
                className="schedule-field-full"
                aria-label={t("carbon.containerQtyAria")}
              />
            </label>
            <label className="schedule-co2-field">
              <span className="form-field-label">
                {t("carbon.cargoWeight")} <Text type="danger"> *</Text>
              </span>
              <InputNumber
                size="large"
                min={1}
                max={1000}
                value={weightTons}
                onChange={handleWeightChange}
                className="schedule-field-full"
                aria-label={t("carbon.cargoWeightAria")}
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
                {t("actions.calculate")}
              </AppButton>
            </div>
          </div>
        </section>

        {result ? (
          <section
            className="schedule-co2-results"
            aria-label={t("carbon.resultsAria")}
          >
            <div className="schedule-co2-results__head">
              <Text strong className="schedule-co2-section-title">
                {t("carbon.resultsTitle")}
              </Text>
            </div>
            <div className="schedule-co2-kpi-grid">
              <div className="schedule-co2-kpi schedule-co2-kpi--total">
                <span className="schedule-co2-kpi__label">
                  {t("carbon.totalCo2e")}
                </span>
                <p className="schedule-co2-kpi__value">
                  {result.totalCo2eTons.toLocaleString()}
                  <span className="schedule-co2-kpi__unit">
                    {" "}
                    {t("carbon.tonsUnit")}
                  </span>
                </p>
                <span className="schedule-co2-kpi__hint">
                  {t("carbon.totalHint")}
                </span>
              </div>
              <div className="schedule-co2-kpi schedule-co2-kpi--ttw">
                <span className="schedule-co2-kpi__label">
                  {t("carbon.tankToWheel")}
                </span>
                <p className="schedule-co2-kpi__value">
                  {result.ttwCo2eTons.toLocaleString()}
                  <span className="schedule-co2-kpi__unit">
                    {" "}
                    {t("carbon.tonsUnit")}
                  </span>
                </p>
                <span className="schedule-co2-kpi__hint">
                  {t("carbon.tankToWheelHint")}
                </span>
              </div>
              <div className="schedule-co2-kpi schedule-co2-kpi--wtt">
                <span className="schedule-co2-kpi__label">
                  {t("carbon.wellToTank")}
                </span>
                <p className="schedule-co2-kpi__value">
                  {result.wttCo2eTons.toLocaleString()}
                  <span className="schedule-co2-kpi__unit">
                    {" "}
                    {t("carbon.tonsUnit")}
                  </span>
                </p>
                <span className="schedule-co2-kpi__hint">
                  {t("carbon.wellToTankHint")}
                </span>
              </div>
            </div>
          </section>
        ) : (
          <div className="schedule-co2-idle">
            <AppIcon icon={Icons.calculator} size={28} />
            <Text strong>{t("carbon.idleTitle")}</Text>
            <Text type="secondary" className="schedule-co2-idle__hint">
              {t("carbon.idleHint")}
            </Text>
          </div>
        )}

        <aside
          className="schedule-co2-note"
          aria-label={t("carbon.methodologyAria")}
        >
          <AppIcon icon={Icons.info} size={16} />
          <div>
            <Text strong className="schedule-co2-note__title">
              {t("carbon.methodologyTitle")}
            </Text>
            <Text type="secondary" className="schedule-co2-note__text">
              {t("carbon.methodologyText")}
            </Text>
          </div>
        </aside>
      </div>
    </AppDrawer>
  );
}
