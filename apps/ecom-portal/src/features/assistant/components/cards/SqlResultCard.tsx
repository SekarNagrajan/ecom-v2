// Modified by Sekar Nagarajan (2026-10-20 16:50)
import { Table, Tag, Typography } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { AssistantCard } from "../../types/assistant.types";

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v));
}

function asRowArray(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value.map((row, index) => {
    if (row && typeof row === "object" && !Array.isArray(row)) {
      return row as Record<string, unknown>;
    }
    if (Array.isArray(row)) {
      const obj: Record<string, unknown> = {};
      row.forEach((cell, i) => {
        obj[`c${i}`] = cell;
      });
      return obj;
    }
    return { value: row, _i: index };
  });
}

export function SqlResultCard({ card }: { card: AssistantCard }) {
  const { t } = useTranslation("assistant");
  const sql =
    typeof card.arguments.sql === "string" ? card.arguments.sql : "";
  const explanation =
    typeof card.arguments.explanation === "string"
      ? card.arguments.explanation
      : "";
  const columns = asStringArray(card.arguments.columns);
  const rows = asRowArray(card.arguments.rows);
  const rowCount =
    typeof card.arguments.row_count === "number"
      ? card.arguments.row_count
      : rows.length;
  const truncated = Boolean(card.arguments.truncated);

  const tableColumns = useMemo(() => {
    const keys =
      columns.length > 0
        ? columns
        : rows[0]
          ? Object.keys(rows[0]).filter((k) => k !== "_i")
          : [];
    return keys.map((key) => ({
      title: key,
      dataIndex: key,
      key,
      ellipsis: true,
    }));
  }, [columns, rows]);

  return (
    <div className="assistant-card assistant-card--sql">
      <div className="assistant-card__head">
        <Typography.Title level={5} className="assistant-card__title">
          {t("sql.title")}
        </Typography.Title>
        <Tag color="blue">
          {t("sql.rows", { count: rowCount, defaultValue: `${rowCount} rows` })}
        </Tag>
        {truncated ? <Tag>{t("sql.truncated")}</Tag> : null}
      </div>
      {explanation ? (
        <div className="assistant-card__body">{explanation}</div>
      ) : null}
      {sql ? (
        <pre className="assistant-sql-code">{sql}</pre>
      ) : null}
      {tableColumns.length > 0 ? (
        <Table
          size="small"
          pagination={{ pageSize: 8, hideOnSinglePage: true }}
          columns={tableColumns}
          dataSource={rows.map((row, i) => ({ ...row, key: i }))}
          scroll={{ x: true }}
        />
      ) : (
        <div className="assistant-card__body">{t("sql.empty")}</div>
      )}
    </div>
  );
}
