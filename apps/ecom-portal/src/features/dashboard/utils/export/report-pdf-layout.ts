// Created by Sekar Nagarajan (2026-09-08 15:44)
import type { jsPDF } from "jspdf";

import type {
  DashboardReport,
  DashboardReportChartSection,
  DashboardReportKpiSection,
  DashboardReportSection,
  DashboardReportTableSection,
} from "../../types/dashboard-export.types";
import {
  CHART_PRINT,
  CONTENT_WIDTH,
  FONT,
  INK,
  KPI_CARD,
  KPI_CARD_TINTS,
  PAGE,
  SPACING,
} from "./report-pdf-theme";

export function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed <= PAGE.height - PAGE.marginBottom) {
    return y;
  }
  doc.addPage();
  return PAGE.marginTop;
}

export function drawHeaderBlock(
  doc: jsPDF,
  report: DashboardReport,
  formattedGeneratedAt: string,
): number {
  let y: number = PAGE.marginTop;

  doc.setFont(FONT.family, "bold");
  doc.setFontSize(FONT.reportTitle);
  doc.setTextColor(...INK.heading);
  const titleLines = doc.splitTextToSize(report.title, CONTENT_WIDTH);
  doc.text(titleLines, PAGE.marginX, y);
  y += titleLines.length * (FONT.reportTitle * 1.12) + SPACING.afterTitle;

  doc.setFont(FONT.family, "normal");
  doc.setFontSize(FONT.body);
  doc.setTextColor(...INK.muted);
  doc.text(
    `${report.tenantName}  ·  ${formattedGeneratedAt}  ·  ${report.generatedBy}`,
    PAGE.marginX,
    y,
  );
  y += SPACING.afterMeta;

  if (report.appliedFilters.length > 0) {
    y = drawScopePanel(doc, y, report.appliedFilters);
  }

  y += 8;
  doc.setDrawColor(...INK.rule);
  doc.setLineWidth(0.75);
  doc.line(PAGE.marginX, y, PAGE.width - PAGE.marginX, y);

  return y + SPACING.afterHeaderBlock;
}

function drawScopePanel(
  doc: jsPDF,
  y: number,
  filters: DashboardReport["appliedFilters"],
): number {
  const panelPadding = 12;
  const panelTitleHeight = 14;
  const columnCount = 2;
  const rowCount = Math.ceil(filters.length / columnCount);
  const panelHeight =
    panelPadding * 2 + panelTitleHeight + rowCount * SPACING.filterRow;

  doc.setFillColor(...INK.headerPanelBg);
  doc.setDrawColor(...INK.headerPanelBorder);
  doc.setLineWidth(0.75);
  doc.roundedRect(PAGE.marginX, y, CONTENT_WIDTH, panelHeight, 5, 5, "FD");

  const innerX = PAGE.marginX + panelPadding;
  let cursorY = y + panelPadding + 6;

  doc.setFont(FONT.family, "bold");
  doc.setFontSize(FONT.small);
  doc.setTextColor(...INK.body);
  doc.text("Report scope", innerX, cursorY);
  cursorY += panelTitleHeight;

  const columnWidth =
    (CONTENT_WIDTH - panelPadding * 2 - SPACING.filterColumnGap) / columnCount;

  filters.forEach((filter, index) => {
    const column = index % columnCount;
    const row = Math.floor(index / columnCount);
    const cellX = innerX + column * (columnWidth + SPACING.filterColumnGap);
    const cellY = cursorY + row * SPACING.filterRow;

    doc.setFont(FONT.family, "normal");
    doc.setFontSize(FONT.metaLabel);
    doc.setTextColor(...INK.muted);
    doc.text(filter.label.toUpperCase(), cellX, cellY);

    doc.setFont(FONT.family, "bold");
    doc.setFontSize(FONT.body);
    doc.setTextColor(...INK.heading);
    const valueLines = doc.splitTextToSize(filter.value, columnWidth - 2);
    doc.text(valueLines[0] ?? filter.value, cellX, cellY + 11);
  });

  return y + panelHeight + 6;
}

