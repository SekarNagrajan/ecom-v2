// Modified by Sekar Nagarajan (2026-08-26 16:30)
import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import { Result } from "antd";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import { useModuleTitles } from "../../../i18n/use-module-titles";
import { useContactUsController } from "../hooks/use-contact-us-controller";
import { ContactPanelHeader } from "./contact-panel-header";
import { ContactUsModuleStyles } from "./contact-us-module-styles";
import { ContactUsForm } from "./ContactUsForm";

export interface ContactUsDrawerProps {
  open: boolean;
  onClose: () => void;
  defaultSubject?: string;
}

export function ContactUsDrawer({
  open,
  onClose,
  defaultSubject = "",
}: ContactUsDrawerProps) {
  const { t } = useTranslation(["contact-us", "common"]);
  const MODULE_TITLES = useModuleTitles();
  const controller = useContactUsController({ defaultSubject });

  const handleClose = () => {
    controller.handleDismiss();
    onClose();
  };

  return (
    <>
      <ContactUsModuleStyles />
      <AppDrawer
        open={open}
        onClose={handleClose}
        placement="right"
        dialogSize="md"
        destroyOnClose
        maskClosable={!controller.isSubmitting}
        keyboard={!controller.isSubmitting}
        mask={{ blur: false }}
        classNames={{
          header: "contact-drawer-header-bar",
          body: "contact-drawer-body custom-scroll",
          footer: "contact-drawer-footer-bar",
        }}
        styles={{ body: { padding: 0 } }}
        title={
          <ContactPanelHeader
            icon={Icons.mail}
            title={MODULE_TITLES.contactUs}
            description={t("descriptions.drawer")}
            compact
          />
        }
        footer={
          controller.isSuccess ? null : (
            <div className="contact-drawer-footer form-step-footer">
              <AppButton
                onClick={handleClose}
                disabled={controller.isSubmitting}
                danger
              >
                {t("common:actions.cancel")}
              </AppButton>
              <AppButton
                type="primary"
                icon={<AppIcon icon={Icons.send} size={16} />}
                loading={controller.isSubmitting}
                onClick={controller.handleSubmit}
              >
                {t("actions.sendMessage")}
              </AppButton>
            </div>
          )
        }
      >
        {controller.isSuccess ? (
          <div className="contact-success custom-scroll">
            <Result
              status="success"
              title={t("success.title")}
              subTitle={t("success.drawerSubTitle")}
              extra={[
                <AppButton type="primary" key="close" onClick={handleClose}>
                  {t("common:actions.close")}
                </AppButton>,
              ]}
            />
          </div>
        ) : (
          <form onSubmit={controller.handleSubmit}>
            <ContactUsForm controller={controller} />
          </form>
        )}
      </AppDrawer>
    </>
  );
}
