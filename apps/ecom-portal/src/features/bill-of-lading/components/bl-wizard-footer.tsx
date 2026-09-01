// Modified by Sekar Nagarajan (2026-09-01 17:40)
/**
 * BL wizard footer — matches booking step placement:
 * - Default: Previous (+ Cancel / extras) + Next all on the right
 * - Split (Preview step): Previous/Cancel on the left, primary actions on the right
 */
import { AppButton } from "@solverminds/shared-ui";
import type { ReactNode } from "react";

interface BlWizardFooterProps {
  onPrevious: () => void;
  onNext?: () => void;
  onCancel?: () => void;
  isFirstStep?: boolean;
  isSubmitting?: boolean;
  nextHtmlType?: "button" | "submit";
  nextLabel?: string;
  nextIcon?: ReactNode;
  nextLoading?: boolean;
  /** Preview/final step: Previous/Cancel left, actions right (booking Preview parity). */
  split?: boolean;
  extraStart?: ReactNode;
  /** Secondary actions before Next (e.g. Skip Insurance). */
  extraEnd?: ReactNode;
}

export function BlWizardFooter({
  onPrevious,
  onNext,
  onCancel,
  isFirstStep = false,
  isSubmitting = false,
  nextHtmlType = "button",
  nextLabel = "Next",
  nextIcon,
  nextLoading = false,
  split = false,
  extraStart,
  extraEnd,
}: BlWizardFooterProps) {
  const previousButton = (
    <AppButton
      htmlType="button"
      onClick={onPrevious}
      disabled={isFirstStep || isSubmitting}
    >
      Previous
    </AppButton>
  );

  const cancelButton = onCancel ? (
    <AppButton htmlType="button" onClick={onCancel} disabled={isSubmitting}>
      Cancel
    </AppButton>
  ) : null;

  const nextButton =
    onNext || nextHtmlType === "submit" ? (
      <AppButton
        type="primary"
        htmlType={nextHtmlType}
        icon={nextIcon}
        loading={nextLoading}
        disabled={isSubmitting}
        onClick={nextHtmlType === "submit" ? undefined : onNext}
      >
        {nextLabel}
      </AppButton>
    ) : null;

  if (split) {
    return (
      <div className="form-step-footer form-step-footer--split">
        <div className="form-step-footer__start custom-scroll">
          {previousButton}
          {cancelButton}
          {extraStart}
        </div>
        <div className="form-step-footer__end custom-scroll">
          {extraEnd}
          {nextButton}
        </div>
      </div>
    );
  }

  // Modified by Sekar Nagarajan (2026-09-01 17:40) — booking parity: actions on the right
  return (
    <div className="form-step-footer">
      {previousButton}
      {cancelButton}
      {extraStart}
      {extraEnd}
      {nextButton}
    </div>
  );
}
