// Modified by Sekar Nagarajan (2026-09-28 16:17)
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { showPreferenceToast } from "../../theme/utils/show-preference-toast";
import { bookingApi } from "../api/booking.api";
import { bookingKeys } from "../api/booking.keys";
import { useBookingStore } from "../stores/booking.store";
import type { BookingConfirmation } from "../types/booking.types";

export function useBookingWizard(isEditMode = false) {
  const queryClient = useQueryClient();
  const { currentStep, setCurrentStep, payload, resetWizard } =
    useBookingStore();
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(
    null,
  );

  const submitMutation = useMutation({
    mutationFn: () =>
      isEditMode
        ? bookingApi.amendBooking(payload)
        : bookingApi.submitBooking(payload),
    onSuccess: (response) => {
      if (response.data) {
        setConfirmation(response.data);
      }
      // Force list refresh so a duplicated (or any new) booking appears at the top of AG Grid.
      void queryClient.invalidateQueries({
        queryKey: bookingKeys.list(),
        refetchType: "all",
      });
      void queryClient.invalidateQueries({
        queryKey: bookingKeys.all,
        refetchType: "all",
      });
    },
    onError: () => {
      showPreferenceToast(
        "error",
        "Failed to submit booking. Please try again.",
      );
    },
  });

  const handleStartOver = () => {
    resetWizard();
    setConfirmation(null);
  };

  return {
    currentStep,
    setCurrentStep,
    isSubmitting: submitMutation.isPending,
    handleSubmit: submitMutation.mutate,
    confirmation,
    handleStartOver,
  };
}
