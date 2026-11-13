// @vitest-environment jsdom
// Created by Sekar Nagarajan (2026-11-13 03:20)
import { fireEvent, render as rtlRender, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { AppConfigContext } from '../../providers/app-config-context';
import { DEFAULT_APP_CONFIG } from '../../providers/defaults';
import { AppNotificationCenter } from './app-notification-center';

/** AppButton reads the app config; the bare context keeps jsdom away from antd's layered CSS. */
const render = (ui: ReactElement) =>
  rtlRender(
    <AppConfigContext.Provider value={{ ...DEFAULT_APP_CONFIG, effectiveThemeMode: 'light' }}>
      {ui}
    </AppConfigContext.Provider>
  );

const items = [
  { id: 'a', title: 'Unread one', read: false },
  { id: 'b', title: 'Read one', read: true },
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
});
