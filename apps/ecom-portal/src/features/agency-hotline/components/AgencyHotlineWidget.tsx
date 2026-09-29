// Modified by Sekar Nagarajan (2026-09-28 15:28)
import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import { Collapse, Tooltip, Typography } from "antd";
import type { LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import type { HotlineContact } from "../types/hotline.types";
import { useHotlineContacts } from "../hooks/use-hotline-contacts";
import { HotlineModuleStyles } from "./hotline-module-styles";

const { Title, Text } = Typography;

function toTelHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : "#";
}

function HotlinePanelHeader() {
  const { t } = useTranslation(["agency-hotline", "modules"]);
  return (
    <div className="hotline-panel-header">
      <span className="hotline-panel-header__icon" aria-hidden>
        <AppIcon icon={Icons.phone} size={20} />
      </span>
      <div className="hotline-panel-header__copy">
        <Title level={5} className="hotline-panel-header__title">
          {t("modules:titles.agencyHotline")}
        </Title>
        <Text className="hotline-panel-header__description">
          {t("description")}
        </Text>
      </div>
    </div>
  );
}

function ContactRow({
  icon,
  children,
  href,
  muted = false,
}: {
  icon: LucideIcon;
  children: ReactNode;
  href?: string;
  muted?: boolean;
}) {
  const valueClass = [
    "hotline-contact__value",
    muted ? "hotline-contact__value--muted" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="hotline-contact__row">
      <span className="hotline-contact__icon" aria-hidden>
        <AppIcon icon={icon} size={14} />
      </span>
      {href ? (
        <a className={valueClass} href={href}>
          {children}
        </a>
      ) : (
        <span className={valueClass}>{children}</span>
      )}
    </div>
  );
}

function PortContactDetails({ contact }: { contact: HotlineContact }) {
  return (
    <div className="hotline-contact">
      <ContactRow icon={Icons.user} muted>
        {contact.contactName}
      </ContactRow>
      <ContactRow icon={Icons.phone} href={toTelHref(contact.phone)}>
        {contact.phone}
      </ContactRow>
      <ContactRow icon={Icons.mail} href={`mailto:${contact.email}`}>
        {contact.email}
      </ContactRow>
    </div>
  );
}

/** Resolve a country/port label from locale, falling back to the API value. */
function localizeHotlineName(
  t: (key: string, options?: { defaultValue: string }) => string,
  group: "countries" | "ports",
  name: string,
): string {
  return t(`${group}.${name}`, { defaultValue: name });
}

/**
 * Footer Agency Hotline — aligned phone icon at the footer’s far-right.
 * Opens a redesigned right drawer: country → port → contact details.
 */
export function AgencyHotlineWidget() {
  const { t } = useTranslation(["agency-hotline", "modules"]);
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError, isSuccess } = useHotlineContacts();

  const countries = data?.countries ?? [];
  const hasContacts = countries.length > 0;

  // Hide until we know there are contacts (legacy: size() > 0).
  if (isLoading || isError || !isSuccess || !hasContacts) {
    return null;
  }

  return (
    <>
      <HotlineModuleStyles />
      <span className="app-footer__hotline">
        <span className="app-footer__link-sep" aria-hidden="true">
          |
        </span>
        <Tooltip title={t("modules:titles.agencyHotline")} placement="top">
          <AppButton
            type="text"
            shape="circle"
            className="app-footer__hotline-btn"
            aria-label={t("modules:titles.agencyHotline")}
            icon={<AppIcon icon={Icons.phone} size={15} />}
            onClick={() => setOpen(true)}
          />
        </Tooltip>
      </span>

      <AppDrawer
        open={open}
        onClose={() => setOpen(false)}
        placement="right"
        dialogSize="sm"
        destroyOnClose
        mask={{ blur: false }}
        classNames={{
          header: "hotline-drawer-header-bar",
          body: "hotline-drawer-body custom-scroll",
        }}
        styles={{ body: { padding: 0 } }}
        title={<HotlinePanelHeader />}
      >
        <div className="hotline-list">
          <Collapse
            className="hotline-country"
            defaultActiveKey={[countries[0].countryName]}
            accordion={false}
            items={countries.map((country) => ({
              key: country.countryName,
              label: (
                <div className="hotline-country__label">
                  <span className="hotline-country__name">
                    <AppIcon icon={Icons.mapPin} size={15} />
                    {localizeHotlineName(t, "countries", country.countryName)}
                  </span>
                  <span className="hotline-country__count">
                    {country.ports.length}
                  </span>
                </div>
              ),
              children: (
                <Collapse
                  className="hotline-ports"
                  ghost={false}
                  items={country.ports.map((port, pIndex) => ({
                    key: `${country.countryName}-${port.portName}-${pIndex}`,
                    label: (
                      <span className="hotline-port__label">
                        <AppIcon icon={Icons.anchor} size={14} />
                        {localizeHotlineName(t, "ports", port.portName)}
                      </span>
                    ),
                    children: <PortContactDetails contact={port} />,
                  }))}
                />
              ),
            }))}
          />
        </div>
      </AppDrawer>
    </>
  );
}
