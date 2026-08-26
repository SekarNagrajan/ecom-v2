// Created by Sekar Nagarajan (2026-08-26 12:19)
import { useToast } from "@solverminds/shared-ui/hooks";
import { useState } from "react";

import { useSubmitSiMutation } from "../api/si.queries";

export function useSiWizard(siId: string) {
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [confirmationSiNo, setConfirmationSiNo] = useState<string | null>(null);
  const submitMutation = useSubmitSiMutation();

  const handleNext = (stepCount: number) => {
    setCurrentStep((prev) => Math.min(prev + 1, stepCount - 1));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    try {
      const res = await submitMutation.mutateAsync(siId);
      const siNo = res.data?.siNo ?? `SIN-${siId}`;
      setConfirmationSiNo(siNo);
      toast.success("Shipping Instruction submitted successfully to ESL");
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
  };
}
