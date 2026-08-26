// Modified by Sekar Nagarajan (2026-08-25 16:25)
import { AppButton } from "@solverminds/shared-ui";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Card, Flex, Result, Typography } from "antd";

import { AppIcon, Icons } from "../../components/icons";
import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { ContactUsForm } from "./components/ContactUsForm";
import { ContactUsModuleStyles } from "./components/contact-us-module-styles";
import { useContactUsController } from "./hooks/use-contact-us-controller";

const { Title, Text } = Typography;

/**
 * ContactUsRoute — thin route wrapper for the Contact Us page.
 *
 * Parity: legacy ContactUs.jsp loaded within MainLoginLayout.jsp.
 * Route: /contact-us
 */
export function ContactUsRoute() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as Record<string, unknown>;

  // Legacy parity: ?fromRegistration=Y → default subject = "Customer Code Request"
  const defaultSubject =
    String(search.fromRegistration || "").toUpperCase() === "Y"
      ? "Customer Code Request"
      : "";

  const controller = useContactUsController({ defaultSubject });

  return (
    <FeaturePageShell>
      <ContactUsModuleStyles />
      <div className="contact-page">
        <Flex justify="flex-end" className="contact-page__toolbar">
          <AppButton
            icon={<AppIcon icon={Icons.arrowLeft} size={16} />}
            onClick={() => navigate({ to: "/" })}
          >
            Back to Home
          </AppButton>
        </Flex>

        <Card className="contact-page-card">
          {controller.isSuccess ? (
            <div className="contact-success custom-scroll">
              <Result
                status="success"
                title="Message Sent Successfully!"
                subTitle="Thank you for contacting us. We have received your request and will process it with the concerned department immediately. You will be contacted by one of our executives shortly."
                extra={[
                  <AppButton
                    type="primary"
                    key="home"
                    size="large"
                    onClick={() => navigate({ to: "/" })}
                  >
                    Back to Home
                  </AppButton>,
                ]}
              />
            </div>
          ) : (
            <Flex vertical gap={24} className="contact-page__body">
              <div className="contact-page__header">
                <Flex align="center" gap={12}>
                  <div className="contact-page__icon app-icon-inherit primary-surface">
                    <AppIcon icon={Icons.mail} size={16} />
                  </div>
                  <div>
                    <Title level={3} className="contact-page__title">
                      Contact Us
                    </Title>
                    <Text type="secondary" className="contact-page__subtitle">
                      Have a question or need help? Send us a message and we
                      will get back to you promptly.
                    </Text>
                  </div>
                </Flex>
              </div>

              <form
                onSubmit={controller.handleSubmit}
                className="contact-form"
              >
                <div className="contact-form__scroll custom-scroll">
                  <ContactUsForm controller={controller} />
                </div>

                <Flex className="form-step-footer" justify="flex-end" gap={12}>
                  <AppButton
                    size="large"
                    icon={<AppIcon icon={Icons.refreshCw} size={16} />}
                    onClick={controller.handleReset}
                    disabled={controller.isSubmitting}
                  >
                    Reset
                  </AppButton>
                  <AppButton
                    type="primary"
                    size="large"
                    htmlType="submit"
                    icon={<AppIcon icon={Icons.send} size={16} />}
                    loading={controller.isSubmitting}
                  >
                    Send Message
                  </AppButton>
                </Flex>
              </form>
            </Flex>
          )}
        </Card>
      </div>
    </FeaturePageShell>
  );
}
