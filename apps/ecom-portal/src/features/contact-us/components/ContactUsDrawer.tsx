// Modified by sekar nagarajan (2026-08-21)
import { MailOutlined, ReloadOutlined, SendOutlined } from '@ant-design/icons';
import { AppButton, AppDrawer } from '@solverminds/shared-ui';
import { Result, Space, Typography, theme } from 'antd';
import { useContactUsController } from '../hooks/use-contact-us-controller';
import { ContactUsForm } from './ContactUsForm';

const { Title, Text } = Typography;

export interface ContactUsDrawerProps {
  open: boolean;
  onClose: () => void;
  defaultSubject?: string;
}

export function ContactUsDrawer({ open, onClose, defaultSubject = '' }: ContactUsDrawerProps) {
  const { token } = theme.useToken();
  const controller = useContactUsController({ defaultSubject });

  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      width="50%"
      mask={{ blur: false }}
      title="Contact Us & Support Inquiry"
      styles={{
        body: { overflowY: 'auto', maxHeight: 'calc(100vh - 105px)', padding: '20px 24px' },
        footer: {
          display: 'flex',
          justify: 'flex-end',
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          padding: '8px 20px',
          background: token.colorBgContainer,
        },
      }}
      footer={
        !controller.isSuccess ? (
          <Space style={{ width: '100%', justifyContent: 'flex-end' }} size={8}>
            <AppButton
              danger
              icon={<ReloadOutlined />}
              onClick={controller.handleReset}
              disabled={controller.isSubmitting}
            >
              Reset Form
            </AppButton>
            <AppButton
              type="primary"
              icon={<SendOutlined />}
              loading={controller.isSubmitting}
              onClick={controller.handleSubmit}
            >
              Send Message
            </AppButton>
          </Space>
        ) : null
      }
    >
      {controller.isSuccess ? (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <Result
            status="success"
            title="Message Sent Successfully!"
            subTitle="Thank you for contacting us. We have received your request and will process it with the concerned department immediately. You will be contacted shortly."
            extra={[
              <AppButton type="primary" key="close" onClick={onClose}>
                Close
              </AppButton>,
            ]}
          />
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: token.colorPrimary,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
              }}
            >
              <MailOutlined />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
                Send Us a Message
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Have a question or need operational assistance? Submit your inquiry below
              </Text>
            </div>
          </div>

          <form onSubmit={controller.handleSubmit}>
            <ContactUsForm controller={controller} />
          </form>
        </div>
      )}
    </AppDrawer>
  );
}
