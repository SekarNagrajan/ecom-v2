// Created by Sekar Nagarajan (2026-11-13 02:40)
/**
 * KPI tile: label, headline value with unit, period delta and an optional sparkline. Becomes a
 * button when `onClick` is given so a dashboard figure can drill into the filtered list.
 */
import { Skeleton, theme } from 'antd';
import type { ReactNode } from 'react';

import { cn } from '../../utils/cn';
import { AppSparkline } from './app-sparkline';

export type AppKpiTone = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';

export interface AppKpiDelta {
  /** Signed percentage or absolute change. */
  value: number;
  /** e.g. "vs last month" */
  label?: ReactNode;
  /** Format the number; defaults to `${sign}${abs}%`. */
  format?: (value: number) => string;
  /** When false (costs, delays) a rise is bad and a drop is good. */
  positiveIsGood?: boolean;
}

export interface AppKpiTileProps {
  label: ReactNode;
  value: ReactNode;
  unit?: ReactNode;
  caption?: ReactNode;
  delta?: AppKpiDelta;
  sparkline?: readonly number[];
  icon?: ReactNode;
  tone?: AppKpiTone;
  selected?: boolean;
  loading?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
}

function KpiTileStyles() {
  const { token } = theme.useToken();
  const css = `
.sm-kpi { position: relative; display: flex; flex-direction: column; gap: ${token.marginXXS}px; min-width: 0; padding: ${token.paddingMD}px; border-radius: ${token.borderRadiusLG}px; border: 1px solid ${token.colorBorderSecondary}; background: ${token.colorBgContainer}; color: ${token.colorText}; text-align: start; font: inherit; }
.sm-kpi--clickable { cursor: pointer; transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease; }
.sm-kpi--clickable:hover { border-color: ${token.colorPrimaryBorderHover}; box-shadow: ${token.boxShadowTertiary}; }
.sm-kpi--clickable:focus-visible { outline: 2px solid ${token.colorPrimary}; outline-offset: 2px; }
.sm-kpi--selected { border-color: ${token.colorPrimary}; box-shadow: 0 0 0 1px ${token.colorPrimary} inset; }
.sm-kpi__head { display: flex; align-items: center; justify-content: space-between; gap: ${token.marginSM}px; }
.sm-kpi__label { font-size: ${token.fontSizeSM}px; font-weight: ${token.fontWeightStrong}; color: ${token.colorTextSecondary}; line-height: 1.3; min-width: 0; }
.sm-kpi__icon { display: inline-flex; align-items: center; justify-content: center; width: ${token.controlHeightSM}px; height: ${token.controlHeightSM}px; border-radius: ${token.borderRadius}px; background: ${token.colorFillAlter}; color: var(--sm-kpi-accent, ${token.colorPrimary}); flex-shrink: 0; }
.sm-kpi__icon > * { color: inherit; }
.sm-kpi__value-row { display: flex; align-items: baseline; gap: ${token.marginXXS}px; min-width: 0; }
.sm-kpi__value { font-size: ${token.fontSizeHeading3}px; font-weight: ${token.fontWeightStrong}; line-height: 1.15; color: var(--sm-kpi-accent, ${token.colorText}); font-variant-numeric: tabular-nums; }
.sm-kpi__unit { font-size: ${token.fontSizeSM}px; color: ${token.colorTextSecondary}; }
.sm-kpi__foot { display: flex; align-items: center; justify-content: space-between; gap: ${token.marginSM}px; min-width: 0; }
.sm-kpi__delta { display: inline-flex; align-items: center; gap: 2px; font-size: ${token.fontSizeSM}px; font-weight: ${token.fontWeightStrong}; white-space: nowrap; }
.sm-kpi__delta--good { color: ${token.colorSuccess}; }
.sm-kpi__delta--bad { color: ${token.colorError}; }
.sm-kpi__delta--flat { color: ${token.colorTextTertiary}; }
.sm-kpi__delta-label { font-weight: ${token.fontWeightStrong === 600 ? 400 : 400}; color: ${token.colorTextTertiary}; margin-inline-start: ${token.marginXXS}px; }
.sm-kpi__caption { font-size: ${token.fontSizeSM}px; color: ${token.colorTextTertiary}; }
.sm-kpi__spark { flex: 1 1 auto; min-width: 72px; max-width: 160px; }
.sm-kpi--primary { --sm-kpi-accent: ${token.colorPrimary}; }
.sm-kpi--success { --sm-kpi-accent: ${token.colorSuccess}; }
.sm-kpi--warning { --sm-kpi-accent: ${token.colorWarning}; }
.sm-kpi--error { --sm-kpi-accent: ${token.colorError}; }
.sm-kpi--info { --sm-kpi-accent: ${token.colorInfo}; }
@media (prefers-reduced-motion: reduce) { .sm-kpi--clickable { transition: none; } }
`;
  return (
    <style precedence="sm-kpi" href="sm-kpi">
      {css}
    </style>
  );
}

