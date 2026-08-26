// Modified by Sekar Nagarajan (2026-08-26 16:30)
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@solverminds/auth";
import { useToast } from "@solverminds/shared-ui/hooks";
import { useMutation } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";

import { submitContactUs } from "../api/contact-us.api";
import {
  useContactUsCountries,
  useContactUsStates,
} from "../api/contact-us.queries";
import {
  contactUsGuestSchema,
  contactUsSchema,
  type ContactUsFormData,
} from "../types/contact-us.schema";

interface UseContactUsControllerOptions {
  defaultSubject?: string;
}

export function useContactUsController(
  options: UseContactUsControllerOptions = {}
) {
  const toast = useToast();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  const schema = isAuthenticated ? contactUsSchema : contactUsGuestSchema;

  const form = useForm<ContactUsFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: isAuthenticated ? (user?.name ?? "") : "",
      companyName: isAuthenticated ? (user?.company ?? "") : "",
      country: "",
      state: "",
      city: "",
      phone: "",
      mobile: "",
      email: isAuthenticated ? (user?.email ?? "") : "",
      subject: options.defaultSubject ?? "",
      message: "",
    },
  });

  const watchedCountry = useWatch({ control: form.control, name: "country" });
  const countriesQuery = useContactUsCountries();
  const statesQuery = useContactUsStates(watchedCountry ?? "");

  const mutation = useMutation({
    mutationFn: submitContactUs,
    onSuccess: (data) => {
      toast.success(data.message);
      if (isAuthenticated) {
        form.setValue("subject", "");
        form.setValue("message", "");
      } else {
        form.reset();
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send message. Please try again.");
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    mutation.mutate(data);
  });

  const handleReset = () => {
    if (isAuthenticated) {
      form.setValue("subject", "");
      form.setValue("message", "");
    } else {
      form.reset();
    }
  };

  const handleDismiss = () => {
    mutation.reset();
    handleReset();
  };

  return {
    form,
    handleSubmit,
    handleReset,
    handleDismiss,
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
