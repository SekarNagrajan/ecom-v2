import {
  CaretDownOutlined,
  CaretRightOutlined,
  PaperClipOutlined,
} from '@ant-design/icons';
import { Flex, Typography, theme } from 'antd';

import { sanitizeHtml } from '../../../utils/html-sanitizer';
import { AppButton } from '../../ui/button';
import type { EmailThreadMessageDefaultProps } from './email-thread-message-default.types';

export function EmailThreadMessageDefault({
  message,
  isExpanded,
  isCollapsible = true,
  formattedDateTime,
  onToggle,
  onAttachmentClick,
}: EmailThreadMessageDefaultProps) {
  const { token } = theme.useToken();
  const bodyClassName = 'app-email-thread-message-body';

  return (
    <div
      style={{
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadius,
        background: token.colorBgContainer,
        overflow: 'hidden',
      }}
    >
      <Flex
        align="center"
        gap={token.marginXS}
        style={{
          padding: token.paddingSM,
          cursor: isCollapsible ? 'pointer' : 'default',
        }}
        onClick={isCollapsible ? onToggle : undefined}
      >
        {isCollapsible &&
          (isExpanded ? <CaretDownOutlined /> : <CaretRightOutlined />)}

        <Flex vertical style={{ flex: 1 }}>
          <Typography.Text strong>
            {message.from.name ?? message.from.email}
          </Typography.Text>

          <Typography.Text type="secondary">
            {formattedDateTime}
          </Typography.Text>
        </Flex>
      </Flex>

      {isExpanded && (
        <Flex
          vertical
          gap={token.marginSM}
          style={{ padding: token.paddingSM }}
        >
          <div
            className={bodyClassName}
            style={{
              color: token.colorText,
              lineHeight: token.lineHeight,
            }}
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(message.bodyHtml),
            }}
          />
          <style>{`
            .${bodyClassName} h1 { font-size: ${token.fontSizeHeading2}px; margin: 0 0 ${token.marginSM}px; }
            .${bodyClassName} h2 { font-size: ${token.fontSizeHeading3}px; margin: 0 0 ${token.marginSM}px; }
            .${bodyClassName} h3 { font-size: ${token.fontSizeHeading4}px; margin: 0 0 ${token.marginXS}px; }
            .${bodyClassName} p { margin: 0 0 ${token.marginXS}px; }
            .${bodyClassName} ul, .${bodyClassName} ol { margin: 0 0 ${token.marginXS}px ${token.marginLG}px; }
            .${bodyClassName} blockquote {
              margin: 0 0 ${token.marginSM}px;
              padding-left: ${token.paddingSM}px;
              border-left: 3px solid ${token.colorBorderSecondary};
              color: ${token.colorTextSecondary};
            }
            .${bodyClassName} img { max-width: 100%; height: auto; border-radius: ${token.borderRadius}px; }
          `}</style>

          {message.attachments && message.attachments.length > 0 && (
            <Flex vertical gap={token.marginXXS}>
              <Typography.Text strong>Attachments</Typography.Text>
              {message.attachments.map((attachment) => (
                <AppButton
                  key={attachment.id}
                  type="link"
                  icon={<PaperClipOutlined />}
                  style={{ justifyContent: 'start' }}
                  onClick={() => {
                    if (onAttachmentClick) {
                      onAttachmentClick({ message, attachment });
                    }
                  }}
                >
                  {attachment.name}
                </AppButton>
              ))}
            </Flex>
          )}
        </Flex>
      )}
    </div>
  );
}