function drawSectionHeading(
  doc: jsPDF,
  y: number,
  section: DashboardReportSection,
): number {
  let cursor = y;

  doc.setFillColor(...INK.accent);
  doc.rect(PAGE.marginX, cursor - 10, 3, 16, "F");

  doc.setFont(FONT.family, "bold");
  doc.setFontSize(FONT.sectionTitle);
  doc.setTextColor(...INK.heading);
  doc.text(section.title, PAGE.marginX + 10, cursor);
  cursor += FONT.sectionTitle + SPACING.afterSectionTitle;

  if (section.description) {
    doc.setFont(FONT.family, "normal");
    doc.setFontSize(FONT.small);
    doc.setTextColor(...INK.muted);
    const lines = doc.splitTextToSize(section.description, CONTENT_WIDTH - 10);
    doc.text(lines, PAGE.marginX + 10, cursor);
    cursor += lines.length * (FONT.small * 1.3);
  }

  return cursor + SPACING.afterSectionDescription;
}

function kpiColumnsForCount(count: number): number {
  if (count <= 4) return 2;
  if (count <= 9) return 3;
  return 4;
}

function kpiCardHeight(hasDelta: boolean): number {
  return hasDelta ? KPI_CARD.minHeight + 12 : KPI_CARD.minHeight;
}

function drawKpiSection(
  doc: jsPDF,
  y: number,
  section: DashboardReportKpiSection,
): number {
  const perRow = kpiColumnsForCount(section.items.length);
  const cardWidth = (CONTENT_WIDTH - KPI_CARD.gap * (perRow - 1)) / perRow;

  const rowHeights = Array.from(
    { length: Math.ceil(section.items.length / perRow) },
    (_, row) => {
      const start = row * perRow;
      const rowItems = section.items.slice(start, start + perRow);
      return Math.max(
        ...rowItems.map((item) => kpiCardHeight(Boolean(item.delta))),
      );
    },
  );
  const blockHeight =
    rowHeights.reduce((sum, height) => sum + height, 0) +
    KPI_CARD.gap * Math.max(0, rowHeights.length - 1);

  let cursor = ensureSpace(doc, y, blockHeight + 60);
  cursor = drawSectionHeading(doc, cursor, section);

  let rowY = cursor;
  section.items.forEach((item, index) => {
    const column = index % perRow;
    const row = Math.floor(index / perRow);
    if (column === 0 && row > 0) {
      rowY += rowHeights[row - 1]! + KPI_CARD.gap;
    }
    const x = PAGE.marginX + column * (cardWidth + KPI_CARD.gap);
    drawKpiCard(doc, x, rowY, cardWidth, kpiCardHeight(Boolean(item.delta)), item, index);
  });

  return (
    rowY +
    (rowHeights[rowHeights.length - 1] ?? KPI_CARD.minHeight) +
    SPACING.afterSection
  );
}

function drawKpiCard(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  item: DashboardReportKpiSection["items"][number],
  index: number,
): void {
  const innerX = x + KPI_CARD.paddingX;
  const contentWidth = width - KPI_CARD.paddingX * 2;
  const tint: readonly [number, number, number] =
    KPI_CARD_TINTS[index % KPI_CARD_TINTS.length] ?? INK.accentSoft;

  doc.setFillColor(...tint);
  doc.setDrawColor(...INK.rule);
  doc.setLineWidth(0.75);
  doc.roundedRect(x, y, width, height, KPI_CARD.radius, KPI_CARD.radius, "FD");

  doc.setFont(FONT.family, "normal");
  doc.setFontSize(FONT.kpiLabel);
  doc.setTextColor(...INK.muted);
  doc.text(
    doc.splitTextToSize(item.label, contentWidth)[0] ?? "",
    innerX,
    y + KPI_CARD.paddingTop + 8,
  );

  doc.setFont(FONT.family, "bold");
  doc.setFontSize(FONT.kpiValue);
  doc.setTextColor(...INK.heading);
  doc.text(
    doc.splitTextToSize(item.value, contentWidth)[0] ?? item.value,
    innerX,
    y + KPI_CARD.paddingTop + 26,
  );

  if (item.delta) {
    const deltaColor: readonly [number, number, number] =
      item.deltaDirection === "UP"
        ? INK.positive
        : item.deltaDirection === "DOWN"
          ? INK.negative
          : INK.muted;
    doc.setFont(FONT.family, "normal");
    doc.setFontSize(FONT.kpiHint);
    doc.setTextColor(...deltaColor);
    doc.text(item.delta, innerX, y + height - 10);
  }
}

