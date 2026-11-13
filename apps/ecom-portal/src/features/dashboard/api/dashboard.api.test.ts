// Created by Sekar Nagarajan (2026-10-16 23:45)
import { describe, expect, it } from 'vitest';

import { DASHBOARD_QUICK_ACTIONS, dashboardApi } from './dashboard.api';

describe('dashboardApi (fixture-backed)', () => {
  it('serves a summary whose KPIs match the ongoing table and carries every section', async () => {
    const summary = await dashboardApi.getSummary();
    expect(summary.counts.totCou).toBe(summary.shipments.length);
    expect(summary.quickActions.map(a => a.key)).toEqual(DASHBOARD_QUICK_ACTIONS.map(a => a.key));
    expect(summary.quickActions.every(a => typeof a.count === 'number')).toBe(true);
    expect(summary.planning.calendar).toHaveLength(3);
    expect(Object.keys(summary.intelligence.breakdowns).sort()).toEqual(
      ['consignee', 'destination', 'origin', 'pickup', 'pod', 'pol'],
    );
  });

  it('serves volume analytics for the requested stage and period', async () => {
    const volume = await dashboardApi.getVolumeAnalytics({ stage: 'si', period: 'Weekly' });
    expect(volume.stage).toBe('si');
    expect(volume.period).toBe('Weekly');
    expect(volume.kpis.map(k => k.label)).toEqual(['This Week', 'This Month', 'This Quarter', 'This Year']);
    expect(volume.trend).toHaveLength(12);
  });
});
