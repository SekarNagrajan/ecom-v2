// Modified by Sekar Nagarajan (2026-09-15 11:35)
import { theme, Tooltip } from "antd";
import type { CSSProperties, ReactNode } from "react";

export interface ModuleRecordCardMetaItem {
  key: string;
  icon?: ReactNode;
  label: ReactNode;
  tooltip?: string;
}

export interface ModuleRecordCardMetaProps {
  items: ModuleRecordCardMetaItem[];
  style?: CSSProperties;
}

export function ModuleRecordCardMeta({ items, style }: ModuleRecordCardMetaProps) {
  const { token } = theme.useToken();

  const rowStyle: CSSProperties = {
    alignContent: "flex-start",
    display: "flex",
    flexGrow: 1,
    flexWrap: "wrap",
    gap: `${token.marginXXS}px ${token.marginSM}px`,
    minHeight: 0,
    ...style,
  };

  const cellStyle: CSSProperties = {
    alignItems: "center",
    color: token.colorTextSecondary,
    display: "inline-flex",
    fontSize: token.fontSizeSM,
    gap: token.marginXXS,
    maxWidth: "100%",
    minWidth: 0,
  };

  const labelStyle: CSSProperties = {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  return (
    <div style={rowStyle}>
      {items.map((item) => {
        const content = (
          <span key={item.key} style={cellStyle}>
            {item.icon}
            <span style={labelStyle}>{item.label}</span>
          </span>
        );

        if (!item.tooltip) return content;

        return (
          <Tooltip key={item.key} title={item.tooltip} mouseEnterDelay={0.5}>
            {content}
          </Tooltip>
        );
      })}
    </div>
  );
}
