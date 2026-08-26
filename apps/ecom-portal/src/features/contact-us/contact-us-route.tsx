// Modified by Sekar Nagarajan (2026-08-26 16:30)
import { AppButton } from "@solverminds/shared-ui";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Card, Result } from "antd";

import { AppIcon, Icons } from "../../components/icons";
import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { MODULE_TITLES } from "../../constants/module-titles";
import { ContactPanelHeader } from "./components/contact-panel-header";
import { ContactUsForm } from "./components/ContactUsForm";
import { ContactUsModuleStyles } from "./components/contact-us-module-styles";
import { useContactUsController } from "./hooks/use-contact-us-controller";

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
        <div className="contact-page__toolbar">
          <AppButton
            icon={<AppIcon icon={Icons.arrowLeft} size={16} />}
            onClick={() => navigate({ to: "/" })}
          >
            Back to Home
          </AppButton>
        </div>

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
            <div className="contact-page__body">
              <ContactPanelHeader
                icon={Icons.mail}
                title={MODULE_TITLES.contactUs}
                description="Have a question or need help? Send us a message and we will get back to you promptly."
              />

              <form
                onSubmit={controller.handleSubmit}
                className="contact-form"
              >
                <div className="contact-form__scroll custom-scroll">
                  <ContactUsForm controller={controller} />
                </div>

                <div className="form-step-footer">
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
                </div>
              </form>
            </div>
          )}
        </Card>
      </div>
    </FeaturePageShell>
  );
}
