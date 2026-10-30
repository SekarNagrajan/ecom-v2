import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import { Alert, Card, Empty, Flex, Typography, theme } from "antd";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import {
  type SpreadsheetImportIssueRecord,
  SPREADSHEET_IMPORT_SERVER_ERROR_CODE,
} from "../types/import-workbench.types";
import {
  PHONE_INVALID_ISSUE_CODE,
  PHONE_MISSING_COUNTRY_CODE_ISSUE_CODE,
} from "../utils/spreadsheet-import-phone.utils";

interface ImportErrorsDrawerProps<TValues extends object> {
  activeIssueId?: string | null;
  issues: readonly SpreadsheetImportIssueRecord<TValues>[];
  mobileMode?: boolean;
  onClose: () => void;
  onJumpToIssue: (issue: SpreadsheetImportIssueRecord<TValues>) => void;
  open: boolean;
  unmatchedHeaders: readonly string[];
}

interface ImportErrorActionProps<TValues extends object> {
  activeIssueId?: string | null;
  issue: SpreadsheetImportIssueRecord<TValues>;
  onJumpToIssue: (issue: SpreadsheetImportIssueRecord<TValues>) => void;
}

function getConciseIssueMessage(
  issue: SpreadsheetImportIssueRecord<object>,
  t: (key: string) => string,
) {
  if (
    issue.code === PHONE_INVALID_ISSUE_CODE ||
    issue.code === PHONE_MISSING_COUNTRY_CODE_ISSUE_CODE
  ) {
    return t("errorsDrawer.kinds.invalidPhone");
  }

  const message = issue.message.toLowerCase();

  if (message.includes("is required")) {
    return t("errorsDrawer.kinds.required");
  }

  if (message.includes("select a valid")) {
    return t("errorsDrawer.kinds.selectValid");
  }

  if (message.includes("invalid phone number length")) {
    return t("errorsDrawer.kinds.invalidLength");
  }

  if (message.includes("invalid phone number")) {
    return t("errorsDrawer.kinds.invalidPhone");
  }

  if (
    message.includes("invalid email address") ||
    message.includes("invalid email")
  ) {
    return t("errorsDrawer.kinds.invalidEmail");
  }

  return issue.message;
}

function ImportErrorAction<TValues extends object>({
  activeIssueId,
  issue,
  onJumpToIssue,
}: ImportErrorActionProps<TValues>) {
  const { t } = useTranslation(["import-workbench", "common"]);
  const { token } = theme.useToken();
  const isActive = issue.id === activeIssueId;
  const isServerError = issue.code === SPREADSHEET_IMPORT_SERVER_ERROR_CODE;
  const fieldLabel = isServerError
    ? t("errorsDrawer.serverField")
    : issue.fieldLabel;

  const handleClick = () => {
    onJumpToIssue(issue);
  };

  return (
    <AppButton
      style={{
        background: isActive ? token.colorPrimaryBg : token.colorBgContainer,
        border: `1px solid ${
          isActive ? token.colorPrimaryBorder : token.colorBorderSecondary
        }`,
        height: "auto",
        justifyContent: "flex-start",
        paddingBlock: token.paddingXS,
        paddingInline: token.paddingXS,
        width: "100%",
      }}
      onClick={handleClick}
    >
      <Flex
        vertical
        align="start"
        gap={token.marginXXS}
        style={{ minWidth: 0, width: "100%" }}
      >
        <Typography.Text
          strong
          style={{
            overflowWrap: "anywhere",
            whiteSpace: "normal",
          }}
        >
          {t("errorsDrawer.rowField", {
            rowNumber: issue.rowNumber,
            fieldLabel,
          })}
        </Typography.Text>
        <Typography.Text
          type={isServerError ? "danger" : "secondary"}
          style={{
            overflowWrap: "anywhere",
            whiteSpace: "normal",
          }}
        >
          {isServerError
            ? t("errorsDrawer.serverPrefix", { message: issue.message })
            : getConciseIssueMessage(
                issue as SpreadsheetImportIssueRecord<object>,
                t,
              )}
        </Typography.Text>
      </Flex>
    </AppButton>
  );
}

export function ImportErrorsDrawer<TValues extends object>({
  activeIssueId,
  issues,
  mobileMode = false,
  onClose,
  onJumpToIssue,
  open,
  unmatchedHeaders,
}: ImportErrorsDrawerProps<TValues>) {
  const { t } = useTranslation(["import-workbench", "common"]);
  const { token } = theme.useToken();

  // Hooks must run before early return.
  const title =
    issues.length > 0
      ? t("errorsDrawer.titleWithCount", { count: issues.length })
      : t("errorsDrawer.title");

  if (!open) {
    return null;
  }

  const content = (
    <Flex vertical gap={token.marginSM} style={{ minHeight: 0, flex: 1 }}>
      {unmatchedHeaders.length > 0 ? (
        <Alert
          type="warning"
          showIcon
          message={t("errorsDrawer.ignoredColumns", {
            columns: unmatchedHeaders.join(", "),
          })}
        />
      ) : null}

      {issues.length === 0 ? (
        <Empty
          description={t("errorsDrawer.noErrors")}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <Flex
          vertical
          gap={token.marginSM}
          style={{
            flex: 1,
            minHeight: 0,
            overflow: "auto",
            paddingBottom: token.paddingSM,
            paddingInlineEnd: token.paddingXXS,
          }}
        >
          {issues.map((issue) => {
            return (
              <ImportErrorAction
                key={issue.id}
                activeIssueId={activeIssueId}
                issue={issue}
                onJumpToIssue={onJumpToIssue}
              />
            );
          })}
        </Flex>
      )}
    </Flex>
  );

  if (mobileMode) {
    return (
      <AppDrawer
        open={open}
        onClose={onClose}
        title={title}
        dialogSize="fullscreen"
      >
        {content}
      </AppDrawer>
    );
  }

  return (
    <Card
      title={title}
      extra={
        <AppButton
          type="text"
          size="small"
          icon={<AppIcon icon={Icons.x} size={16} />}
          onClick={onClose}
          aria-label={t("a11y.hideErrors")}
        />
      }
      style={{
        height: "100%",
        minHeight: 0,
      }}
      styles={{
        body: {
          display: "flex",
          flexDirection: "column",
          gap: token.marginSM,
          height: "100%",
          minHeight: 0,
          overflow: "hidden",
          padding: token.paddingSM,
        },
      }}
    >
      {content}
    </Card>
  );
}
