// Created by Antigravity (2026-08-22 09:40)
import { useMutation } from '@tanstack/react-query';
import { bookingApi } from '../api/booking.api';
import { useBookingStore } from '../stores/booking.store';
import { message } from 'antd';
import { useState } from 'react';
import type { BookingConfirmation } from '../types/booking.types';

export function useBookingWizard(isEditMode = false) {
  const { currentStep, setCurrentStep, payload, resetWizard } = useBookingStore();
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);

  const submitMutation = useMutation({
    mutationFn: () => isEditMode ? bookingApi.amendBooking(payload) : bookingApi.submitBooking(payload),
    onSuccess: (response) => {
      if (response.data) {
        setConfirmation(response.data);
        message.success('Booking submitted successfully');
      }
    },
    onError: () => {
      message.error('Failed to submit booking. Please try again.');
    }
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
    handleStartOver
  };
}
