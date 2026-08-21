import { theme as antdTheme } from 'antd';
import type { ReactNode } from 'react';

/**
 * Wrapper applied around every AG Grid floating filter input (text,
 * number, date, set) so the input has consistent horizontal breathing
 * room across density levels and never touches the column edges.
 *
 * The inner control sizes itself via AntD's `size="small"` token
 * (`controlHeightSM`); vertical breathing room comes from the surrounding
 * `floatingFiltersHeight` row being one tier taller than that, with the
 * shell flex-centering the input within the row.
 *
 * IMPORTANT: do NOT force an explicit height smaller than `controlHeightSM`
 * on the inner control. `<Select mode="multiple">` selected chips honor
 * AntD's small token and will overflow a smaller container.
 */
export function FloatingFilterShell({ children }: { children: ReactNode }) {
  const { token } = antdTheme.useToken();

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        paddingInline: token.paddingXS,
      }}
    >
      {children}
    </div>
  );
}
