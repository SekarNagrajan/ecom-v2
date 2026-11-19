// Created by Sekar Nagarajan (2026-11-13 02:00)
/**
 * AppTimeline — one component for every "steps over time" surface: a horizontal cargo journey,
 * a vertical activity feed, a document lifecycle rail. Status drives colour **and** text (chip),
 * so state is never conveyed by colour alone; the current step is exposed with `aria-current`.
 */
import { Skeleton, Typography } from 'antd';

import { cn } from '../../../utils/cn';
import { AppTimelineStyles } from './app-timeline-styles';
import { DEFAULT_TIMELINE_STATUS_LABELS } from './timeline-utils';
import type { AppTimelineItem, AppTimelineProps, AppTimelineStatus } from './types';

const { Text } = Typography;

function CheckGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden focusable="false">
      <path
        d="M3.5 8.5l3 3 6-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AlertGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden focusable="false">
      <path d="M8 3v6M8 12h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function defaultGlyph(status: AppTimelineStatus) {
  if (status === 'done') return <CheckGlyph />;
  if (status === 'error') return <AlertGlyph />;
  return <span className="sm-timeline__node-dot" aria-hidden />;
}

/** Connector after a step: solid once that step is complete, dashed otherwise. */
function lineAfter(item: AppTimelineItem | undefined): string {
  if (!item) return 'sm-timeline__line--dashed';
  return item.status === 'done' ? 'sm-timeline__line--solid' : 'sm-timeline__line--dashed';
}

export function AppTimeline({
  items,
  orientation = 'vertical',
  size = 'md',
  showStatusBadge = true,
  statusLabels,
  loading = false,
  skeletonCount = 4,
  emptyText = 'No events yet.',
  ariaLabel,
  maxHeight,
  className,
}: AppTimelineProps) {
  const isHorizontal = orientation === 'horizontal';
  const labels = { ...DEFAULT_TIMELINE_STATUS_LABELS, ...statusLabels };
  const rootClass = cn(
    'sm-timeline',
    isHorizontal ? 'sm-timeline--horizontal' : 'sm-timeline--vertical',
    size === 'sm' ? 'sm-timeline--sm' : 'sm-timeline--md',
    className
  );
  const style = !isHorizontal && maxHeight !== undefined ? { maxHeight } : undefined;

  if (loading) {
    return (
      <>
        <AppTimelineStyles />
        <div className={rootClass} style={style} aria-busy="true" aria-label={ariaLabel}>
          {Array.from({ length: skeletonCount }, (_, i) => (
            <div key={i} className="sm-timeline__skeleton-row">
              <Skeleton.Avatar active size={size === 'sm' ? 28 : 40} />
              <Skeleton active title={{ width: '45%' }} paragraph={{ rows: 1, width: '70%' }} />
            </div>
          ))}
        </div>
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <AppTimelineStyles />
        <div className={cn('sm-timeline__empty', className)} role="status">
          {emptyText}
        </div>
      </>
    );
  }

  return (
    <>
      <AppTimelineStyles />
      <ol className={rootClass} style={style} aria-label={ariaLabel}>
        {items.map((item, index) => {
          const status: AppTimelineStatus = item.status ?? 'neutral';
          const isFirst = index === 0;
          const isLast = index === items.length - 1;
          const badgeText = item.badge ?? labels[status];
          const showBadge = showStatusBadge && status !== 'neutral' && badgeText;
          const tooltip = item.tooltip ?? (typeof item.title === 'string' ? item.title : undefined);

          return (
            <li
              key={item.id}
              className={cn('sm-timeline__step', `sm-timeline__step--${status}`)}
              aria-current={status === 'current' ? 'step' : undefined}
            >
              <div className="sm-timeline__rail">
                {isHorizontal ? (
                  <span
                    className={cn(
                      'sm-timeline__line sm-timeline__line--before',
                      lineAfter(items[index - 1]),
                      isFirst && 'sm-timeline__line--ghost'
                    )}
                    aria-hidden
                  />
                ) : null}
                <span
                  className="sm-timeline__node"
                  title={typeof badgeText === 'string' ? badgeText : undefined}
                >
                  {status === 'current' ? (
                    <span className="sm-timeline__node-pulse" aria-hidden />
                  ) : null}
                  {item.icon ?? defaultGlyph(status)}
                </span>
                <span
                  className={cn(
                    'sm-timeline__line sm-timeline__line--after',
                    lineAfter(item),
                    isLast &&
                      (isHorizontal ? 'sm-timeline__line--ghost' : 'sm-timeline__line--hidden')
                  )}
                  aria-hidden
                />
              </div>

              <div className="sm-timeline__body">
                <Text
                  className="sm-timeline__title"
                  ellipsis={isHorizontal ? { tooltip } : undefined}
                >
                  {item.title}
                </Text>
                {item.subtitle ? (
                  <Text
                    className="sm-timeline__subtitle"
                    ellipsis={
                      isHorizontal
                        ? { tooltip: typeof item.subtitle === 'string' ? item.subtitle : undefined }
                        : undefined
                    }
                  >
                    {item.subtitle}
                  </Text>
                ) : null}
                {showBadge ? <span className="sm-timeline__badge">{badgeText}</span> : null}
                {item.timestamp ? (
                  <Text className="sm-timeline__time">
                    <span className="sm-timeline__time-value">{item.timestamp}</span>
                  </Text>
                ) : isHorizontal ? (
                  <Text className="sm-timeline__time sm-timeline__time--empty" aria-hidden>
                    —
                  </Text>
                ) : null}
                {item.meta ? <div className="sm-timeline__meta">{item.meta}</div> : null}
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}
