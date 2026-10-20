// Modified by Sekar Nagarajan (2026-09-17 11:48)
/**
 * Bottom cookie-consent bar — shown after login until the user accepts.
 * Acceptance is persisted in localStorage so it does not reappear each session.
 */
import { useAuthStore } from "@solverminds/auth";
import { AppButton } from "@solverminds/shared-ui";
import { Typography } from "antd";
import { useState } from "react";

import {
  acceptCookieConsent,
  hasAcceptedCookieConsent,
} from "../../utils/cookie-consent";
import { AppIcon, Icons } from "../icons";
import { CookieConsentBannerStyles } from "./cookie-consent-banner-styles";

const { Text } = Typography;

export function CookieConsentBanner() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [accepted, setAccepted] = useState(() => hasAcceptedCookieConsent());
  const [exiting, setExiting] = useState(false);

  if (!isAuthenticated || accepted) {
    return null;
  }

  const handleAccept = () => {
    acceptCookieConsent();
    setExiting(true);
  };

  const handleAnimationEnd = () => {
    if (exiting) {
      setAccepted(true);
    }
  };

  return (
    <>
      <CookieConsentBannerStyles />
      <div
        className={
          exiting
            ? "cookie-consent-banner cookie-consent-banner--exit"
            : "cookie-consent-banner cookie-consent-banner--enter"
        }
        role="dialog"
        aria-live="polite"
        aria-label="Cookie consent"
        onAnimationEnd={handleAnimationEnd}
      >
        <div className="cookie-consent-banner__panel">
          <span className="cookie-consent-banner__icon" aria-hidden>
            <AppIcon icon={Icons.cookie} size={18} />
          </span>
          <Text className="cookie-consent-banner__text">
            We use cookies to enhance your browsing experience. By continuing to
            use our website without changing your settings, you consent to our
            cookies policy.
          </Text>
          <AppButton
            type="primary"
            size="small"
            className="cookie-consent-banner__accept"
            onClick={handleAccept}
          >
            Accept
          </AppButton>
        </div>
      </div>
    </>
  );
}
