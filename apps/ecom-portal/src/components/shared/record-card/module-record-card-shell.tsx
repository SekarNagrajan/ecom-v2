// Modified by Sekar Nagarajan (2026-09-15 11:35)
import { theme } from "antd";
import type { CSSProperties, HTMLAttributes, MouseEvent, ReactNode } from "react";

export interface ModuleRecordCardShellProps {
  children: ReactNode;
  isSelected?: boolean;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  contentStyle?: CSSProperties;
  shellStyle?: CSSProperties;
  containerProps?: HTMLAttributes<HTMLDivElement>;
}

export function ModuleRecordCardShell({
  children,
  isSelected = false,
  onClick,
  contentStyle,
  shellStyle,
  containerProps,
}: ModuleRecordCardShellProps) {
  const { token } = theme.useToken();

  const frameStyle: CSSProperties = {
    height: "100%",
    overflow: "hidden",
    position: "relative",
  };

  const defaultShellStyle: CSSProperties = {
    background: token.colorBgContainer,
    border: isSelected
      ? `2px solid ${token.colorPrimary}`
      : `1px solid ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadiusLG,
    boxShadow: isSelected ? token.boxShadowSecondary : "none",
    cursor: onClick ? "pointer" : undefined,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden",
    position: "relative",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  };

  const defaultContentStyle: CSSProperties = {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    gap: token.marginXS,
    minHeight: 0,
    padding: token.paddingSM,
  };

  return (
    <div style={frameStyle} {...containerProps}>
      <div
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={onClick}
        onKeyDown={
          onClick
            ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onClick(
                    event as unknown as MouseEvent<HTMLDivElement>,
                  );
                }
              }
            : undefined
        }
        style={{ ...defaultShellStyle, ...shellStyle }}
      >
        <div style={{ ...defaultContentStyle, ...contentStyle }}>{children}</div>
      </div>
    </div>
  );
}
