// Modified by Sekar Nagarajan (2026-09-28 14:59) — copyright center, legal links right
import { Layout, Typography } from "antd";

import { LEGAL_LINKS } from "../../constants/legal-links";

const { Footer } = Layout;
const { Text } = Typography;

export function AppFooter() {
  return (
    <Footer className="app-footer">
      <div className="app-footer__inner">
        <div className="app-footer__start">
          <Text className="app-footer__text">Version 1.0.0</Text>
        </div>
        <Text className="app-footer__text app-footer__copyright">
          Copyright &copy; {new Date().getFullYear()} All rights reserved.
          Solverminds Solutions &amp; Technologies Pvt.Ltd
        </Text>
        <nav className="app-footer__links" aria-label="Legal">
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
      </div>
    </Footer>
  );
}
