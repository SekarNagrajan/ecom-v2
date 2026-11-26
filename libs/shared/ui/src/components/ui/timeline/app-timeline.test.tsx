// @vitest-environment jsdom
// Created by Sekar Nagarajan (2026-11-13 02:00)
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AppTimeline } from './app-timeline';
import { sequentialTimelineStatus } from './timeline-utils';

describe('sequentialTimelineStatus', () => {
  it('marks done steps, the first pending step as current and the rest upcoming', () => {
    const steps = [
      { k: 'a', past: true },
      { k: 'b', past: true },
      { k: 'c', past: false },
      { k: 'd', past: false },
    ];
    expect(sequentialTimelineStatus(steps, (s) => s.past).map((s) => s.status)).toEqual([
      'done',
      'done',
      'current',
      'upcoming',
    ]);
  });

  it('has no current step when everything is done', () => {
    expect(sequentialTimelineStatus([{ past: true }], (s) => s.past)[0].status).toBe('done');
  });
});

describe('AppTimeline', () => {
  it('renders an accessible list with the current step flagged and status text visible', () => {
    render(
      <AppTimeline
        ariaLabel="Journey"
        items={[
          { id: '1', title: 'Booked', status: 'done' },
          { id: '2', title: 'Loaded', status: 'current' },
          { id: '3', title: 'Delivered', status: 'upcoming' },
        ]}
      />
    );
    const list = screen.getByRole('list', { name: 'Journey' });
    expect(list.querySelectorAll('li')).toHaveLength(3);
    expect(screen.getByText('Loaded').closest('li')?.getAttribute('aria-current')).toBe('step');
    expect(screen.getByText('Completed')).toBeTruthy();
    expect(screen.getByText('In progress')).toBeTruthy();
  });

  it('shows the empty text and the skeleton state', () => {
    const { rerender } = render(<AppTimeline items={[]} emptyText="Nothing yet" />);
    expect(screen.getByRole('status').textContent).toBe('Nothing yet');
    rerender(<AppTimeline items={[]} loading skeletonCount={2} />);
    expect(document.querySelector('[aria-busy="true"]')).toBeTruthy();
  });
});
