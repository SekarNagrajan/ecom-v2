// Modified by Sekar Nagarajan (2026-09-15 12:31)
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import {
  createCarbonInputSchema,
  type CarbonInput,
  type CarbonInputFormValues,
} from "../types/carbon.types";

/** Demo defaults — SGSIN→NLRTM resolves to a 4-leg multimodal showcase. */
const DEFAULT_VALUES: CarbonInputFormValues = {
  origin: "SGSIN",
  destination: "NLRTM",
  cargoWeightKg: 14000,
  equipment: "40HC",
  containerCount: 1,
  fuelType: "VLSFO",
  unit: "kg",
};

export function useCarbonCalculator() {
  const { t, i18n } = useTranslation(["carbon-calculator", "common"]);
  const [activeInput, setActiveInput] = useState<CarbonInput | null>(null);
  const schema = useMemo(
    () => createCarbonInputSchema(t),
    [t, i18n.language],
  );

  const form = useForm<CarbonInputFormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
    mode: "onSubmit",
  });

  const handleCalculate = form.handleSubmit((values) => {
    const parsed = schema.parse(values);
    // Omit legs so the mock engine expands a multimodal showcase itinerary
    // (scope / leg / mode charts need varied series data).
    const input: CarbonInput = { ...parsed };
    setActiveInput(input);
  });

  const handleReset = () => {
    form.reset(DEFAULT_VALUES);
    setActiveInput(null);
  };

  return {
    form,
    activeInput,
    handleCalculate,
    handleReset,
  };
}
