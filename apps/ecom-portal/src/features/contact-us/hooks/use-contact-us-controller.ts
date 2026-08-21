// Modified by Antigravity (2026-08-21)
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@solverminds/auth';
import { useToast } from '@solverminds/shared-ui/hooks';

import { submitContactUs } from '../api/contact-us.api';
import { contactUsKeys } from '../api/contact-us.keys';
import {
  contactUsSchema,
  contactUsGuestSchema,
  type ContactUsFormData,
} from '../types/contact-us.schema';

interface CountryOption {
  code: string;
  name: string;
}

interface StateOption {
  code: string;
  name: string;
}

interface UseContactUsControllerOptions {
  defaultSubject?: string;
}

export function useContactUsController(options: UseContactUsControllerOptions = {}) {
  const toast = useToast();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  // Pick the right schema based on auth state
  const schema = isAuthenticated ? contactUsSchema : contactUsGuestSchema;

  const form = useForm<ContactUsFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: isAuthenticated ? (user?.name ?? '') : '',
      companyName: isAuthenticated ? (user?.company ?? '') : '',
      country: '',
      state: '',
      city: '',
      phone: '',
      mobile: '',
      email: isAuthenticated ? (user?.email ?? '') : '',
      subject: options.defaultSubject ?? '',
      message: '',
    },
  });

  const watchedCountry = form.watch('country');

  // ── Country list query ────────────────────────────────────────
  const countriesQuery = useQuery<{ countries: CountryOption[] }>({
    queryKey: contactUsKeys.countries(),
    queryFn: async () => {
      const res = await fetch('/api/countries');
      if (!res.ok) throw new Error('Failed to fetch countries');
      return res.json();
    },
    staleTime: Infinity, // Countries don't change
  });

  // ── State list query (depends on selected country) ────────────
  const statesQuery = useQuery<{ states: StateOption[] }>({
    queryKey: contactUsKeys.states(watchedCountry),
    queryFn: async () => {
      const res = await fetch(`/api/states?country=${watchedCountry}`);
      if (!res.ok) throw new Error('Failed to fetch states');
      return res.json();
    },
    enabled: !!watchedCountry,
  });

  // ── Submit mutation ───────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: submitContactUs,
    onSuccess: (data) => {
      toast.success(data.message);
      // Reset only subject + message for authenticated users (legacy behavior)
      if (isAuthenticated) {
        form.setValue('subject', '');
        form.setValue('message', '');
      } else {
        form.reset();
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send message. Please try again.');
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    mutation.mutate(data);
  });

  const handleReset = () => {
    if (isAuthenticated) {
      form.setValue('subject', '');
      form.setValue('message', '');
    } else {
      form.reset();
    }
  };

  return {
    form,
    handleSubmit,
    handleReset,
    isAuthenticated,
    user,
    isSubmitting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    countries: countriesQuery.data?.countries ?? [],
    countriesLoading: countriesQuery.isLoading,
    states: statesQuery.data?.states ?? [],
    statesLoading: statesQuery.isLoading,
  };
}
