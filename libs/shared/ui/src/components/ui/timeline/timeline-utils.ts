// Created by Sekar Nagarajan (2026-11-13 02:00)
import type { AppTimelineStatus } from './types';

/**
 * Lifecycle rule used by document timelines (issued → arrived → valid until …): every step that
 * `isDone` is `done`, the first step that is not done becomes `current`, the rest are `upcoming`.
 */
export function sequentialTimelineStatus<T>(
  steps: readonly T[],
  isDone: (step: T, index: number) => boolean
): Array<T & { status: AppTimelineStatus }> {
  let currentAssigned = false;
  return steps.map((step, index) => {
    if (isDone(step, index)) return { ...step, status: 'done' as const };
    if (!currentAssigned) {
      currentAssigned = true;
      return { ...step, status: 'current' as const };
    }
    return { ...step, status: 'upcoming' as const };
  });
}

/** Default chip labels; consumers pass `statusLabels` for translations. */
export const DEFAULT_TIMELINE_STATUS_LABELS: Record<AppTimelineStatus, string> = {
  done: 'Completed',
  current: 'In progress',
  upcoming: 'Upcoming',
  error: 'Attention',
  neutral: '',
};
