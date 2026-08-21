import { Card, theme } from 'antd';
import type { ReactNode } from 'react';

/**
 * Outlined white Card used to frame "grid-like" views (list, kanban) inside
 * `DataView`. Sits flush against the page wash on the outside while giving
 * the AG Grid frame / kanban columns inside a small inner padding.
 *
 * Card view intentionally does NOT wrap itself in this surface — it already
 * renders its own gray wash with white card items, so an extra outlined Card
 * here would stack two containers and swallow the gutter between cards.
 */
export function DataViewGridSurface({ children }: { children: ReactNode }) {
  const { token } = theme.useToken();

  return (
    <Card
      variant="outlined"
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: token.borderRadiusSM,
      }}
      styles={{
        body: {
          padding: token.paddingSM,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
    >
      {children}
    </Card>
  );
}
