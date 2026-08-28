// Created by Sekar Nagarajan (2026-08-28 12:09)
import { AppButton } from "@solverminds/shared-ui";
import { Flex, InputNumber, Tooltip } from "antd";

import { AppIcon, Icons } from "../../../components/icons";

interface QuantityStepperProps {
  value?: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

/** Compact − / number / + quantity control for cargo container & commodity qty. */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  disabled = false,
}: QuantityStepperProps) {
  const current =
    typeof value === "number" && !Number.isNaN(value) ? value : min;

  const decrease = () => {
    const next = current - 1;
    if (next >= min) onChange(next);
  };

  const increase = () => {
    const next = current + 1;
    if (max === undefined || next <= max) onChange(next);
  };

  return (
    <Flex align="stretch" className="form-field-full-width booking-qty-stepper">
      <Tooltip title="Decrease">
        <span className="booking-qty-stepper__btn-wrap">
          <AppButton
            aria-label="Decrease"
            size="large"
            disabled={disabled || current <= min}
            icon={<AppIcon icon={Icons.minus} size={16} />}
            onClick={decrease}
            className="booking-qty-stepper__btn booking-qty-stepper__btn--minus"
          />
        </span>
      </Tooltip>
      <InputNumber
        value={value}
        onChange={(next) =>
          onChange(typeof next === "number" && !Number.isNaN(next) ? next : min)
        }
        min={min}
        max={max}
        controls={false}
        size="large"
        disabled={disabled}
        className="booking-qty-stepper__input"
      />
      <Tooltip title="Increase">
        <span className="booking-qty-stepper__btn-wrap">
          <AppButton
            aria-label="Increase"
            size="large"
            disabled={disabled || (max !== undefined && current >= max)}
            icon={<AppIcon icon={Icons.plus} size={16} />}
            onClick={increase}
            className="booking-qty-stepper__btn booking-qty-stepper__btn--plus"
          />
        </span>
      </Tooltip>
    </Flex>
  );
}
