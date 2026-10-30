import { AppEmptyState, type AppEmptyStateProps } from "@solverminds/shared-ui";
import type { ReactElement } from "react";

type ModuleEmptyStateProps = Omit<AppEmptyStateProps, "title"> & {
  title: AppEmptyStateProps["title"];
};

/** Thin portal wrapper so feature screens share the same AppEmptyState import path. */
export function ModuleEmptyState(props: ModuleEmptyStateProps): ReactElement {
  return <AppEmptyState {...props} artSize={props.artSize ?? "md"} />;
}

export function buildRetryAction(
  onRetry: () => void,
  label = "Try again",
): NonNullable<AppEmptyStateProps["actions"]>[number] {
  return {
    key: "retry",
    label,
    type: "primary",
    onClick: onRetry,
  };
}

export function buildClearFiltersAction(
  onClear: () => void,
  label = "Clear filters",
): NonNullable<AppEmptyStateProps["actions"]>[number] {
  return {
    key: "clear-filters",
    label,
    type: "default",
    onClick: onClear,
  };
}
