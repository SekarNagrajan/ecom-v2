// Landing API key factory — keeps query keys co-located with the feature
export const landingKeys = {
  all: ['landing'] as const,
  ports: () => [...landingKeys.all, 'ports'] as const,
  portSearch: (query: string) => [...landingKeys.ports(), query] as const,
  equipmentTypes: () => [...landingKeys.all, 'equipment-types'] as const,
  tabConfig: () => [...landingKeys.all, 'tab-config'] as const,
};
