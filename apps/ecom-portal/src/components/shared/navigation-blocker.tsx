// Modified by Sekar Nagarajan (2026-09-15 16:40)
import { AppButton, AppModal } from "@solverminds/shared-ui";
import { useAntdBreakpoint } from "@solverminds/shared-ui/hooks";
import { useBlocker } from "@tanstack/react-router";
import { Flex, Typography, theme } from "antd";
import type { FC } from "react";
import { useState } from "react";

export interface NavigationBlockerProps {
  shouldBlock: boolean;
  onSave?: () => Promise<boolean> | boolean;
  onDiscard?: () => void;
  title?: string;
  message?: string;
}

/** Blocks in-app navigation and browser unload when `shouldBlock` is true. */
export const NavigationBlocker: FC<NavigationBlockerProps> = ({
  shouldBlock,
  onSave,
  onDiscard,
  title = "Unsaved Changes",
  message = onSave
    ? "You have unsaved changes. Save them before leaving, discard them, or stay on this page."
    : "You have unsaved changes. Stay on this page to keep working, or discard them and leave.",
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const { token } = theme.useToken();
  const { isMobile } = useAntdBreakpoint();

  const blocker = useBlocker({
    shouldBlockFn: () => shouldBlock,
    enableBeforeUnload: shouldBlock,
    withResolver: true,
  });

  const handleSave = async () => {
    if (!onSave) {
      return;
    }

    setIsSaving(true);
    try {
      const shouldProceed = await onSave();
      if (shouldProceed) {
        blocker.proceed?.();
      }
    } catch {
      // Stay on page if save fails
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    onDiscard?.();
    blocker.proceed?.();
  };

  const handleStay = () => {
    blocker.reset?.();
  };

  return (
    <AppModal
      title={title}
      open={blocker.status === "blocked"}
      onCancel={handleStay}
      centered
      closable={!isSaving}
      footer={
        <Flex
          vertical={isMobile}
          justify="end"
          gap={token.marginSM}
          style={{ width: "100%" }}
        >
          <AppButton onClick={handleStay} disabled={isSaving}>
            Stay
          </AppButton>
          <AppButton onClick={handleDiscard} disabled={isSaving} danger>
            Discard
          </AppButton>
          {onSave ? (
            <AppButton type="primary" onClick={() => void handleSave()} loading={isSaving}>
              Save
            </AppButton>
          ) : null}
        </Flex>
      }
    >
      <Typography.Paragraph style={{ marginBottom: 0 }}>
        {message}
      </Typography.Paragraph>
    </AppModal>
  );
};
