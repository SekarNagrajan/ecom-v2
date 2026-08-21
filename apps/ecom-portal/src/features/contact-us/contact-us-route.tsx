// Modified by sekar nagarajan (2026-08-21)
import { ArrowLeftOutlined, MailOutlined, ReloadOutlined, SendOutlined } from '@ant-design/icons';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Button, Card, Flex, Result, Typography, theme } from 'antd';

import { ContactUsForm } from './components/ContactUsForm';
import { useContactUsController } from './hooks/use-contact-us-controller';

const { Title, Text } = Typography;

/**
 * ContactUsRoute — thin route wrapper for the Contact Us page.
 *
 * Parity: legacy ContactUs.jsp loaded within MainLoginLayout.jsp.
 * Route: /contact-us
 */
export function ContactUsRoute() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as Record<string, unknown>;

  // Legacy parity: ?fromRegistration=Y → default subject = "Customer Code Request"
  const defaultSubject =
    String(search.fromRegistration || '').toUpperCase() === 'Y'
      ? 'Customer Code Request'
      : '';

  const controller = useContactUsController({ defaultSubject });

  return (
    <div
      style={{
        maxWidth: 860,
        margin: '0 auto',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minHeight: 0,
      }}
    >
      {/* Custom scrollbar + autofill styles — parity with Registration */}
      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background-color: #d9d9d9;
          border-radius: 20px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #bfbfbf;
        }

        /* Remove browser autofill background color */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          transition: background-color 5000s ease-in-out 0s;
          -webkit-text-fill-color: rgba(0, 0, 0, 0.88) !important;
        }
      `}</style>
      <Flex justify="flex-end" style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate({ to: '/' })}
          style={{ background: '#ffffff', color: '#000000', borderColor: '#d9d9d9' }}
        >
          Back to Home
        </Button>
      </Flex>

      <Card
        style={{
          borderRadius: 16,
          boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
        }}
        styles={{
          body: {
            padding: '32px 40px',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
          },
        }}
      >
        {controller.isSuccess ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Result
              status="success"
              title="Message Sent Successfully!"
              subTitle="Thank you for contacting us. We have received your request and will process it with the concerned department immediately. You will be contacted by one of our executives shortly."
              extra={[
                <Button
                  type="primary"
                  key="home"
                  size="large"
                  onClick={() => navigate({ to: '/' })}
                  style={{ borderRadius: 8, padding: '0 32px' }}
                >
                  Back to Home
                </Button>,
              ]}
            />
          </div>
        ) : (
          <Flex vertical gap={24} style={{ flex: 1, minHeight: 0 }}>
            {/* Header */}
            <div>
              <Flex align="center" gap={12} style={{ marginBottom: 4 }}>
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
                  <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
                    Contact Us
                  </Title>
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    Have a question or need help? Send us a message and we'll get back to you
                    promptly.
                  </Text>
                </div>
              </Flex>
            </div>

            {/* Form */}
            <form
              onSubmit={controller.handleSubmit}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
              }}
            >
              <div
                className="custom-scroll"
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  paddingRight: 12,
                }}
              >
                <ContactUsForm controller={controller} />
              </div>

              {/* Action buttons — matches legacy Mail + Reset pattern */}
              <Flex
                justify="flex-end"
                gap={12}
                style={{
                  marginTop: 20,
                  borderTop: '1px solid #f0f0f0',
                  paddingTop: 16,
                }}
              >
                <Button
                  size="large"
                  icon={<ReloadOutlined />}
                  onClick={controller.handleReset}
                  disabled={controller.isSubmitting}
                  style={{ borderRadius: 8 }}
                >
                  Reset
                </Button>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  icon={<SendOutlined />}
                  loading={controller.isSubmitting}
                  style={{ borderRadius: 8, padding: '0 32px' }}
                >
                  Send Message
                </Button>
              </Flex>
            </form>
          </Flex>
        )}
      </Card>
    </div>
  );
}
