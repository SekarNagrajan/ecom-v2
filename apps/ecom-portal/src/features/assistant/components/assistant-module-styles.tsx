// Modified by Sekar Nagarajan (2026-10-20 20:25)
// Modified by Sekar Nagarajan (2026-10-20 18:07)
import { theme } from "antd";

import { tokenMix } from "../../theme/utils/token-mix";

export function AssistantModuleStyles() {
  const { token } = theme.useToken();
  const primaryTint8 = tokenMix(token.colorPrimary, 8);
  const primaryTint12 = tokenMix(token.colorPrimary, 12);
  const primaryTint22 = tokenMix(token.colorPrimary, 22);
  const infoTint12 = tokenMix(token.colorInfo, 12);

  return (
    <style>{`
      /* ---------- Header launcher ----------
         Sizing, color and hover come from .app-header-action so it is
         pixel-identical to the fullscreen action; only the open state
         adds a primary tint. */
      .assistant-launcher--active.ant-btn {
        background: ${primaryTint12};
      }
      .assistant-launcher--active.ant-btn .app-icon {
        color: ${token.colorPrimary};
      }

      /* ---------- Floating window (bottom-right corner, no mask) ---------- */
      .assistant-window {
        position: fixed;
        right: ${token.marginLG}px;
        bottom: ${token.marginLG}px;
        z-index: ${token.zIndexPopupBase + 10};
        width: min(520px, calc(100vw - ${token.marginLG * 2}px));
        height: min(720px, calc(100vh - 96px));
        height: min(720px, calc(100dvh - 96px));
        display: flex;
        flex-direction: column;
        min-height: 0;
        overflow: hidden;
        background: ${token.colorBgContainer};
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG + 4}px;
        box-shadow: ${token.boxShadow};
        letter-spacing: var(--app-letter-spacing, 0em);
        transform-origin: bottom right;
        animation: assistant-window-in 0.18s ease-out;
        transition: width 0.2s ease, height 0.2s ease,
          right 0.2s ease, bottom 0.2s ease, top 0.2s ease, left 0.2s ease;
      }
      .assistant-window--expanded {
        /* Stay bottom-right; only grow modestly vs the default card */
        top: auto;
        left: auto;
        width: min(720px, calc(100vw - ${token.marginLG * 2}px));
        height: min(780px, calc(100vh - 96px));
        height: min(780px, calc(100dvh - 96px));
      }
      .assistant-window__header {
        flex: none;
        display: flex;
        align-items: center;
        padding: ${token.paddingSM}px ${token.padding}px;
        border-bottom: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
      }
      .assistant-window__header .assistant-panel-header { flex: 1; }
      .assistant-window__body {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
        background: ${token.colorBgLayout};
      }
      .assistant-window__footer {
        flex: none;
        padding: ${token.paddingSM}px ${token.padding}px ${token.padding}px;
        border-top: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
      }
      .assistant-panel-header {
        display: flex;
        align-items: center;
        gap: ${token.marginSM}px;
        min-width: 0;
      }
      .assistant-panel-header__icon {
        flex: none;
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: ${token.controlHeightLG}px;
        height: ${token.controlHeightLG}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${primaryTint12};
        border: 1px solid ${primaryTint22};
        color: ${token.colorPrimary};
      }
      .assistant-panel-header__dot {
        position: absolute;
        right: -2px;
        bottom: -2px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: ${token.colorSuccess};
        border: 2px solid ${token.colorBgContainer};
      }
      .assistant-panel-header__status.ant-typography {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        font-size: ${token.fontSizeSM}px;
      }
      .assistant-panel-header__status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: ${token.colorSuccess};
      }
      .assistant-panel-header__copy { min-width: 0; flex: 1; }
      .assistant-panel-header__title.ant-typography { margin: 0 !important; }
      .assistant-panel-header__acting {
        display: block;
        color: ${token.colorWarning};
        font-size: ${token.fontSizeSM}px;
      }
      .assistant-panel-header__extra {
        display: flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        flex-wrap: wrap;
        justify-content: flex-end;
      }
      .assistant-mode-select.ant-select {
        min-width: 148px;
        max-width: 200px;
      }
      .assistant-mode-select .ant-select-selector {
        border-radius: ${token.borderRadiusLG}px !important;
      }
      .assistant-sql-code {
        margin: 0 0 ${token.marginXS}px;
        padding: ${token.paddingXS}px ${token.paddingSM}px;
        border-radius: ${token.borderRadius}px;
        background: ${token.colorFillTertiary};
        color: ${token.colorTextSecondary};
        font-size: ${token.fontSizeSM}px;
        white-space: pre-wrap;
        word-break: break-word;
        max-height: 120px;
        overflow: auto;
      }
      .assistant-card--automation .assistant-card__body,
      .assistant-card--sql .assistant-card__body {
        margin-bottom: ${token.marginXS}px;
      }

      /* ---------- Message list ---------- */
      .assistant-messages-shell {
        position: relative;
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
      }
      .assistant-scroll-bottom.ant-btn {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        bottom: ${token.marginSM}px;
        z-index: 2;
        background: ${token.colorBgElevated};
        border: 1px solid ${token.colorBorderSecondary};
        box-shadow: ${token.boxShadowSecondary};
        color: ${token.colorPrimary};
      }
      .assistant-scroll-bottom.ant-btn:hover {
        border-color: ${token.colorPrimary};
        background: ${primaryTint8};
      }
      .assistant-messages {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
        padding: ${token.paddingMD}px;
        scroll-behavior: smooth;
      }
      .assistant-row {
        display: flex;
        gap: ${token.marginXS}px;
        align-items: flex-start;
        max-width: 100%;
      }
      .assistant-row--user { justify-content: flex-end; align-items: flex-end; }
      /* Assistant content is a full-width column beside the avatar, boxed with
         a border + tinted background so each response reads as one unit. */
      .assistant-content {
        flex: 1;
        min-width: 0;
        max-width: none;
        display: flex;
        flex-direction: column;
        color: ${token.colorText};
        font-size: ${token.fontSize}px;
        line-height: ${token.lineHeight};
        letter-spacing: var(--app-letter-spacing, 0em);
        overflow-wrap: break-word;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgElevated};
        border-radius: ${token.borderRadiusLG}px;
        padding: ${token.paddingSM}px ${token.padding}px;
      }
      .assistant-block + .assistant-block { margin-top: ${token.marginSM}px; }
      /* Blocks own their spacing — neutralise the inner components' margins. */
      .assistant-block > .assistant-md > :first-child { margin-top: 0; }
      .assistant-block > .assistant-md > :last-child { margin-bottom: 0; }
      .assistant-block > .assistant-card { margin-top: 0; width: 100%; }
      .assistant-block > .assistant-tool-row { margin-bottom: 0; }
      .assistant-content--error {
        border: 1px solid ${token.colorErrorBorder};
        background: ${token.colorErrorBg};
        border-radius: ${token.borderRadiusLG}px;
        padding: ${token.paddingSM}px ${token.padding}px;
      }
      /* One meta line (time + actions) under the content, matching the user side. */
      .assistant-meta {
        display: flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        margin-top: ${token.marginXS}px;
      }
      .assistant-avatar {
        flex: none;
        width: ${token.controlHeightSM}px;
        height: ${token.controlHeightSM}px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: ${primaryTint12};
        border: 1px solid ${primaryTint22};
        color: ${token.colorPrimary};
      }
      .assistant-bubble-stack {
        display: flex;
        flex-direction: column;
        gap: 2px;
        max-width: 92%;
        min-width: 0;
      }
      .assistant-bubble-stack--user { align-items: flex-end; }
      .assistant-bubble-stack .assistant-bubble { max-width: 100%; }
      .assistant-time {
        color: ${token.colorTextQuaternary};
        font-size: ${token.fontSizeSM - 1}px;
        padding: 0 ${token.paddingXXS}px;
      }

      /* ---------- Bubbles ---------- */
      .assistant-bubble {
        max-width: 92%;
        min-width: 0;
        padding: ${token.paddingSM}px ${token.padding}px;
        border-radius: ${token.borderRadiusLG}px;
        font-size: ${token.fontSize}px;
        line-height: ${token.lineHeight};
        letter-spacing: var(--app-letter-spacing, 0em);
        overflow-wrap: break-word;
      }
      .assistant-bubble--user {
        background: ${token.colorPrimary};
        color: ${token.colorTextLightSolid};
        border-bottom-right-radius: ${token.borderRadiusXS}px;
        white-space: pre-wrap;
      }
      .assistant-bubble--assistant {
        background: ${token.colorBgContainer};
        color: ${token.colorText};
        border: 1px solid ${token.colorBorderSecondary};
        border-bottom-left-radius: ${token.borderRadiusXS}px;
        box-shadow: ${token.boxShadowTertiary};
      }
      .assistant-bubble--error {
        border-color: ${token.colorErrorBorder};
        background: ${token.colorErrorBg};
      }
      .assistant-bubble__stopped {
        color: ${token.colorTextTertiary};
        font-size: ${token.fontSizeSM}px;
        font-style: italic;
      }
      .assistant-caret::after {
        content: "";
        display: inline-block;
        width: 2px;
        height: 1em;
        margin-left: 2px;
        vertical-align: text-bottom;
        background: ${token.colorPrimary};
        animation: assistant-blink 1s steps(2) infinite;
      }

      /* ---------- Markdown ---------- */
      .assistant-md > :first-child { margin-top: 0; }
      .assistant-md > :last-child { margin-bottom: 0; }
      .assistant-md p { margin: 0 0 ${token.marginXS}px; }
      /* Headings scaled for a narrow chat panel — never larger than fontSizeLG. */
      .assistant-md h1,
      .assistant-md h2,
      .assistant-md h3,
      .assistant-md h4 {
        margin: ${token.marginSM}px 0 ${token.marginXS}px;
        font-weight: ${token.fontWeightStrong};
        line-height: 1.4;
      }
      .assistant-md h1 { font-size: ${token.fontSizeLG}px; }
      .assistant-md h2 { font-size: ${token.fontSizeLG}px; }
      .assistant-md h3 { font-size: ${token.fontSize}px; }
      .assistant-md h4 { font-size: ${token.fontSize}px; color: ${token.colorTextSecondary}; }
      .assistant-md ul,
      .assistant-md ol {
        margin: 0 0 ${token.marginXS}px;
        padding-left: ${token.paddingLG}px;
      }
      /* Nested lists tighten up and keep ordered numbering aligned. */
      .assistant-md li { margin: 0 0 ${token.marginXXS}px; }
      .assistant-md li > ul,
      .assistant-md li > ol { margin: ${token.marginXXS}px 0 0; }
      .assistant-md ol { list-style-position: outside; }
      .assistant-md blockquote {
        margin: 0 0 ${token.marginXS}px;
        padding: ${token.paddingXXS}px ${token.paddingSM}px;
        border-left: 3px solid ${token.colorBorder};
        color: ${token.colorTextSecondary};
      }
      .assistant-md hr {
        margin: ${token.marginSM}px 0;
        border: none;
        border-top: 1px solid ${token.colorBorderSecondary};
      }
      .assistant-md a { color: ${token.colorLink}; }
      .assistant-md a:hover { color: ${token.colorLinkHover}; }
      .assistant-md code {
        padding: 0 ${token.paddingXXS}px;
        border-radius: ${token.borderRadiusSM}px;
        background: ${token.colorFillTertiary};
        font-family: ${token.fontFamilyCode};
        font-size: ${token.fontSizeSM}px;
        /* Keep identifiers (e.g. BKON260016) intact rather than breaking mid-word. */
        overflow-wrap: normal;
        word-break: keep-all;
      }
      .assistant-md pre {
        margin: 0 0 ${token.marginXS}px;
        padding: ${token.paddingSM}px;
        border-radius: ${token.borderRadius}px;
        background: ${token.colorFillTertiary};
        overflow-x: auto;
      }
      .assistant-md pre code {
        padding: 0;
        background: transparent;
        white-space: pre;
        word-break: normal;
      }
      /* Wide tables scroll horizontally inside the message. */
      .assistant-md__table-wrap {
        margin: ${token.marginXS}px 0;
        overflow-x: auto;
        max-width: 100%;
      }
      .assistant-md__table-wrap table {
        width: max-content;
        min-width: 100%;
        border-collapse: collapse;
        margin: 0;
        font-size: ${token.fontSizeSM}px;
      }
      .assistant-md th,
      .assistant-md td {
        border: 1px solid ${token.colorBorderSecondary};
        padding: ${token.paddingXXS}px ${token.paddingXS}px;
        text-align: left;
        /* IDs and codes stay on one line; the last column may wrap. */
        overflow-wrap: normal;
        white-space: nowrap;
      }
      .assistant-md th:last-child,
      .assistant-md td:last-child { white-space: normal; }
      .assistant-md th {
        background: ${token.colorFillQuaternary};
        font-weight: ${token.fontWeightStrong};
      }

      /* ---------- Actions, tools, citations ---------- */
      .assistant-actions {
        display: flex;
        gap: ${token.marginXXS}px;
        align-items: center;
        opacity: 0.85;
      }
      .assistant-actions .ant-btn { color: ${token.colorTextSecondary}; }
      .assistant-actions .assistant-actions__on .app-icon {
        color: ${token.colorPrimary};
      }
      .assistant-tool-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: ${token.marginXS}px;
        width: 100%;
        max-width: 280px;
        padding: ${token.paddingXS}px ${token.paddingSM}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgLayout};
        color: ${token.colorTextSecondary};
        font-size: ${token.fontSizeSM}px;
        margin-bottom: ${token.marginXS}px;
      }
      .assistant-tool-row--running {
        border-color: ${primaryTint22};
        background: ${primaryTint8};
        color: ${token.colorText};
      }
      .assistant-tool-row--done {
        border-color: ${token.colorSuccessBorder};
        background: ${token.colorSuccessBg};
        color: ${token.colorSuccessText};
      }
      .assistant-tool-row--failed {
        border-color: ${token.colorWarningBorder};
        background: ${token.colorWarningBg};
        color: ${token.colorWarningText};
      }
      .assistant-tool-row__label {
        flex: 1;
        min-width: 0;
        line-height: 1.3;
      }
      .assistant-tool-row__spinner {
        flex: none;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid ${primaryTint22};
        border-top-color: ${token.colorPrimary};
        animation: assistant-spin 0.7s linear infinite;
      }
      .assistant-tool-row__track {
        flex: 1 1 100%;
        height: 3px;
        border-radius: ${token.borderRadiusSM}px;
        background: ${token.colorFillSecondary};
        overflow: hidden;
      }
      .assistant-tool-row__bar {
        display: block;
        width: 40%;
        height: 100%;
        border-radius: inherit;
        background: ${token.colorPrimary};
        animation: assistant-indeterminate 1.1s ease-in-out infinite;
      }
      .assistant-tool-group {
        margin-bottom: ${token.marginXS}px;
      }
      .assistant-tool-group__toggle {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
        max-width: 100%;
        padding: ${token.paddingXXS}px ${token.paddingSM}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorSuccessBorder};
        background: ${token.colorSuccessBg};
        color: ${token.colorSuccessText};
        font-size: ${token.fontSizeSM}px;
        line-height: 1.3;
        cursor: pointer;
      }
      .assistant-tool-group__toggle:hover {
        border-color: ${token.colorSuccess};
      }
      .assistant-tool-group__toggle:focus-visible {
        outline: 2px solid ${token.colorPrimary};
        outline-offset: 1px;
      }
      .assistant-tool-group__summary {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .assistant-tool-group__list {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        margin-top: ${token.marginXS}px;
      }
      .assistant-citations {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginXXS}px;
        margin-top: ${token.marginXS}px;
      }
      .assistant-citation {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        padding: 0 ${token.paddingXS}px;
        height: ${token.controlHeightSM}px;
        border: 1px solid ${token.colorBorder};
        border-radius: ${token.borderRadiusSM}px;
        color: ${token.colorPrimary};
        background: ${token.colorBgContainer};
        font-size: ${token.fontSizeSM}px;
        cursor: pointer;
      }
      .assistant-citation:hover {
        border-color: ${token.colorPrimary};
        background: ${primaryTint8};
      }
      .assistant-citation:focus-visible {
        outline: 2px solid ${token.colorPrimary};
        outline-offset: 1px;
      }

      /* ---------- Result cards ---------- */
      .assistant-card {
        margin-top: ${token.marginXS}px;
        padding: ${token.paddingSM}px ${token.padding}px;
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
      }
      .assistant-card__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginXS}px;
        margin-bottom: ${token.marginXS}px;
      }
      .assistant-card__title.ant-typography {
        margin: 0 !important;
        font-size: ${token.fontSize}px;
      }
      .assistant-card__meta {
        color: ${token.colorTextSecondary};
        font-size: ${token.fontSizeSM}px;
      }
      .assistant-card__body {
        color: ${token.colorTextSecondary};
        font-size: ${token.fontSizeSM}px;
      }
      .assistant-card__footer,
      .assistant-card__actions {
        display: flex;
        justify-content: flex-end;
        flex-wrap: wrap;
        gap: ${token.marginXS}px;
        margin-top: ${token.marginSM}px;
      }
      /* Long Malay/Spanish labels wrap instead of overflowing the card. */
      .assistant-card__footer .ant-btn,
      .assistant-card__actions .ant-btn {
        max-width: 100%;
        height: auto;
        min-height: ${token.controlHeightSM}px;
        white-space: normal;
        text-align: center;
      }
      .assistant-card__footer .ant-btn > span,
      .assistant-card__actions .ant-btn > span {
        overflow-wrap: break-word;
      }
      .assistant-card--prefill {
        border-color: ${primaryTint22};
        background: ${primaryTint8};
      }
      .assistant-card--error {
        border-color: ${token.colorWarningBorder};
        background: ${token.colorWarningBg};
      }
      .assistant-card--error .assistant-card__title.ant-typography {
        color: ${token.colorWarningText};
      }
      .assistant-card .ant-descriptions-item-label {
        color: ${token.colorTextSecondary};
      }
      .assistant-card__sailing-row {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        padding: ${token.paddingXS}px 0;
        border-bottom: 1px solid ${token.colorBorderSecondary};
      }
      .assistant-card__sailing-row:last-child { border-bottom: none; }

      /* ---------- Welcome: centered hero + suggestion rows ---------- */
      .assistant-welcome {
        display: flex;
        flex-direction: column;
        justify-content: center;
        flex: 1;
        gap: ${token.marginLG}px;
        padding: ${token.paddingLG}px ${token.paddingMD}px;
        min-height: 100%;
        overflow-y: auto;
      }
      .assistant-welcome__hero {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: ${token.marginXS}px;
        text-align: center;
      }
      .assistant-welcome__avatar {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: ${primaryTint12};
        border: 1px solid ${primaryTint22};
        color: ${token.colorPrimary};
      }
      .assistant-welcome__title.ant-typography { margin: 0 !important; }
      .assistant-welcome__body {
        margin: 0;
        color: ${token.colorTextTertiary};
        font-size: ${token.fontSizeSM}px;
        text-align: center;
        max-width: 320px;
      }
      .assistant-suggestions {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXS}px;
        width: 100%;
      }
      .assistant-suggestion {
        display: flex;
        align-items: center;
        gap: ${token.marginSM}px;
        width: 100%;
        padding: ${token.paddingSM}px ${token.padding}px;
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
        color: ${token.colorText};
        text-align: left;
        cursor: pointer;
        font: inherit;
        letter-spacing: var(--app-letter-spacing, 0em);
      }
      .assistant-suggestion:hover,
      .assistant-suggestion:focus-visible {
        border-color: ${token.colorPrimary};
        background: ${primaryTint8};
        outline: none;
      }
      .assistant-suggestion__icon {
        flex: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: ${token.controlHeightSM}px;
        height: ${token.controlHeightSM}px;
        border-radius: ${token.borderRadiusSM}px;
        background: ${primaryTint8};
        color: ${token.colorPrimary};
      }
      .assistant-suggestion__go {
        flex: none;
        display: inline-flex;
        color: ${token.colorTextQuaternary};
        opacity: 0;
        transition: opacity 0.15s ease;
      }
      .assistant-suggestion:hover .assistant-suggestion__go,
      .assistant-suggestion:focus-visible .assistant-suggestion__go {
        opacity: 1;
        color: ${token.colorPrimary};
      }
      .assistant-suggestion__label {
        flex: 1;
        min-width: 0;
        white-space: normal;
      }

      /* ---------- Thinking / status chip ---------- */
      .assistant-status-chip {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginSM}px;
        max-width: 92%;
        min-width: 148px;
        min-height: ${token.controlHeightLG}px;
        padding: ${token.paddingSM}px ${token.padding}px
          ${token.paddingSM}px ${token.paddingSM}px;
        border-radius: ${token.borderRadiusLG + 4}px;
        border: 1px solid ${primaryTint22};
        background: ${primaryTint8};
        box-shadow: ${token.boxShadowTertiary};
        color: ${token.colorText};
        animation: assistant-status-in 0.22s ease-out;
      }
      .assistant-status-chip__pulse {
        flex: none;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: ${token.colorPrimary};
        box-shadow: 0 0 0 0 ${primaryTint22};
        animation: assistant-pulse 1.6s ease-out infinite;
      }
      .assistant-status-chip__copy {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
        min-width: 0;
      }
      .assistant-status-chip__label {
        font-size: ${token.fontSize}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorPrimary};
        letter-spacing: var(--app-letter-spacing, 0em);
        white-space: nowrap;
        animation: assistant-label-fade 0.35s ease;
      }
      .assistant-status-chip__dots {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .assistant-status-chip__dots span {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: ${token.colorPrimary};
        opacity: 0.45;
        animation: assistant-bounce 1.15s infinite ease-in-out;
      }
      .assistant-status-chip__dots span:nth-child(2) { animation-delay: 0.14s; }
      .assistant-status-chip__dots span:nth-child(3) { animation-delay: 0.28s; }

      /* ---------- Composer: CRM/Cursor card — textarea top, toolbar bottom ---------- */
      .assistant-composer-shell {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
      }
      .assistant-composer {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXS}px;
        padding: ${token.paddingSM}px;
        border: 1px solid ${token.colorBorder};
        border-radius: ${token.borderRadiusLG + 6}px;
        background: ${token.colorBgContainer};
      }
      .assistant-composer:focus-within {
        border-color: ${token.colorPrimary};
        box-shadow: 0 0 0 2px ${primaryTint12};
      }
      .assistant-composer__input,
      .assistant-composer__input.ant-input,
      .assistant-composer textarea.ant-input {
        width: 100%;
        resize: none;
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        outline: none !important;
        padding: 0 !important;
      }
      .assistant-composer__input.ant-input:hover,
      .assistant-composer__input.ant-input:focus,
      .assistant-composer__input.ant-input-focused,
      .assistant-composer textarea.ant-input:hover,
      .assistant-composer textarea.ant-input:focus,
      .assistant-composer textarea.ant-input-focused {
        border: none !important;
        box-shadow: none !important;
        outline: none !important;
        background: transparent !important;
      }
      .assistant-composer__footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginXS}px;
        min-width: 0;
      }
      .assistant-composer__footer-start {
        display: flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        min-width: 0;
        overflow: hidden;
      }
      .assistant-composer__actions {
        display: flex;
        flex: none;
        align-items: center;
        gap: ${token.marginXXS}px;
      }
      .assistant-composer__actions .ant-btn {
        color: ${token.colorTextSecondary};
      }
      .assistant-composer__send.ant-btn {
        flex: none;
        width: ${token.controlHeight - 4}px;
        height: ${token.controlHeight - 4}px;
        min-width: ${token.controlHeight - 4}px;
      }
      .assistant-composer__send.ant-btn-primary {
        color: ${token.colorTextLightSolid};
      }
      .assistant-composer__meta {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: ${token.marginXXS}px;
        color: ${token.colorTextTertiary};
      }
      .assistant-composer__hint {
        color: ${token.colorTextTertiary};
        font-size: ${token.fontSizeSM}px;
        text-align: center;
      }
      .assistant-composer__count {
        color: ${token.colorWarningText};
        font-size: ${token.fontSizeSM}px;
        font-variant-numeric: tabular-nums;
      }

      /* ---------- Expanded window: modestly larger action hit targets ---------- */
      .assistant-window--expanded .assistant-composer__actions {
        gap: ${token.marginXS}px;
      }
      .assistant-window--expanded .assistant-composer__actions .ant-btn {
        width: ${token.controlHeight}px;
        height: ${token.controlHeight}px;
        min-width: ${token.controlHeight}px;
      }
      .assistant-window--expanded .assistant-composer__send.ant-btn {
        width: ${token.controlHeight + 4}px;
        height: ${token.controlHeight + 4}px;
        min-width: ${token.controlHeight + 4}px;
      }

      /* ---------- History view (Rovo-style session list) ---------- */
      .assistant-history {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXS}px;
        padding: ${token.paddingMD}px;
      }
      .assistant-history--empty {
        align-items: center;
        justify-content: center;
        gap: ${token.marginSM}px;
      }
      .assistant-history__empty-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: ${token.colorFillTertiary};
        color: ${token.colorTextTertiary};
      }
      .assistant-history-pane {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
      }
      .assistant-history-toolbar {
        flex: none;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXS}px;
        padding: ${token.paddingSM}px ${token.paddingMD}px 0;
      }
      .assistant-history-toolbar__actions {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginXXS}px;
      }
      .assistant-history__row {
        display: flex;
        align-items: center;
        gap: ${token.marginXS}px;
        width: 100%;
        padding: ${token.paddingXS}px ${token.paddingSM}px;
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
        color: ${token.colorText};
        text-align: left;
        font: inherit;
        letter-spacing: var(--app-letter-spacing, 0em);
      }
      .assistant-history__row:hover,
      .assistant-history__row:focus-within {
        border-color: ${token.colorPrimary};
        background: ${primaryTint8};
      }
      .assistant-history__row--pinned {
        border-color: ${primaryTint22};
        background: ${primaryTint8};
      }
      .assistant-history__row-main {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 0;
        border: none;
        background: none;
        color: inherit;
        text-align: left;
        cursor: pointer;
        font: inherit;
      }
      .assistant-history__row-main:focus-visible {
        outline: 2px solid ${token.colorPrimary};
        outline-offset: 2px;
        border-radius: ${token.borderRadiusSM}px;
      }
      .assistant-history__row-actions {
        flex: none;
        display: flex;
        align-items: center;
        gap: 0;
        opacity: 0;
        transition: opacity 0.15s ease;
      }
      .assistant-history__row:hover .assistant-history__row-actions,
      .assistant-history__row:focus-within .assistant-history__row-actions,
      .assistant-history__row--pinned .assistant-history__row-actions {
        opacity: 1;
      }
      @media (hover: none) {
        .assistant-history__row-actions { opacity: 1; }
      }
      .assistant-history__rename { flex: 1; min-width: 0; }
      .assistant-history__row-icon {
        flex: none;
        display: inline-flex;
        color: ${token.colorPrimary};
      }
      .assistant-history__row-copy {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .assistant-history__row-title {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .assistant-history__row-meta {
        color: ${token.colorTextTertiary};
        font-size: ${token.fontSizeSM}px;
      }
      .assistant-history__row-go {
        flex: none;
        display: inline-flex;
        color: ${token.colorTextQuaternary};
      }
      .assistant-header-action--active.ant-btn {
        background: ${primaryTint12};
        color: ${token.colorPrimary};
      }

      /* ---------- Screen-context pill (Rovo-style) ---------- */
      .assistant-context-pill {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        padding: 2px ${token.paddingXS}px;
        border: 1px solid ${primaryTint22};
        border-radius: 999px;
        background: ${primaryTint8};
        color: ${token.colorPrimary};
        font-size: ${token.fontSizeSM}px;
        cursor: pointer;
        letter-spacing: var(--app-letter-spacing, 0em);
      }
      .assistant-context-pill--off {
        border-color: ${token.colorBorderSecondary};
        background: transparent;
        color: ${token.colorTextTertiary};
        text-decoration: line-through;
      }
      .assistant-context-pill:hover,
      .assistant-context-pill:focus-visible {
        border-color: ${token.colorPrimary};
        outline: none;
      }

      /* ---------- Loading ---------- */
      .assistant-loading-center {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 240px;
        padding: ${token.paddingLG}px;
      }

      /* ---------- Accessibility: contrast ---------- */
      html[data-contrast="high"] .assistant-bubble--user,
      html[data-contrast="high"] .assistant-card,
      html[data-contrast="high"] .assistant-tool-row,
      html[data-contrast="high"] .assistant-window,
      html[data-contrast="high"] .assistant-composer {
        border-color: ${token.colorText};
      }
      html[data-contrast="high"] .assistant-composer:focus-within {
        border-color: ${token.colorPrimary};
      }
      html[data-contrast="high"] .assistant-citation,
      html[data-contrast="high"] .assistant-tool-group__toggle {
        border-color: ${token.colorText};
      }
      /* Keep an obvious keyboard focus ring on every interactive surface. */
      .assistant-card .ant-btn:focus-visible,
      .assistant-content a:focus-visible {
        outline: 2px solid ${token.colorPrimary};
        outline-offset: 1px;
      }

      @keyframes assistant-window-in {
        from { opacity: 0; transform: translateY(12px) scale(0.96); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes assistant-status-in {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes assistant-label-fade {
        from { opacity: 0; transform: translateY(2px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes assistant-blink { to { visibility: hidden; } }
      @keyframes assistant-bounce {
        0%, 80%, 100% { transform: translateY(0) scale(0.7); opacity: 0.35; }
        40% { transform: translateY(-2px) scale(1); opacity: 1; }
      }
      @keyframes assistant-pulse {
        0% { box-shadow: 0 0 0 0 ${primaryTint22}; opacity: 1; }
        70% { box-shadow: 0 0 0 8px transparent; opacity: 0.85; }
        100% { box-shadow: 0 0 0 0 transparent; opacity: 1; }
      }
      @keyframes assistant-spin {
        to { transform: rotate(360deg); }
      }
      @keyframes assistant-indeterminate {
        0% { transform: translateX(-120%); }
        100% { transform: translateX(320%); }
      }
      @media (prefers-reduced-motion: reduce) {
        .assistant-caret::after,
        .assistant-status-chip__dots span,
        .assistant-status-chip__pulse,
        .assistant-status-chip__label,
        .assistant-tool-row__spinner,
        .assistant-tool-row__bar { animation: none; }
        .assistant-window,
        .assistant-status-chip { animation: none; transition: none; }
        .assistant-messages { scroll-behavior: auto; }
      }

      @media (max-width: 767px) {
        .assistant-window {
          inset: 0;
          width: auto;
          height: auto;
          border: none;
          border-radius: 0;
        }
        .assistant-messages {
          padding: ${token.paddingSM}px;
          gap: ${token.marginSM}px;
        }
        .assistant-bubble { max-width: 96%; }
        .assistant-avatar { display: none; }
        .assistant-card__footer .ant-btn,
        .assistant-card__actions .ant-btn { flex: 1; }
      }
    `}</style>
  );
}
