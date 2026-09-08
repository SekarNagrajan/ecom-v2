// Created by Sekar Nagarajan (2026-09-08 15:44)
/**
 * Format-aware HTML report preview — A4 pages (PDF) vs 16:9 slides (PPTX).
 */
import { Flex, Typography, theme } from "antd";
import { useEffect, useState } from "react";

import { useChartTokens } from "../../theme/utils/use-portal-chart-tokens";
import type { DashboardExportFormat } from "../hooks/use-dashboard-export";
import type {
  DashboardReport,
  DashboardReportChartSection,
  DashboardReportKpiSection,
  DashboardReportTableSection,
} from "../types/dashboard-export.types";
import { renderChartSectionToPng } from "../utils/export/report-chart-image";
import {
  buildPptxPreviewSlides,
  type PptxPreviewSlide,
} from "../utils/export/report-pptx-preview.model";
import {
  displayReportCell,
  formatDeltaWithArrow,
} from "../utils/export/report-shared.utils";

const { Text, Title } = Typography;

export interface ReportHtmlPreviewProps {
  report: DashboardReport;
  format: DashboardExportFormat;
  formatGeneratedAt: (isoUtc: string) => string;
}

export function ReportHtmlPreview({
  report,
  format,
  formatGeneratedAt,
}: ReportHtmlPreviewProps) {
  const { token } = theme.useToken();

  if (format === "pptx") {
    const slides = buildPptxPreviewSlides(report, { formatGeneratedAt });
    return (
      <div
        role="region"
        aria-label="PowerPoint preview"
        className="custom-scroll"
        style={{
          maxHeight: "60vh",
          overflowY: "auto",
          padding: token.paddingSM,
          backgroundColor: "#1f2937",
          borderRadius: token.borderRadius,
        }}
      >
        <Flex vertical gap={token.marginMD}>
          {slides.map((slide, index) => (
            <div key={`${slide.kind}-${index}`}>
              <Text
                style={{
                  display: "block",
                  color: "#D1D5DB",
                  fontSize: token.fontSizeSM,
                  marginBottom: token.marginXXS,
                }}
              >
                Slide {index + 1} of {slides.length}
              </Text>
              <div
                style={{
                  aspectRatio: "16 / 9",
                  width: "100%",
                  backgroundColor: "#FFFFFF",
                  borderRadius: token.borderRadiusSM,
                  padding: token.paddingMD,
                  overflow: "hidden",
                }}
              >
                <SlideBody slide={slide} />
              </div>
            </div>
          ))}
        </Flex>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="PDF preview"
      className="custom-scroll"
      style={{
        maxHeight: "60vh",
        overflowY: "auto",
        padding: token.paddingSM,
        backgroundColor: token.colorFillAlter,
        borderRadius: token.borderRadius,
      }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          background: token.colorBgContainer,
          borderRadius: token.borderRadiusLG,
          padding: token.paddingLG,
          boxShadow: token.boxShadowSecondary,
        }}
      >
        <Title level={3} style={{ marginTop: 0 }}>
          {report.title}
        </Title>
        <Text type="secondary">
          {report.tenantName} · {formatGeneratedAt(report.generatedAt)} ·{" "}
          {report.generatedBy}
        </Text>
        {report.appliedFilters.length > 0 ? (
          <Flex
            wrap
            gap={token.marginSM}
            style={{ marginTop: token.marginMD, marginBottom: token.marginLG }}
          >
            {report.appliedFilters.map((filter) => (
              <div key={filter.label}>
                <Text
                  type="secondary"
                  style={{ display: "block", fontSize: token.fontSizeSM }}
                >
                  {filter.label}
                </Text>
                <Text strong>{filter.value}</Text>
              </div>
            ))}
          </Flex>
        ) : null}
        <Flex vertical gap={token.marginLG}>
          {report.sections.map((section) => {
            if (section.type === "KPI") {
              return <KpiBlock key={section.id} section={section} />;
            }
            if (section.type === "CHART") {
              return <ChartBlock key={section.id} section={section} />;
            }
            return <TableBlock key={section.id} section={section} />;
          })}
        </Flex>
      </div>
    </div>
  );
}