function drawChartSection(
  doc: jsPDF,
  y: number,
  section: DashboardReportChartSection,
  pngDataUrl: string | undefined,
): number {
  let cursor = ensureSpace(doc, y, CHART_PRINT.height + 70);
  cursor = drawSectionHeading(doc, cursor, section);

  if (!pngDataUrl) {
    doc.setFont(FONT.family, "italic");
    doc.setFontSize(FONT.body);
    doc.setTextColor(...INK.muted);
    doc.text("Chart could not be rendered.", PAGE.marginX, cursor);
    return cursor + 20 + SPACING.afterSection;
  }

  doc.addImage(
    pngDataUrl,
    "PNG",
    PAGE.marginX,
    cursor,
    CHART_PRINT.width,
    CHART_PRINT.height,
    section.id,
    "FAST",
  );

  return cursor + CHART_PRINT.height + SPACING.afterSection;
}

function drawTableSection(
  doc: jsPDF,
  y: number,
  section: DashboardReportTableSection,
): number {
  let cursor = ensureSpace(doc, y, 80);
  cursor = drawSectionHeading(doc, cursor, section);

  const colCount = Math.max(section.columns.length, 1);
  const colWidth = CONTENT_WIDTH / colCount;
  const rowHeight = 18;

  const drawRow = (cells: string[], isHeader: boolean, stripe: boolean) => {
    cursor = ensureSpace(doc, cursor, rowHeight + 2);
    if (isHeader) doc.setFillColor(...INK.tableHeadBg);
    else if (stripe) doc.setFillColor(...INK.tableStripe);
    else doc.setFillColor(...INK.cardBg);
    doc.setDrawColor(...INK.rule);
    doc.rect(PAGE.marginX, cursor - 11, CONTENT_WIDTH, rowHeight, "FD");

    doc.setFont(FONT.family, isHeader ? "bold" : "normal");
    doc.setFontSize(FONT.small);
    const textColor: readonly [number, number, number] = isHeader
      ? INK.heading
      : INK.body;
    doc.setTextColor(...textColor);

    cells.forEach((cell, index) => {
      const align = section.columns[index]?.align;
      const text = doc.splitTextToSize(cell, colWidth - 8)[0] ?? cell;
      if (align === "RIGHT") {
        doc.text(text, PAGE.marginX + (index + 1) * colWidth - 4, cursor, {
          align: "right",
        });
      } else if (align === "CENTER") {
        doc.text(text, PAGE.marginX + index * colWidth + colWidth / 2, cursor, {
          align: "center",
        });
      } else {
        doc.text(text, PAGE.marginX + index * colWidth + 4, cursor);
      }
    });
    cursor += rowHeight;
  };

  drawRow(
    section.columns.map((c) => c.label),
    true,
    false,
  );
  section.rows.forEach((row, rowIndex) => {
    drawRow(
      section.columns.map((column) => {
        const value = row[column.key];
        if (value === null || value === undefined) return "—";
        if (typeof value === "number") return value.toLocaleString();
        return String(value);
      }),
      false,
      rowIndex % 2 === 1,
    );
  });

  if (section.footnote) {
    cursor = ensureSpace(doc, cursor + 4, 14);
    doc.setFont(FONT.family, "italic");
    doc.setFontSize(FONT.small);
    doc.setTextColor(...INK.muted);
    doc.text(section.footnote, PAGE.marginX, cursor);
    cursor += 12;
  }

  return cursor + SPACING.afterSection;
}

export function drawSection(
  doc: jsPDF,
  y: number,
  section: DashboardReportSection,
  chartImages: Map<string, string>,
): number {
  switch (section.type) {
    case "KPI":
      return drawKpiSection(doc, y, section);
    case "CHART":
      return drawChartSection(doc, y, section, chartImages.get(section.id));
    case "TABLE":
      return drawTableSection(doc, y, section);
    default: {
      const exhaustive: never = section;
      return exhaustive;
    }
  }
}

export function drawFooters(doc: jsPDF, report: DashboardReport): void {
  const total = doc.getNumberOfPages();
  const footerY = PAGE.height - PAGE.marginBottom + 22;

  for (let page = 1; page <= total; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(...INK.rule);
    doc.setLineWidth(0.5);
    doc.line(
      PAGE.marginX,
      footerY - 12,
      PAGE.width - PAGE.marginX,
      footerY - 12,
    );
    doc.setFont(FONT.family, "normal");
    doc.setFontSize(FONT.small);
    doc.setTextColor(...INK.muted);
    doc.text(report.title, PAGE.marginX, footerY);
    doc.text(`Page ${page} of ${total}`, PAGE.width - PAGE.marginX, footerY, {
      align: "right",
    });
  }
}
