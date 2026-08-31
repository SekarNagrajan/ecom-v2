// Modified by Sekar Nagarajan (2026-08-31 13:01)
import { theme } from "antd";

import { tokenMix } from "../../features/theme/utils/token-mix";

/**
 * Token-backed Lucide icon colors.
 * Grid-action hover lives on the host `.ant-btn` only — never on the icon
 * (avoids the double long/short background plate).
 */
export function AppIconStyles() {
  const { token } = theme.useToken();
  // Mild tint from seed color — avoid mid-tone *Bg (muddy with dark emerald success)
  const primaryHoverBg = tokenMix(token.colorPrimary, 12);
  const successHoverBg = tokenMix(token.colorSuccess, 12);
  const warningHoverBg = tokenMix(token.colorWarning, 12);
  const errorHoverBg = tokenMix(token.colorError, 12);

  const tones = [
    {
      key: "view",
      color: token.colorPrimary,
      hoverBg: primaryHoverBg,
    },
    {
      key: "print",
      color: token.geekblue,
      hoverBg: tokenMix(token.geekblue, 12),
    },
    {
      key: "edit",
      color: token.colorWarning,
      hoverBg: warningHoverBg,
    },
    {
      key: "create",
      color: token.colorSuccessText || token.colorSuccess,
      hoverBg: successHoverBg,
    },
    {
      key: "delete",
      color: token.colorError,
      hoverBg: errorHoverBg,
    },
    {
      key: "approve",
      color: token.lime,
      hoverBg: tokenMix(token.lime, 12),
    },
    {
      key: "reject",
      color: token.volcano,
      hoverBg: tokenMix(token.volcano, 12),
    },
    {
      key: "navigate",
      color: token.blue,
      hoverBg: tokenMix(token.blue, 12),
    },
    {
      key: "track",
      color: token.cyan,
      hoverBg: tokenMix(token.cyan, 12),
    },
    {
      key: "history",
      color: token.purple,
      hoverBg: tokenMix(token.purple, 12),
    },
    {
      key: "download",
      color: token.orange,
      hoverBg: tokenMix(token.orange, 12),
    },
    {
      key: "muted",
      color: token.colorTextSecondary,
      hoverBg: token.colorFillSecondary,
    },
  ] as const;

  const toneRules = tones
    .map(
      ({ key, color, hoverBg }) => `
      .app-icon-action.app-icon-tone-${key},
      .app-icon-grid-action.app-icon-tone-${key} {
        color: ${color};
      }
      /* Standalone grid icon (no button host) */
      .app-icon-grid-action.app-icon-tone-${key}:hover {
        color: ${color} !important;
        background-color: ${hoverBg};
      }
      /* Inside Actions-column button — one plate on the button only */
      .ant-btn:has(.app-icon-grid-action.app-icon-tone-${key}):hover,
      .list-action-button:has(.app-icon-tone-${key}):hover,
      .list-action-button:has(.app-icon-tone-${key}):focus {
        background-color: ${hoverBg} !important;
      }
      .ant-btn:has(.app-icon-grid-action.app-icon-tone-${key}):hover .app-icon-grid-action,
      .list-action-button:has(.app-icon-tone-${key}):hover .app-icon-grid-action {
        color: ${color} !important;
        background: transparent !important;
      }`,
    )
    .join("\n");

  return (
    <style>{`
      .app-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 0;
        color: ${token.colorPrimary};
      }
      .app-icon-nav {
        color: ${token.colorText};
      }
      .ant-menu-item:hover .app-icon-nav,
      .ant-menu-submenu-title:hover .app-icon-nav {
        color: ${token.colorPrimary};
      }
      .ant-menu-item-selected .app-icon-nav,
      .ant-menu-submenu-selected > .ant-menu-submenu-title .app-icon-nav {
        color: ${token.colorPrimary};
      }
      .app-icon-nav-locked {
        color: ${token.colorTextQuaternary};
      }
      .ant-menu-item:hover .app-icon-nav-locked,
      .ant-menu-submenu-title:hover .app-icon-nav-locked,
      .ant-menu-item-selected .app-icon-nav-locked,
      .ant-menu-submenu-selected > .ant-menu-submenu-title .app-icon-nav-locked {
        color: ${token.colorTextQuaternary};
      }

      /* Grid action icon — color only; hover plate is on the host button */
      .app-icon-grid-action {
        color: ${token.colorText};
        cursor: pointer;
        padding: 4px;
        border-radius: ${token.borderRadiusSM}px;
        transition: color 0.15s ease, background-color 0.15s ease;
      }
      .app-icon-grid-action:hover {
        color: ${token.colorPrimary} !important;
        background-color: ${primaryHoverBg};
      }

      /* Nested inside ant button / list-action — kill icon plate (fixes double bg) */
      .ant-btn .app-icon-grid-action,
      .list-action-button .app-icon-grid-action {
        padding: 0;
        border-radius: 0;
        background: transparent !important;
      }
      .ant-btn .app-icon-grid-action:hover,
      .list-action-button .app-icon-grid-action:hover {
        background: transparent !important;
      }

      /* Single hover plate on the Actions-column button */
      .ant-btn:has(.app-icon-grid-action),
      .list-action-button.ant-btn {
        width: ${token.controlHeightSM}px;
        min-width: ${token.controlHeightSM}px;
        height: ${token.controlHeightSM}px;
        padding: 0 !important;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: ${token.borderRadiusSM}px;
        line-height: 1;
      }
      .ant-btn:has(.app-icon-grid-action):hover,
      .ant-btn:has(.app-icon-grid-action):focus,
      .list-action-button.ant-btn:hover,
      .list-action-button.ant-btn:focus {
        background-color: ${primaryHoverBg} !important;
      }

      /* Unique per-action tones */
      ${toneRules}

      .ant-btn-primary .app-icon,
      .sm-app-button.ant-btn-primary .app-icon,
      .primary-surface .app-icon {
        color: ${token.colorTextLightSolid};
      }
      .app-icon-inherit .app-icon {
        color: inherit !important;
      }
      .ant-dropdown-menu-item-danger:hover .app-icon,
      .ant-dropdown-menu-item-danger.ant-dropdown-menu-item-active .app-icon {
        color: ${token.colorTextLightSolid} !important;
      }
    `}</style>
  );
}
