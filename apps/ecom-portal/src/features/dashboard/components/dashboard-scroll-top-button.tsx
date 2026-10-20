// Created by Sekar Nagarajan (2026-09-18 12:17)
import { AppButton } from "@solverminds/shared-ui";
import { Tooltip } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";

const SCROLL_SHOW_AFTER_PX = 280;
const CONTENT_SCROLL_SELECTOR = ".app-content-main";

function getDashboardScroller(): HTMLElement | null {
  const el = document.querySelector(CONTENT_SCROLL_SELECTOR);
  return el instanceof HTMLElement ? el : null;
}

/** Bottom-right control — scrolls the dashboard content pane back to the top. */
export function DashboardScrollTopButton() {
  const { t } = useTranslation(["dashboard", "common", "modules"]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const scroller = getDashboardScroller();
    if (!scroller) return;

    const onScroll = () => {
      setVisible(scroller.scrollTop > SCROLL_SHOW_AFTER_PX);
    };

    onScroll();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scroller.removeEventListener("scroll", onScroll);
    };
  }, []);

  const handleScrollTop = () => {
    getDashboardScroller()?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const backToTop = t("a11y.backToTop");

  return (
    <div
      className={[
        "dashboard-scroll-top",
        visible ? "dashboard-scroll-top--visible" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Tooltip title={backToTop} placement="left">
        <AppButton
          type="primary"
          shape="circle"
          size="large"
          aria-label={backToTop}
          className="dashboard-scroll-top__btn"
          icon={<AppIcon icon={Icons.chevronUp} size={20} />}
          onClick={handleScrollTop}
        />
      </Tooltip>
    </div>
  );
}
