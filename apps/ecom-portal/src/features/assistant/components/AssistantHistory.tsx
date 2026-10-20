// Modified by Sekar Nagarajan (2026-10-20 20:15)
import { AppButton } from "@solverminds/shared-ui";
import { useConfirm, useToast } from "@solverminds/shared-ui/hooks";
import { Input, Tooltip, Typography } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import type { useAssistantController } from "../hooks/use-assistant-controller";
import type { ArchivedConversation } from "../store/assistant.store";

const { Text } = Typography;

type Controller = ReturnType<typeof useAssistantController>;

/**
 * Session history pane: search, resume, rename, pin, delete (with undo),
 * clear-all and "archive the live chat". Entries live in the Zustand store
 * and persist to sessionStorage only — they die with the tab and are wiped
 * on logout.
 */
export function AssistantHistory({ controller: c }: { controller: Controller }) {
  const { t, i18n } = useTranslation("assistant");
  const toast = useToast();
  const confirm = useConfirm();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  /** Last deleted chat — powers the Undo action in the toolbar. */
  const [lastDeleted, setLastDeleted] = useState<{
    entry: ArchivedConversation;
    index: number;
  } | null>(null);

  const dateFormat = new Intl.DateTimeFormat(i18n.language, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const query = c.historyQuery.trim().toLowerCase();
  const visible = query
    ? c.archive.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          e.messages.some((m) => m.text.toLowerCase().includes(query)),
      )
    : c.archive;
  const clearableCount = c.archive.filter((e) => !e.pinned).length;

  function handleDelete(entry: ArchivedConversation) {
    const removed = c.deleteArchived(entry.id);
    if (!removed) return;
    toast.success(t("history.deleted", { title: entry.title }));
    // Keep it so the toolbar can restore it at its original position.
    setLastDeleted(removed);
  }

  function handleClearAll() {
    confirm.danger({
      title: t("history.clearConfirmTitle"),
      content: t("history.clearConfirmBody", { count: clearableCount }),
      okText: t("history.clearOk"),
      cancelText: t("actions.cancel", { defaultValue: "Cancel" }),
      onOk: () => {
        const n = c.clearArchive();
        setLastDeleted(null);
        toast.success(t("history.cleared", { count: n }));
      },
    });
  }

  function commitRename(entry: ArchivedConversation) {
    const next = renameDraft.trim();
    if (next && next !== entry.title) {
      c.renameArchived(entry.id, next);
      toast.success(t("history.renamed"));
    }
    setRenamingId(null);
    setRenameDraft("");
  }

  return (
    <div className="assistant-history-pane">
      <div className="assistant-history-toolbar">
        <Input
          allowClear
          size="large"
          className="assistant-history-search"
          value={c.historyQuery}
          onChange={(e) => c.setHistoryQuery(e.target.value)}
          placeholder={t("history.searchPlaceholder")}
          prefix={<AppIcon icon={Icons.search} size={14} />}
          aria-label={t("history.searchPlaceholder")}
        />
        <div className="assistant-history-toolbar__actions">
          {c.hasLiveThread ? (
            <Tooltip title={t("history.archiveCurrentTooltip")}>
              <AppButton
                size="small"
                icon={<AppIcon icon={Icons.download} size={14} />}
                onClick={() => {
                  c.archiveCurrentThread();
                  toast.success(t("history.archived"));
                }}
              >
                {t("history.archiveCurrent")}
              </AppButton>
            </Tooltip>
          ) : null}
          {lastDeleted ? (
            <AppButton
              size="small"
              icon={<AppIcon icon={Icons.refreshCw} size={14} />}
              onClick={() => {
                c.restoreArchived(lastDeleted.entry, lastDeleted.index);
                setLastDeleted(null);
                toast.success(t("history.restored"));
              }}
            >
              {t("history.undo")}
            </AppButton>
          ) : null}
          {clearableCount > 0 ? (
            <AppButton
              size="small"
              danger
              icon={<AppIcon icon={Icons.trash} size={14} />}
              onClick={handleClearAll}
            >
              {t("history.clearAll")}
            </AppButton>
          ) : null}
        </div>
      </div>

      {!c.archive.length ? (
        <div className="assistant-history assistant-history--empty">
          <span className="assistant-history__empty-icon" aria-hidden>
            <AppIcon icon={Icons.history} size={24} />
          </span>
          <Text type="secondary">{t("history.empty")}</Text>
        </div>
      ) : !visible.length ? (
        <div className="assistant-history assistant-history--empty">
          <span className="assistant-history__empty-icon" aria-hidden>
            <AppIcon icon={Icons.searchX} size={24} />
          </span>
          <Text type="secondary">
            {t("history.noMatches", { query: c.historyQuery })}
          </Text>
        </div>
      ) : (
        <div
          className="assistant-history custom-scroll"
          role="list"
          aria-label={t("history.title")}
        >
          {visible.map((entry) => {
            const isRenaming = renamingId === entry.id;
            return (
              <div
                key={entry.id}
                role="listitem"
                className={[
                  "assistant-history__row",
                  entry.pinned ? "assistant-history__row--pinned" : undefined,
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span className="assistant-history__row-icon" aria-hidden>
                  <AppIcon
                    icon={entry.pinned ? Icons.pin : Icons.messageSquare}
                    size={16}
                  />
                </span>

                {isRenaming ? (
                  <Input
                    autoFocus
                    size="large"
                    className="assistant-history__rename"
                    value={renameDraft}
                    maxLength={80}
                    onChange={(e) => setRenameDraft(e.target.value)}
                    onPressEnter={() => commitRename(entry)}
                    onBlur={() => commitRename(entry)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setRenamingId(null);
                        setRenameDraft("");
                      }
                    }}
                    aria-label={t("history.renameLabel")}
                  />
                ) : (
                  <button
                    type="button"
                    className="assistant-history__row-main"
                    onClick={() => c.resumeArchived(entry.id)}
                    title={t("history.resumeTooltip")}
                  >
                    <span className="assistant-history__row-title">
                      {entry.title}
                    </span>
                    <span className="assistant-history__row-meta">
                      {dateFormat.format(entry.updatedAt)} ·{" "}
                      {t("history.messages", { count: entry.messages.length })}{" "}
                      · {t(`modes.${entry.mode}.badge`, { defaultValue: entry.mode })}
                    </span>
                  </button>
                )}

                {!isRenaming ? (
                  <span className="assistant-history__row-actions">
                    <Tooltip
                      title={entry.pinned ? t("history.unpin") : t("history.pin")}
                    >
                      <AppButton
                        type="text"
                        size="small"
                        shape="circle"
                        icon={
                          <AppIcon
                            icon={entry.pinned ? Icons.pinOff : Icons.pin}
                            size={14}
                            tone="history"
                          />
                        }
                        onClick={() => c.togglePinArchived(entry.id)}
                        aria-label={
                          entry.pinned ? t("history.unpin") : t("history.pin")
                        }
                        aria-pressed={Boolean(entry.pinned)}
                      />
                    </Tooltip>
                    <Tooltip title={t("history.rename")}>
                      <AppButton
                        type="text"
                        size="small"
                        shape="circle"
                        icon={
                          <AppIcon icon={Icons.pencil} size={14} tone="edit" />
                        }
                        onClick={() => {
                          setRenamingId(entry.id);
                          setRenameDraft(entry.title);
                        }}
                        aria-label={t("history.rename")}
                      />
                    </Tooltip>
                    <Tooltip title={t("history.delete")}>
                      <AppButton
                        type="text"
                        size="small"
                        shape="circle"
                        icon={
                          <AppIcon icon={Icons.trash} size={14} tone="delete" />
                        }
                        onClick={() => handleDelete(entry)}
                        aria-label={t("history.delete")}
                      />
                    </Tooltip>
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