function SlideBody({ slide }: { slide: PptxPreviewSlide }) {
  const { token } = theme.useToken();

  if (slide.kind === "title") {
    return (
      <Flex vertical gap={token.marginXS}>
        <Title level={4} style={{ margin: 0 }}>
          {slide.title}
        </Title>
        <Text type="secondary">
          {slide.tenantName} · {slide.generatedAt} · {slide.generatedBy}
        </Text>
        {slide.filters.map((f) => (
          <Text key={f.label}>
            {f.label}: <strong>{f.value}</strong>
          </Text>
        ))}
      </Flex>
    );
  }

  if (slide.kind === "kpi") {
    return (
      <section>
        <Title level={5} style={{ marginTop: 0 }}>
          {slide.title}
        </Title>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gap: token.marginSM,
          }}
        >
          {slide.items.map((item) => (
            <div
              key={item.label}
              style={{
                border: `1px solid ${token.colorBorderSecondary}`,
                borderRadius: token.borderRadius,
                padding: token.paddingSM,
                background: token.colorFillAlter,
              }}
            >
              <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                {item.label}
              </Text>
              <div>
                <Text strong>{item.displayValue}</Text>
              </div>
              {item.deltaText ? (
                <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                  {item.deltaText}
                </Text>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (slide.kind === "chart") {
    return <ChartBlock section={slide.section} />;
  }

  return (
    <section>
      <Title level={5} style={{ marginTop: 0 }}>
        {slide.title}
      </Title>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: token.fontSizeSM,
        }}
      >
        <thead>
          <tr>
            {slide.columns.map((col) => (
              <th
                key={col.key}
                style={{
                  textAlign: col.align === "RIGHT" ? "right" : "left",
                  borderBottom: `1px solid ${token.colorBorder}`,
                  padding: `${token.paddingXXS}px ${token.paddingXS}px`,
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {slide.rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  style={{
                    textAlign:
                      slide.columns[cellIndex]?.align === "RIGHT"
                        ? "right"
                        : "left",
                    borderBottom: `1px solid ${token.colorBorderSecondary}`,
                    padding: `${token.paddingXXS}px ${token.paddingXS}px`,
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {slide.footnote ? (
        <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          {slide.footnote}
        </Text>
      ) : null}
    </section>
  );
}

function KpiBlock({ section }: { section: DashboardReportKpiSection }) {
  const { token } = theme.useToken();
  return (
    <section>
      <Title level={5} style={{ marginTop: 0 }}>
        {section.title}
      </Title>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: token.marginSM,
        }}
      >
        {section.items.map((item) => {
          const delta = formatDeltaWithArrow(item.delta, item.deltaDirection);
          return (
            <div
              key={item.label}
              style={{
                border: `1px solid ${token.colorBorderSecondary}`,
                borderRadius: token.borderRadius,
                padding: token.paddingSM,
                background: token.colorFillAlter,
              }}
            >
              <Text
                type="secondary"
                style={{ display: "block", fontSize: token.fontSizeSM }}
              >
                {item.label}
              </Text>
              <Text strong style={{ fontSize: token.fontSizeLG }}>
                {item.value}
              </Text>
              {delta ? (
                <Text
                  type="secondary"
                  style={{ display: "block", fontSize: token.fontSizeSM }}
                >
                  {delta}
                </Text>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ChartBlock({ section }: { section: DashboardReportChartSection }) {
  // Modified by Sekar Nagarajan (2026-09-08 16:10)
  const chartTokens = useChartTokens();
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    try {
      setSrc(
        renderChartSectionToPng(section, {
          tokens: chartTokens,
          formatNumber: (v) => v.toLocaleString(),
          formatCurrency: (v) => `$${v.toLocaleString()}`,
        }),
      );
    } catch {
      setSrc(null);
    }
  }, [section, chartTokens]);

  return (
    <section>
      <Title level={5} style={{ marginTop: 0 }}>
        {section.title}
      </Title>
      {src ? (
        <img
          src={src}
          alt={section.title}
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      ) : (
        <Text type="secondary">Chart could not be rendered.</Text>
      )}
    </section>
  );
}

function TableBlock({ section }: { section: DashboardReportTableSection }) {
  const { token } = theme.useToken();
  return (
    <section>
      <Title level={5} style={{ marginTop: 0 }}>
        {section.title}
      </Title>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: token.fontSizeSM,
          }}
        >
          <thead>
            <tr>
              {section.columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    textAlign: col.align === "RIGHT" ? "right" : "left",
                    borderBottom: `1px solid ${token.colorBorder}`,
                    padding: `${token.paddingXXS}px ${token.paddingXS}px`,
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {section.rows.map((row, index) => (
              <tr key={index}>
                {section.columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      textAlign: col.align === "RIGHT" ? "right" : "left",
                      borderBottom: `1px solid ${token.colorBorderSecondary}`,
                      padding: `${token.paddingXXS}px ${token.paddingXS}px`,
                    }}
                  >
                    {displayReportCell(row[col.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {section.footnote ? (
        <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          {section.footnote}
        </Text>
      ) : null}
    </section>
  );
}
