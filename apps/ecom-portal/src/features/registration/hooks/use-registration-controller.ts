// Modified by sekar nagarajan (2026-08-21)
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@solverminds/shared-ui/hooks';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { FieldErrors, useForm } from 'react-hook-form';

import { submitRegistration } from '../api/registration.api';
import { RegistrationFormData, RegistrationSchema } from '../types/registration.schema';

interface UseRegistrationControllerProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function useRegistrationController({ onSuccess, onCancel }: UseRegistrationControllerProps = {}) {
  const [currentStep, setCurrentStep] = useState(0);
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: (data: RegistrationFormData) => submitRegistration(data),
    onSuccess: () => {
      toast.success('Registration successful! Please check your email for activation.');
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit registration. Please try again.');
    },
  });

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(RegistrationSchema),
    defaultValues: {
      customerType: 'NEW',
      companyName: '',
      country: '',
      location: '',
      address1: '',
      city: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      title: '',
      timezone: '',
      defaultView: '',
      preferredView: '',
      agreeToTerms: false,
      kycFile: undefined,
    },
    mode: 'onTouched', // Validate on blur
  });

  const nextStep = async () => {
    let fieldsToValidate: (keyof RegistrationFormData)[] = [];

    if (currentStep === 0) {
      fieldsToValidate = [
        'customerType', 'companyName', 'country', 'location',
        'address1', 'city', 'companyPhoneCountryCode', 'companyPhoneNo',
        'companyMobileCode', 'companyMobileNo', 'address2', 'postalCode',
        'taxId', 'companyDomain', 'recentBL'
      ];
    } else if (currentStep === 1) {
      fieldsToValidate = [
        'email', 'password', 'confirmPassword',
        'firstName', 'lastName', 'title', 'timezone',
        'defaultView', 'preferredView'
      ];
    } else if (currentStep === 2) {
      fieldsToValidate = ['kycFile'];
    }

    const isValid = await form.trigger(fieldsToValidate);

    if (isValid) {
      setCurrentStep((prev) => Math.min(3, prev + 1));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const submit = async (data: RegistrationFormData) => {
    mutation.mutate(data);
  };

  const onInvalid = (errors: FieldErrors<RegistrationFormData>) => {
    toast.error('Please complete all required fields correctly.');
    const errorKeys = Object.keys(errors);

    const step0Fields = ['customerType', 'companyName', 'country', 'location', 'address1', 'city', 'companyPhoneCountryCode', 'companyPhoneNo', 'companyMobileCode', 'companyMobileNo', 'address2', 'postalCode', 'taxId', 'companyDomain', 'recentBL'];
    const step1Fields = ['email', 'password', 'confirmPassword', 'firstName', 'lastName', 'title', 'timezone', 'defaultView', 'preferredView'];

    if (errorKeys.some(key => step0Fields.includes(key))) {
      setCurrentStep(0);
    } else if (errorKeys.some(key => step1Fields.includes(key))) {
      setCurrentStep(1);
    } else if (errorKeys.includes('kycFile')) {
      setCurrentStep(2);
    }
  };

  return {
    form,
    currentStep,
    nextStep,
    prevStep,
    setStep: setCurrentStep,
    submit: form.handleSubmit(submit, onInvalid),
    isSubmitting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    onCancel
  };
}
