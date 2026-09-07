import { theme } from 'antd';
import { useId } from 'react';

import type { AppEmptyStateVariant } from './types';

type EmptyStateShipArtProps = {
  variant?: AppEmptyStateVariant;
  width?: number | string;
  className?: string;
};

/**
 * Container-ship illustration for empty / error surfaces.
 * Accent fills use the theme primary token so the art tracks tenant branding.
 */
export function EmptyStateShipArt({
  variant = 'filtered',
  width = '100%',
  className,
}: EmptyStateShipArtProps) {
  const reactId = useId();
  const titleId = `${reactId}-title`;
  const descId = `${reactId}-desc`;
  const { token } = theme.useToken();
  const showSparseContainers = variant === 'blank' || variant === 'error';
  const primary = token.colorPrimary;
  const primarySurface = token.colorPrimaryBg;

  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 260 200"
      width={width}
      height="auto"
      role="img"
      aria-labelledby={`${titleId} ${descId}`}
    >
      <title id={titleId}>No records found</title>
      <desc id={descId}>
        A container ship on the water with an empty container slot.
      </desc>

      {/* soft ground */}
      <ellipse
        cx="130"
        cy="176"
        rx="112"
        ry="12"
        fill={primarySurface}
      />

      {/* water */}
      <path
        d="M18 168 Q40 160 62 168 T106 168 T150 168 T194 168 T238 168 L242 182 L16 182 Z"
        fill={primarySurface}
      />
      <path
        d="M18 168 Q40 160 62 168 T106 168 T150 168 T194 168 T238 168"
        fill="none"
        stroke="var(--nova-gray-400, #ced4da)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M30 178 Q48 172 66 178 T102 178 T138 178"
        fill="none"
        stroke="var(--nova-gray-300, #dee2e6)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* hull */}
      <path
        d="M40 128 L214 128 L198 158 Q168 166 100 166 Q62 166 54 158 Z"
        fill="var(--nova-gray-100, #f3f4f6)"
        stroke="var(--nova-gray-600, #717171)"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M46 140 L207 140"
        fill="none"
        stroke={primary}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M48 128 L206 128"
        fill="none"
        stroke="var(--nova-gray-500, #a1a1a1)"
        strokeWidth="1.25"
      />

      {/* bridge / superstructure + funnel */}
      <rect
        x="168"
        y="98"
        width="30"
        height="30"
        rx="3"
        fill="var(--nova-gray-200, #e9ecef)"
        stroke="var(--nova-gray-600, #717171)"
        strokeWidth="1.5"
      />
      <rect
        x="173"
        y="104"
        width="7"
        height="6"
        rx="1"
        fill="var(--nova-gray-500, #a1a1a1)"
      />
      <rect
        x="185"
        y="104"
        width="7"
        height="6"
        rx="1"
        fill="var(--nova-gray-500, #a1a1a1)"
      />
      <rect
        x="176"
        y="86"
        width="9"
        height="12"
        rx="2"
        fill="var(--nova-gray-200, #e9ecef)"
        stroke="var(--nova-gray-600, #717171)"
        strokeWidth="1.5"
      />
      <rect
        x="176"
        y="88"
        width="9"
        height="4"
        fill={primary}
      />

      {/* containers: bottom row */}
      {showSparseContainers ? (
        <>
          <rect
            x="54"
            y="110"
            width="30"
            height="18"
            rx="2.5"
            fill="none"
            stroke="var(--nova-gray-400, #ced4da)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <rect
            x="86"
            y="110"
            width="30"
            height="18"
            rx="2.5"
            fill="var(--nova-gray-100, #f3f4f6)"
            stroke="var(--nova-gray-600, #717171)"
            strokeWidth="1.5"
          />
          <rect
            x="118"
            y="110"
            width="30"
            height="18"
            rx="2.5"
            fill="none"
            stroke="var(--nova-gray-400, #ced4da)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
        </>
      ) : (
        <>
          <rect
            x="54"
            y="110"
            width="30"
            height="18"
            rx="2.5"
            fill={primary}
            stroke="var(--nova-gray-700, #495057)"
            strokeWidth="1.5"
          />
          <rect
            x="86"
            y="110"
            width="30"
            height="18"
            rx="2.5"
            fill="var(--nova-gray-100, #f3f4f6)"
            stroke="var(--nova-gray-600, #717171)"
            strokeWidth="1.5"
          />
          <rect
            x="118"
            y="110"
            width="30"
            height="18"
            rx="2.5"
            fill={primary}
            stroke="var(--nova-gray-700, #495057)"
            strokeWidth="1.5"
          />
          <rect
            x="150"
            y="110"
            width="14"
            height="18"
            rx="2.5"
            fill="var(--nova-gray-100, #f3f4f6)"
            stroke="var(--nova-gray-600, #717171)"
            strokeWidth="1.5"
          />

          {/* containers: middle row */}
          <rect
            x="66"
            y="90"
            width="30"
            height="18"
            rx="2.5"
            fill="var(--nova-gray-100, #f3f4f6)"
            stroke="var(--nova-gray-600, #717171)"
            strokeWidth="1.5"
          />
          <rect
            x="98"
            y="90"
            width="30"
            height="18"
            rx="2.5"
            fill={primary}
            stroke="var(--nova-gray-700, #495057)"
            strokeWidth="1.5"
          />
          <rect
            x="130"
            y="90"
            width="30"
            height="18"
            rx="2.5"
            fill="var(--nova-gray-100, #f3f4f6)"
            stroke="var(--nova-gray-600, #717171)"
            strokeWidth="1.5"
          />

          {/* top: empty dashed slot */}
          <rect
            x="98"
            y="70"
            width="30"
            height="18"
            rx="2.5"
            fill="none"
            stroke="var(--nova-gray-400, #ced4da)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* container ridges */}
          <path
            d="M62 110v18M74 110v18M94 110v18M106 110v18M126 110v18M138 110v18M74 90v18M106 90v18M138 90v18"
            stroke="var(--nova-gray-700, #495057)"
            strokeWidth="1"
            opacity=".45"
          />
        </>
      )}
    </svg>
  );
}
