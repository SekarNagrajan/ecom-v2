// Created by Sekar Nagarajan (2026-11-12 12:40)
/**
 * Loading / error / empty / content switch for a Control Panel section body. The section header
 * stays mounted around it (agenct.md loading rule); errors render ModuleEmptyState with a retry.
 */
import type { AppEmptyStateProps } from "@solverminds/shared-ui";
import type { ReactNode } from "react";

import {
  ModuleEmptyState,
  buildRetryAction,
} from "../../../../components/shared/module-empty-state";
import { useAdminLabels } from "../../hooks/use-admin-labels";
import { errorMessage } from "../../utils/admin.utils";
import { AdminLoadingCenter } from "./admin-loading-center";

type EmptyAction = NonNullable<AppEmptyStateProps["actions"]>[number];

export interface AdminSectionStateProps {
  children: ReactNode;
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  onRetry: () => void;
  /** When true (and not loading / errored) the blank empty state renders instead of children. */
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyActions?: EmptyAction[];
}

export function AdminSectionState({
  children,
  isLoading,
  isError,
  error,
  onRetry,
  isEmpty = false,
  emptyTitle = "Nothing here yet",
  emptyMessage,
  emptyActions,
}: AdminSectionStateProps) {
  const labels = useAdminLabels();

  if (isLoading) {
    return <AdminLoadingCenter />;
  }
  if (isError) {
    return (
      <ModuleEmptyState
        variant="error"
        title={labels.loadErrorTitle}
        message={errorMessage(error, "The server did not return this section's data.")}
        actions={[buildRetryAction(onRetry, labels.retryLabel)]}
      />
    );
  }
  if (isEmpty) {
    return (
      <ModuleEmptyState
        variant="blank"
        title={emptyTitle}
        message={emptyMessage}
        actions={emptyActions}
      />
    );
  }
  return <>{children}</>;
}
