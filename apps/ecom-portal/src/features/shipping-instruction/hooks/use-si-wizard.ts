// Modified by Sekar Nagarajan (2026-08-28 11:15)
import { useToast } from "@solverminds/shared-ui/hooks";
import { useState } from "react";

import { useSubmitSiMutation } from "../api/si.queries";
import type { SIDTO } from "../types/si.types";

export function useSiWizard(siId: string, serverDetail: SIDTO | undefined) {
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [confirmationSiNo, setConfirmationSiNo] = useState<string | null>(null);
  const [draft, setDraft] = useState<SIDTO | undefined>(serverDetail);
  const [syncedId, setSyncedId] = useState<string | undefined>(
    serverDetail?.id,
  );
  const submitMutation = useSubmitSiMutation();

  if (serverDetail && serverDetail.id !== syncedId) {
    setSyncedId(serverDetail.id);
    setDraft(serverDetail);
    setCurrentStep(0);
  }

  const handleNext = (stepCount: number) => {
    setCurrentStep((prev) => Math.min(prev + 1, stepCount - 1));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const updateDraft = (partial: Partial<SIDTO>) => {
    setDraft((prev) => (prev ? { ...prev, ...partial } : prev));
  };

  const handleSubmit = async () => {
    try {
      const res = await submitMutation.mutateAsync(siId);
      const siNo = res.data?.siNo ?? `SIN-${siId}`;
      setConfirmationSiNo(siNo);
      toast.success("Shipping Instruction submitted successfully");
    } catch {
      toast.error("Failed to submit Shipping Instruction. Please try again.");
    }
  };

  return {
    currentStep,
    setCurrentStep,
    confirmationSiNo,
    isSubmitting: submitMutation.isPending,
    handleNext,
    handlePrevious,
    handleSubmit,
    draft,
    updateDraft,
  };
}
