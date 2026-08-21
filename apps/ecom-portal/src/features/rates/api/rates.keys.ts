// Modified by sekar nagarajan (2026-08-21 23:30)
import { ContractFilters, SurchargeFilters, TariffFilters } from '../types/rates.types';

export const rateKeys = {
  all: ['rates'] as const,
  tariffs: (filters?: TariffFilters) => [...rateKeys.all, 'tariffs', filters] as const,
  surcharges: (filters?: SurchargeFilters) => [...rateKeys.all, 'surcharges', filters] as const,
  contracts: (filters?: ContractFilters) => [...rateKeys.all, 'contracts', filters] as const,
  quotes: () => [...rateKeys.all, 'quotes'] as const,
  quoteDetail: (id: string) => [...rateKeys.quotes(), id] as const,
};
