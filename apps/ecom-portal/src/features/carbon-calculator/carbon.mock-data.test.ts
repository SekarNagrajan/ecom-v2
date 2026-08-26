// Modified by Sekar Nagarajan (2026-08-25 13:00)
import { describe, expect, it } from 'vitest';

import {
  computeMockCarbon,
  expectedFixtureTotals,
  MOCK_CARBON_FIXTURE_INPUT,
  mockCarbonLookups,
} from '../../mocks/carbon.mock-data';
import {
  buildCarbonExportFilename,
  carbonInputSchema,
  formatCo2e,
} from './types/carbon.types';

describe('carbon-calculator input schema', () => {
  it('accepts a valid input payload', () => {
    const result = carbonInputSchema.safeParse({
      origin: 'SGSIN',
      destination: 'NLRTM',
      cargoWeightKg: 14000,
      equipment: '40HC',
      containerCount: 1,
      unit: 'kg',
    });
    expect(result.success).toBe(true);
  });

  it('rejects identical origin and destination', () => {
    const result = carbonInputSchema.safeParse({
      origin: 'SGSIN',
      destination: 'SGSIN',
      cargoWeightKg: 14000,
      equipment: '40HC',
      containerCount: 1,
      unit: 'kg',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('differ');
    }
  });

  it('rejects non-positive cargo weight', () => {
    const result = carbonInputSchema.safeParse({
      origin: 'SGSIN',
      destination: 'NLRTM',
      cargoWeightKg: 0,
      equipment: '40HC',
      containerCount: 1,
      unit: 'kg',
    });
    expect(result.success).toBe(false);
  });

  it('rejects LOCODEs that are not 5 characters', () => {
    const result = carbonInputSchema.safeParse({
      origin: 'SIN',
      destination: 'NLRTM',
      cargoWeightKg: 14000,
      equipment: '40HC',
      containerCount: 1,
      unit: 'kg',
    });
    expect(result.success).toBe(false);
  });
});

describe('carbon-calculator format helpers', () => {
  it('formats kg with thousands separators', () => {
    expect(formatCo2e(1808.8, 'kg')).toBe('1,809 kg CO₂e');
  });

  it('formats tonnes with two decimals', () => {
    expect(formatCo2e(1.81, 't')).toBe('1.81 t CO₂e');
  });

  it('builds export filename from lane', () => {
    expect(buildCarbonExportFilename(MOCK_CARBON_FIXTURE_INPUT)).toBe(
      'CarbonEstimate_SGSIN-NLRTM.pdf'
    );
  });
});

describe('carbon-calculator mock engine', () => {
  it('seeds lookups with ports and equipment', () => {
    expect(mockCarbonLookups.ports.length).toBeGreaterThanOrEqual(4);
    expect(mockCarbonLookups.equipment.length).toBeGreaterThanOrEqual(2);
  });

  it('returns known-good totals for the SGSIN→NLRTM fixture', () => {
    const expected = expectedFixtureTotals();
    const result = computeMockCarbon(MOCK_CARBON_FIXTURE_INPUT);

    expect(result.legs[0]?.distanceKm).toBe(expected.distanceKm);
    expect(result.totalCo2eKg).toBe(expected.totalCo2eKg);
    expect(result.totalCo2eTonnes).toBe(expected.totalCo2eTonnes);
    expect(result.methodology.standard).toBe('GLEC');
    expect(result.methodology.version).toBe('mock-1.0');
    expect(result.ttwCo2eKg + result.wttCo2eKg).toBe(result.totalCo2eKg);
  });

  it('is deterministic for identical inputs', () => {
    const a = computeMockCarbon(MOCK_CARBON_FIXTURE_INPUT);
    const b = computeMockCarbon(MOCK_CARBON_FIXTURE_INPUT);
    expect(a.totalCo2eKg).toBe(b.totalCo2eKg);
    expect(a.totalCo2eTonnes).toBe(b.totalCo2eTonnes);
    expect(a.legs[0]?.distanceKm).toBe(b.legs[0]?.distanceKm);
  });

  it('supports multi-leg summation', () => {
    const result = computeMockCarbon({
      ...MOCK_CARBON_FIXTURE_INPUT,
      legs: [
        { mode: 'ROAD', from: 'SGSIN', to: 'SGSIN', distanceKm: 50 },
        { mode: 'SEA', from: 'SGSIN', to: 'NLRTM' },
      ],
    });
    expect(result.legs).toHaveLength(2);
    expect(result.totalCo2eKg).toBe(
      result.legs[0]!.co2eKg + result.legs[1]!.co2eKg
    );
  });
});
