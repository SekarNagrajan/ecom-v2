// Modified by Sekar Nagarajan (2026-09-15 11:35)
import { Tooltip } from "antd";
import type { CSSProperties, ReactNode } from "react";

export interface ModuleRecordCardTextProps {
  children: ReactNode;
  style?: CSSProperties;
  title?: string;
  tooltip?: ReactNode;
}

export function ModuleRecordCardText({
  children,
  style,
  title,
  tooltip,
}: ModuleRecordCardTextProps) {
  const content = (
    <span
      title={title}
      style={{
        display: "inline-block",
        maxWidth: "100%",
        verticalAlign: "top",
        ...style,
      }}
    >
      {children}
    </span>
  );

  if (!tooltip && !title) return content;

  return (
    <Tooltip mouseEnterDelay={0.5} title={tooltip ?? title}>
      {content}
    </Tooltip>
  );
}
