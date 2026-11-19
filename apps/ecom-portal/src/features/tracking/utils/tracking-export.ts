/**
 * Client-side Excel export for a tracking search result.
 * Builds SpreadsheetML (.xls) so Excel opens it without an xlsx dependency.
 */
import type { TrackingSearchResult } from '../types/tracking.types';

function xmlEscape(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function cell(value: unknown): string {
  const text = xmlEscape(value);
  const isNumber = typeof value === 'number' && Number.isFinite(value);
  if (isNumber) {
    return `<Cell><Data ss:Type="Number">${text}</Data></Cell>`;
  }
  return `<Cell><Data ss:Type="String">${text}</Data></Cell>`;
}

function row(values: unknown[]): string {
  return `<Row>${values.map(cell).join('')}</Row>`;
}

/** Build SpreadsheetML workbook: Shipment + Containers + Movements sheets. */
export function buildTrackingExcelXml(result: TrackingSearchResult): string {
  const shipmentRows = [
    row(['Field', 'Value']),
    row(['Search Key', result.searchKey]),
    row(['Booking No', result.bookingNo]),
    row(['B/L No', result.blNo]),
    row(['Vessel', `${result.vesselName} (${result.vesselCode})`]),
    row(['Voyage', `${result.voyage}${result.bound ? ` ${result.bound}` : ''}`]),
    row(['POL', `${result.polPortCode} - ${result.polPortName}`]),
    row(['POL Terminal', result.polTerminal]),
    row(['POD', `${result.podPortCode} - ${result.podPortName}`]),
    row(['POD Terminal', result.podTerminal]),
    row(['ETD', result.etd]),
    row(['ETA', result.eta]),
    row(['Actual ETD', result.actualEtd ?? '']),
    row(['Actual ETA', result.actualEta ?? '']),
    row(['Progress %', result.progressPercent]),
    row(['Gate-in cut-off', result.deadlines.containerGateIn]),
    row(['SI closing', result.deadlines.siDocClosing]),
    row(['VGM closing', result.deadlines.vgmClosing]),
  ].join('');

  const containerHeader = row([
    'Container No',
    'Type',
    'Seal No',
    'Tare Kg',
    'Payload Kg',
    'Status',
    'Latest Activity',
    'Activity Location',
    'Activity Date',
  ]);
  const containerRows = result.containers
    .map((c) =>
      row([
        c.containerNo,
        c.containerType,
        c.sealNo,
        c.tareWeightKg,
        c.payloadKg,
        c.status,
        c.latestActivity,
        c.activityLocation,
        c.activityDate,
      ]),
    )
    .join('');

  const movementHeader = row([
    'Container No',
    'Event Code',
    'Event Name',
    'Location',
    'Facility',
    'Event Date',
    'Vessel',
    'Voyage',
    'Transport',
    'Actual',
  ]);
  const movementRows = result.containers
    .flatMap((c) =>
      c.movements.map((m) =>
        row([
          c.containerNo,
          m.eventCode,
          m.eventName,
          `${m.locationCode} - ${m.locationName}`,
          m.facility,
          m.eventDate,
          m.vesselName ?? '',
          m.voyage ?? '',
          m.transportMode,
          m.isActual ? 'Y' : 'N',
        ]),
      ),
    )
    .join('');

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="Shipment">
  <Table>${shipmentRows}</Table>
 </Worksheet>
 <Worksheet ss:Name="Containers">
  <Table>${containerHeader}${containerRows}</Table>
 </Worksheet>
 <Worksheet ss:Name="Movements">
  <Table>${movementHeader}${movementRows}</Table>
 </Worksheet>
</Workbook>`;
}

/** Trigger a browser download of the tracking result as Excel (.xls SpreadsheetML). */
export function downloadTrackingExcel(result: TrackingSearchResult): void {
  const xml = buildTrackingExcelXml(result);
  const blob = new Blob([xml], {
    type: 'application/vnd.ms-excel;charset=utf-8',
  });
  const stamp = new Date().toISOString().slice(0, 10);
  const safeKey = result.searchKey.replace(/[^\w.-]+/g, '_').slice(0, 40) || 'tracking';
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `tracking-${safeKey}-${stamp}.xls`;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