function deltaDirection(value: number): 'up' | 'down' | 'flat' {
  if (value > 0) return 'up';
  if (value < 0) return 'down';
  return 'flat';
}

export function AppKpiTile({
  label,
  value,
  unit,
  caption,
  delta,
  sparkline,
  icon,
  tone = 'default',
  selected = false,
  loading = false,
  onClick,
  ariaLabel,
  className,
}: AppKpiTileProps) {
  const { token } = theme.useToken();
  const direction = delta ? deltaDirection(delta.value) : 'flat';
  const positiveIsGood = delta?.positiveIsGood ?? true;
  const deltaClass =
    direction === 'flat'
      ? 'sm-kpi__delta--flat'
      : (direction === 'up') === positiveIsGood
        ? 'sm-kpi__delta--good'
        : 'sm-kpi__delta--bad';
  const deltaText = delta
    ? (delta.format ?? ((v: number) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v)}%`))(
        delta.value
      )
    : null;
  const accent =
    tone === 'success'
      ? token.colorSuccess
      : tone === 'warning'
        ? token.colorWarning
        : tone === 'error'
          ? token.colorError
          : tone === 'info'
            ? token.colorInfo
            : token.colorPrimary;

  const content = loading ? (
    <Skeleton active title={{ width: '40%' }} paragraph={{ rows: 1, width: '60%' }} />
  ) : (
    <>
      <div className="sm-kpi__head">
        <span className="sm-kpi__label">{label}</span>
        {icon ? <span className="sm-kpi__icon">{icon}</span> : null}
      </div>
      <div className="sm-kpi__value-row">
        <span className="sm-kpi__value">{value}</span>
        {unit ? <span className="sm-kpi__unit">{unit}</span> : null}
      </div>
      {delta || sparkline || caption ? (
        <div className="sm-kpi__foot">
          <span>
            {delta ? (
              <span className={cn('sm-kpi__delta', deltaClass)}>
                <span aria-hidden>
                  {direction === 'up' ? '▲' : direction === 'down' ? '▼' : '•'}
                </span>
                {deltaText}
                {delta.label ? <span className="sm-kpi__delta-label">{delta.label}</span> : null}
              </span>
            ) : null}
            {caption ? <span className="sm-kpi__caption">{caption}</span> : null}
          </span>
          {sparkline && sparkline.length > 1 ? (
            <span className="sm-kpi__spark">
              <AppSparkline
                data={sparkline}
                color={accent}
                height={36}
                ariaLabel={`${typeof label === 'string' ? label : 'KPI'} trend`}
              />
            </span>
          ) : null}
        </div>
      ) : null}
    </>
  );

  const classes = cn(
    'sm-kpi',
    `sm-kpi--${tone}`,
    onClick && 'sm-kpi--clickable',
    selected && 'sm-kpi--selected',
    className
  );

  return (
    <>
      <KpiTileStyles />
      {onClick ? (
        <button
          type="button"
          className={classes}
          onClick={onClick}
          aria-pressed={selected}
          aria-label={ariaLabel}
          aria-busy={loading || undefined}
        >
          {content}
        </button>
      ) : (
        <div className={classes} aria-label={ariaLabel} aria-busy={loading || undefined}>
          {content}
        </div>
      )}
    </>
  );
}
