// Created by Sekar Nagarajan (2026-08-28 11:30)
import { useState } from "react";

import type { BLDTO } from "../types/bl.types";

/**
 * Wizard step + draft state. When server detail arrives (or blNo changes),
 * reset the editable draft — avoids stuck "loading" when useState only
 * captured undefined on first mount.
 */
export function useBLWizard(
  serverDetail: BLDTO | undefined,
  stepCount: number,
) {
  const [currentStep, setCurrentStep] = useState(0);
  const [draft, setDraft] = useState<BLDTO | undefined>(serverDetail);
  const [syncedBlNo, setSyncedBlNo] = useState<string | undefined>(
    serverDetail?.blNo,
  );

  const maxStep = Math.max(stepCount - 1, 0);

  if (serverDetail && serverDetail.blNo !== syncedBlNo) {
    setSyncedBlNo(serverDetail.blNo);
    setDraft(serverDetail);
    setCurrentStep(0);
  }

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, maxStep));
  const goPrevious = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const updateDraft = (partial: Partial<BLDTO>) => {
    setDraft((prev) => (prev ? { ...prev, ...partial } : prev));
  };

  return {
    currentStep,
    setCurrentStep: (step: number) =>
      setCurrentStep(Math.min(Math.max(step, 0), maxStep)),
    goNext,
    goPrevious,
    draft,
    setDraft,
    updateDraft,
    maxStep,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === maxStep,
  };
}
