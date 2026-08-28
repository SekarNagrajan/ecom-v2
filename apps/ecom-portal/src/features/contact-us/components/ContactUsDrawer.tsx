// Modified by Sekar Nagarajan (2026-08-26 16:30)
import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import { Result } from "antd";

import { AppIcon, Icons } from "../../../components/icons";
import { MODULE_TITLES } from "../../../constants/module-titles";
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
            description="Have a question or need operational assistance? Submit your inquiry below."
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
                Cancel
              </AppButton>
              <AppButton
                type="primary"
                icon={<AppIcon icon={Icons.send} size={16} />}
                loading={controller.isSubmitting}
                onClick={controller.handleSubmit}
              >
                Send Message
              </AppButton>
            </div>
          )
        }
      >
        {controller.isSuccess ? (
          <div className="contact-success custom-scroll">
            <Result
              status="success"
              title="Message Sent Successfully!"
              subTitle="Thank you for contacting us. We have received your request and will process it with the concerned department immediately. You will be contacted shortly."
              extra={[
                <AppButton type="primary" key="close" onClick={handleClose}>
                  Close
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
