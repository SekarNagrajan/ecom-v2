// @vitest-environment jsdom
// Modified by Sekar Nagarajan (2026-11-16 14:30) — popover category filter coverage
import { cleanup, fireEvent, render as rtlRender, screen, within } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AppConfigContext } from '../../providers/app-config-context';
import { DEFAULT_APP_CONFIG } from '../../providers/defaults';
import { AppNotificationCenter } from './app-notification-center';

afterEach(() => cleanup());

/** AppButton reads the app config; the bare context keeps jsdom away from antd's layered CSS. */
const render = (ui: ReactElement) =>
  rtlRender(
    <AppConfigContext.Provider value={{ ...DEFAULT_APP_CONFIG, effectiveThemeMode: 'light' }}>
      {ui}
    </AppConfigContext.Provider>
  );

const items = [
  { id: 'a', title: 'Unread one', read: false, category: 'BOOKING' },
  { id: 'b', title: 'Read one', read: true, category: 'PAYMENT' },
];

describe('AppNotificationCenter', () => {
  it('starts on the unread filter when unread items exist and can switch to all', () => {
    render(<AppNotificationCenter items={items} />);
    expect(screen.getByText('Unread one')).toBeTruthy();
    expect(screen.queryByText('Read one')).toBeNull();
    fireEvent.click(screen.getByText('All'));
    expect(screen.getByText('Read one')).toBeTruthy();
  });

  it('marks an item read on activation and exposes mark-all', () => {
    const onMarkRead = vi.fn();
    const onMarkAllRead = vi.fn();
    render(
      <AppNotificationCenter items={items} onMarkRead={onMarkRead} onMarkAllRead={onMarkAllRead} />
    );
    fireEvent.click(screen.getByRole('button', { name: /Unread one/ }));
    expect(onMarkRead).toHaveBeenCalledWith(expect.objectContaining({ id: 'a' }));
    fireEvent.click(screen.getByText('Mark all as read'));
    expect(onMarkAllRead).toHaveBeenCalledTimes(1);
  });

  it('shows the caught-up message when everything is read on the unread filter', () => {
    render(
      <AppNotificationCenter items={[{ id: 'b', title: 'Read one', read: true }]} filter="unread" />
    );
    expect(screen.getByRole('status').textContent).toContain('caught up');
  });

  it('filters by category in the popover variant and can show all again', () => {
    render(
      <AppNotificationCenter
        variant="popover"
        categoryFilter
        items={[
          {
            id: '1',
            title: 'Booking Confirmed',
            read: true,
            category: 'BOOKING',
            action: { label: 'View booking' },
          },
          {
            id: '2',
            title: 'Payment Failed',
            read: false,
            category: 'PAYMENT',
            action: { label: 'Retry payment' },
          },
        ]}
      />
    );
    const chips = screen.getByRole('group', { name: 'Filter by category' });
    expect(screen.getByText('Booking Confirmed')).toBeTruthy();
    expect(screen.getByText('Payment Failed')).toBeTruthy();
    fireEvent.click(within(chips).getByRole('button', { name: /Payment/ }));
    expect(screen.queryByText('Booking Confirmed')).toBeNull();
    expect(screen.getByText('Payment Failed')).toBeTruthy();
    fireEvent.click(within(chips).getByRole('button', { name: /^All/ }));
    expect(screen.getByText('Booking Confirmed')).toBeTruthy();
  });

  it('fires onAction from the inline CTA without relying on a reserved column', () => {
    const onAction = vi.fn();
    const onMarkRead = vi.fn();
    render(
      <AppNotificationCenter
        variant="popover"
        items={[
          {
            id: '2',
            title: 'Payment Failed',
            read: false,
            category: 'PAYMENT',
            action: { label: 'Retry payment', href: '/payments' },
          },
        ]}
        onAction={onAction}
        onMarkRead={onMarkRead}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Retry payment — Payment Failed/ }));
    expect(onAction).toHaveBeenCalledWith(expect.objectContaining({ id: '2' }));
  });
});
