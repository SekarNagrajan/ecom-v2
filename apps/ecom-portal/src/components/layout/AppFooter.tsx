// Modified by Sekar Nagarajan (2026-09-29 11:19) — company name links to solverminds.com
import { Layout, Typography } from "antd";
import { useTranslation } from "react-i18next";

import { LEGAL_LINKS } from "../../constants/legal-links";
import { AgencyHotlineWidget } from "../../features/agency-hotline/components/AgencyHotlineWidget";

const { Footer } = Layout;
const { Text } = Typography;

const SOLVERMINDS_WEBSITE_URL = "https://www.solverminds.com/";
const APP_VERSION = "1.0.0";

export function AppFooter() {
  const { t } = useTranslation("common");

  return (
    <Footer className="app-footer">
      <div className="app-footer__inner">
        <div className="app-footer__start">
          <Text className="app-footer__text">
            {t("footer.version", { version: APP_VERSION })}
          </Text>
        </div>
        <Text className="app-footer__text app-footer__copyright">
          {t("footer.copyright", { year: new Date().getFullYear() })}{" "}
          <a
            className="app-footer__link"
            href={SOLVERMINDS_WEBSITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("footer.companyAria")}
          >
            {t("footer.company")}
          </a>
        </Text>
        <div className="app-footer__end">
          <nav className="app-footer__links" aria-label={t("footer.legal")}>
            <a
              className="app-footer__link"
              href={LEGAL_LINKS.websiteTermsOfUse.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {LEGAL_LINKS.websiteTermsOfUse.label}
            </a>
            <span className="app-footer__link-sep" aria-hidden="true">
              |
            </span>
            <a
              className="app-footer__link"
              href={LEGAL_LINKS.privacyPolicy.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {LEGAL_LINKS.privacyPolicy.label}
            </a>
          </nav>
          <AgencyHotlineWidget />
        </div>
      </div>
    </Footer>
  );
}
