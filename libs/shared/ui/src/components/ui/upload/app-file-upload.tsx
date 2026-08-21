import { InboxOutlined, UploadOutlined } from '@ant-design/icons';
import { Flex, Typography, Upload, theme } from 'antd';
import { useState, type CSSProperties } from 'react';

import { AppButton } from '../button';
import { validateFileAgainstConstraints } from './helpers';
import type { AppFileUploadProps } from './types';

const DEFAULT_MAX_SIZE_BYTES = 10 * 1024 * 1024;

export function AppFileUpload({
  accept,
  buttonLabel = 'Select File',
  compact = false,
  description,
  disabled = false,
  error,
  helperText,
  icon,
  layout = 'vertical',
  maxSizeBytes = DEFAULT_MAX_SIZE_BYTES,
  mode = 'button',
  multiple = false,
  onFileSelect,
  onValidationError,
  selectButtonLabel,
  showFeedback = true,
  title,
}: AppFileUploadProps) {
  const { token } = theme.useToken();
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null
  );
  const [isDragging, setIsDragging] = useState(false);

  const combinedError = error ?? validationMessage;

  const clearValidationMessage = () => {
    if (validationMessage) {
      setValidationMessage(null);
    }
  };

  const handleBeforeUpload = (file: File) => {
    const nextValidationMessage = validateFileAgainstConstraints(file, {
      accept,
      maxSizeBytes,
    });

    if (nextValidationMessage) {
      setValidationMessage(nextValidationMessage);
      onValidationError?.(nextValidationMessage);
      return Upload.LIST_IGNORE;
    }

    clearValidationMessage();
    void onFileSelect(file);
    return false;
  };

  const sharedUploadProps = {
    accept,
    beforeUpload: handleBeforeUpload,
    disabled,
    maxCount: multiple ? undefined : 1,
    multiple,
    openFileDialogOnClick: !disabled,
    showUploadList: false,
  } as const;

  const feedback =
    showFeedback && combinedError ? (
      <Typography.Text
        type="danger"
        style={{
          display: 'block',
          textAlign: 'center',
          marginTop: token.marginXS,
        }}
      >
        {combinedError}
      </Typography.Text>
    ) : null;

  if (mode === 'button') {
    return (
      <div>
        <Upload {...sharedUploadProps}>
          <AppButton
            icon={<UploadOutlined />}
            disabled={disabled}
            aria-label={buttonLabel}
          >
            {buttonLabel}
          </AppButton>
        </Upload>
        {feedback}
      </div>
    );
  }

  const dropzoneStyle: CSSProperties = {
    background:
      combinedError != null
        ? token.colorErrorBg
        : isDragging
        ? token.colorFillSecondary
        : token.colorBgContainer,
    border: `2px dashed ${
      combinedError != null
        ? token.colorErrorBorder
        : isDragging
        ? token.colorPrimary
        : token.colorBorder
    }`,
    borderRadius: token.borderRadiusLG,
    padding: compact ? token.paddingLG : token.paddingXL,
    transition: 'all 0.2s ease',
  };
  const iconBoxSize = compact ? 40 : 56;
  const isHorizontal = layout === 'horizontal';
  const textAlign = isHorizontal ? 'left' : 'center';

  const iconNode = (
    <div
      style={{
        alignItems: 'center',
        background:
          combinedError != null
            ? token.colorError
            : isDragging
            ? token.colorPrimary
            : token.colorFillSecondary,
        borderRadius: token.borderRadiusLG,
        color:
          combinedError != null
            ? '#fff'
            : isDragging
            ? '#fff'
            : token.colorTextSecondary,
        display: 'flex',
        flexShrink: 0,
        height: iconBoxSize,
        justifyContent: 'center',
        width: iconBoxSize,
      }}
    >
      {icon ?? (
        <InboxOutlined
          style={{ fontSize: compact ? token.fontSizeLG : token.fontSizeXL }}
        />
      )}
    </div>
  );

  const textContent = (
    <Flex
      vertical
      align={isHorizontal ? 'flex-start' : 'center'}
      gap={compact ? token.marginXXS : token.marginXS}
      style={isHorizontal ? { minWidth: 0, width: '100%' } : undefined}
    >
      {title ? (
        <Typography.Title
          level={5}
          style={{ margin: 0, textAlign, width: '100%' }}
        >
          {title}
        </Typography.Title>
      ) : null}

      {description ? (
        <Typography.Paragraph
          type="secondary"
          style={{ margin: 0, maxWidth: 520, textAlign, width: '100%' }}
        >
          {description}
        </Typography.Paragraph>
      ) : null}

      {selectButtonLabel ? (
        <AppButton
          disabled={disabled}
          icon={<UploadOutlined />}
          type="primary"
          aria-label={selectButtonLabel}
          style={{
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {selectButtonLabel}
        </AppButton>
      ) : null}

      {helperText ? (
        <Typography.Text
          type="secondary"
          style={{ maxWidth: 520, textAlign, width: '100%' }}
        >
          {helperText}
        </Typography.Text>
      ) : null}
    </Flex>
  );

  return (
    <div>
      <div
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={() => setIsDragging(true)}
        onDrop={() => setIsDragging(false)}
      >
        <Upload.Dragger {...sharedUploadProps} style={dropzoneStyle}>
          <Flex
            vertical={!isHorizontal}
            align="center"
            justify="center"
            wrap={isHorizontal ? 'wrap' : undefined}
            gap={compact ? token.marginSM : token.marginMD}
            style={{ width: '100%' }}
          >
            {iconNode}
            {isHorizontal ? (
              <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                {textContent}
              </div>
            ) : (
              textContent
            )}
          </Flex>
        </Upload.Dragger>
      </div>

      {feedback}
    </div>
  );
}
