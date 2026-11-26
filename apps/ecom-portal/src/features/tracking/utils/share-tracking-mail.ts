// Modified by Sekar Nagarajan (2026-10-19)
import type { TFunction } from 'i18next';

import type {
  ShareTrackingMailSummary,
  TrackingSearchResult,
} from '../types/tracking.types';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function toShareTrackingSummary(
  result: TrackingSearchResult,
): ShareTrackingMailSummary {
  return {
    searchKey: result.searchKey,
    bookingNo: result.bookingNo,
    blNo: result.blNo,
    vesselName: result.vesselName,
    voyage: result.voyage,
    bound: result.bound,
    polPortCode: result.polPortCode,
    podPortCode: result.podPortCode,
    etd: result.etd,
    eta: result.eta,
    containerCount: result.containers.length,
    containerNos: result.containers.map((c) => c.containerNo).slice(0, 10),
  };
}

export function buildShareTrackingSubject(
  result: TrackingSearchResult,
  t: TFunction<'tracking'>,
): string {
  return t('shareMail.subjectTemplate', {
    vessel: result.vesselName,
    voyage: result.voyage,
    bound: result.bound ? ` ${result.bound}` : '',
    pol: result.polPortCode,
    pod: result.podPortCode,
    ref: result.searchKey,
  });
}

/** HTML body for FormRichTextEditor (schedules / rates share-mail parity). */
export function buildShareTrackingMessage(
  result: TrackingSearchResult,
  t: TFunction<'tracking'>,
): string {
  const containers = result.containers
    .slice(0, 8)
    .map(
      (c) =>
        `<li>${escapeHtml(c.containerNo)} — ${escapeHtml(c.status)} · ${escapeHtml(c.latestActivity)}</li>`,
    )
    .join('');
  const more =
    result.containers.length > 8
      ? `<li>${escapeHtml(
          t('shareMail.body.moreContainers', {
            count: result.containers.length - 8,
          }),
        )}</li>`
      : '';

  return [
    `<p>${escapeHtml(t('shareMail.body.hello'))}</p>`,
    `<p>${escapeHtml(t('shareMail.body.intro'))}</p>`,
    `<p><strong>${escapeHtml(
      t('shareMail.body.shipmentHeading', {
        vessel: result.vesselName,
        voyage: result.voyage,
        bound: result.bound ? ` ${result.bound}` : '',
      }),
    )}</strong></p>`,
    `<p>${escapeHtml(t('shareMail.body.reference', { value: result.searchKey }))}</p>`,
    `<p>${escapeHtml(t('shareMail.body.booking', { value: result.bookingNo || '—' }))}</p>`,
    `<p>${escapeHtml(t('shareMail.body.bl', { value: result.blNo || '—' }))}</p>`,
    `<p>${escapeHtml(
      t('shareMail.body.lane', {
        value: `${result.polPortCode} → ${result.podPortCode}`,
      }),
    )}</p>`,
    `<p>${escapeHtml(t('shareMail.body.etd', { value: result.etd }))}</p>`,
    `<p>${escapeHtml(t('shareMail.body.eta', { value: result.eta }))}</p>`,
    `<p>${escapeHtml(
      t('shareMail.body.containersHeading', { count: result.containers.length }),
    )}</p>`,
    containers ? `<ul>${containers}${more}</ul>` : '',
    `<p>${escapeHtml(t('shareMail.body.regards'))}</p>`,
    `<p>${escapeHtml(t('shareMail.body.signature'))}</p>`,
  ].join('');
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
