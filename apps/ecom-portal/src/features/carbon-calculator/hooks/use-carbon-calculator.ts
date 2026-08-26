// Modified by Sekar Nagarajan (2026-08-25 13:00)
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  carbonInputSchema,
  type CarbonInput,
  type CarbonInputFormValues,
} from '../types/carbon.types';

const DEFAULT_VALUES: CarbonInputFormValues = {
  origin: '',
  destination: '',
  cargoWeightKg: 14000,
  equipment: '40HC',
  containerCount: 1,
  fuelType: 'VLSFO',
  unit: 'kg',
};

export function useCarbonCalculator() {
  const [activeInput, setActiveInput] = useState<CarbonInput | null>(null);

  const form = useForm<CarbonInputFormValues>({
    resolver: zodResolver(carbonInputSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onSubmit',
  });

  const handleCalculate = form.handleSubmit((values) => {
    const parsed = carbonInputSchema.parse(values);
    const input: CarbonInput = {
      ...parsed,
      legs: [
        {
          mode: 'SEA',
          from: parsed.origin,
          to: parsed.destination,
        },
      ],
    };
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
