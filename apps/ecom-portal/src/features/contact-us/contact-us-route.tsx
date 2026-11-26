// Modified by Sekar Nagarajan (2026-08-26 16:30)
import { AppButton } from "@solverminds/shared-ui";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Card, Result } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../components/icons";
import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { useModuleTitles } from "../../i18n/use-module-titles";
import { ContactPanelHeader } from "./components/contact-panel-header";
import { ContactUsModuleStyles } from "./components/contact-us-module-styles";
import { ContactUsForm } from "./components/ContactUsForm";
import { useContactUsController } from "./hooks/use-contact-us-controller";

/**
 * ContactUsRoute — thin route wrapper for the Contact Us page.
 *
 * Parity: legacy ContactUs.jsp loaded within MainLoginLayout.jsp.
 * Route: /contact-us
 */
export function ContactUsRoute() {
  const { t, i18n } = useTranslation(["contact-us", "common"]);
  const MODULE_TITLES = useModuleTitles();
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as Record<string, unknown>;

  // Legacy parity: ?fromRegistration=Y → default subject = Customer Code Request
  const defaultSubject = useMemo(
    () =>
      String(search.fromRegistration || "").toUpperCase() === "Y"
        ? t("defaults.customerCodeRequest")
        : "",
    [search.fromRegistration, t, i18n.language],
  );

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
            {t("common:actions.backHome")}
          </AppButton>
        </div>

        <Card className="contact-page-card">
          {controller.isSuccess ? (
            <div className="contact-success custom-scroll">
              <Result
                status="success"
                title={t("success.title")}
                subTitle={t("success.subTitle")}
                extra={[
                  <AppButton
                    type="primary"
                    key="home"
                    size="large"
                    onClick={() => navigate({ to: "/" })}
                  >
                    {t("common:actions.backHome")}
                  </AppButton>,
                ]}
              />
            </div>
          ) : (
            <div className="contact-page__body">
              <ContactPanelHeader
                icon={Icons.mail}
                title={MODULE_TITLES.contactUs}
                description={t("descriptions.page")}
              />

              <form onSubmit={controller.handleSubmit} className="contact-form">
                <div className="contact-form__scroll custom-scroll">
                  <ContactUsForm controller={controller} />
                </div>

                <div className="form-step-footer">
                  <AppButton
                    danger
                    size="medium"
                    icon={
                      <AppIcon icon={Icons.refreshCw} size={16} tone="delete" />
                    }
                    onClick={controller.handleReset}
                    disabled={controller.isSubmitting}
                  >
                    {t("common:actions.reset")}
                  </AppButton>
                  <AppButton
                    type="primary"
                    size="medium"
                    htmlType="submit"
                    icon={<AppIcon icon={Icons.send} size={16} />}
                    loading={controller.isSubmitting}
                  >
                    {t("actions.sendMessage")}
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
