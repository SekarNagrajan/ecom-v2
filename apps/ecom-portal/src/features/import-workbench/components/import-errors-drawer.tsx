import { AppButton, AppDrawer } from '@solverminds/shared-ui';
import { Alert, Card, Empty, Flex, Typography, theme } from 'antd';

import { AppIcon, Icons } from '../../../components/icons';
import {
  type SpreadsheetImportIssueRecord,
  SPREADSHEET_IMPORT_SERVER_ERROR_CODE,
} from '../types/import-workbench.types';

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

function getConciseIssueMessage(message: string) {
  if (message.toLowerCase().includes('is required')) {
    return 'Required';
  }

  if (message.toLowerCase().includes('select a valid')) {
    return 'Select a valid option';
  }

  if (message.toLowerCase().includes('invalid phone number length')) {
    return 'Invalid length';
  }

  if (message.toLowerCase().includes('invalid phone number')) {
    return 'Invalid phone';
  }

  if (message.toLowerCase().includes('invalid email address')) {
    return 'Invalid email';
  }

  return message;
}

function ImportErrorAction<TValues extends object>({
  activeIssueId,
  issue,
  onJumpToIssue,
}: ImportErrorActionProps<TValues>) {
  const { token } = theme.useToken();
  const isActive = issue.id === activeIssueId;
  const isServerError = issue.code === SPREADSHEET_IMPORT_SERVER_ERROR_CODE;

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
        height: 'auto',
        justifyContent: 'flex-start',
        paddingBlock: token.paddingXS,
        paddingInline: token.paddingXS,
        width: '100%',
      }}
      onClick={handleClick}
    >
      <Flex
        vertical
        align="start"
        gap={token.marginXXS}
        style={{ minWidth: 0, width: '100%' }}
      >
        <Typography.Text
          strong
          style={{
            overflowWrap: 'anywhere',
            whiteSpace: 'normal',
          }}
        >
          Row {issue.rowNumber} · {issue.fieldLabel}
        </Typography.Text>
        <Typography.Text
          type={isServerError ? 'danger' : 'secondary'}
          style={{
            overflowWrap: 'anywhere',
            whiteSpace: 'normal',
          }}
        >
          {isServerError
            ? `Server: ${issue.message}`
            : getConciseIssueMessage(issue.message)}
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
  const { token } = theme.useToken();

  if (!open) {
    return null;
  }

  const content = (
    <Flex vertical gap={token.marginSM} style={{ minHeight: 0, flex: 1 }}>
      {unmatchedHeaders.length > 0 ? (
        <Alert
          type="warning"
          showIcon
          message={`Ignored columns: ${unmatchedHeaders.join(', ')}`}
        />
      ) : null}

      {issues.length === 0 ? (
        <Empty
          description="No validation errors."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <Flex
          vertical
          gap={token.marginSM}
          style={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
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
        title={`Errors${issues.length > 0 ? ` (${issues.length})` : ''}`}
        dialogSize="fullscreen"
      >
        {content}
      </AppDrawer>
    );
  }

  return (
    <Card
      title={`Errors${issues.length > 0 ? ` (${issues.length})` : ''}`}
      extra={
        <AppButton
          type="text"
          size="small"
          icon={<AppIcon icon={Icons.x} size={16} />}
          onClick={onClose}
          aria-label="Hide errors"
        />
      }
      style={{
        height: '100%',
        minHeight: 0,
      }}
      styles={{
        body: {
          display: 'flex',
          flexDirection: 'column',
          gap: token.marginSM,
          height: '100%',
          minHeight: 0,
          overflow: 'hidden',
          padding: token.paddingSM,
        },
      }}
    >
      {content}
    </Card>
  );
}
