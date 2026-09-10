// Modified by Sekar Nagarajan (2026-09-08 17:55)
import { AppButton, AppModal } from "@solverminds/shared-ui";
import { Form, Tooltip } from "antd";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { AppIcon, Icons } from "../../../components/icons";
import { useResponsiveLayout } from "../../../hooks/use-responsive-layout";
import {
  SCHEDULES_HEADER_SEARCH_SLOT_ID,
  useSchedulesHeaderSearchStore,
} from "../stores/schedules-header-search.store";
import type { ScheduleSearchParams } from "../types/schedules.types";
import { ScheduleSearchFilter } from "./ScheduleSearchFilter";

export interface ScheduleSearchHostProps {
  onSearch: (params: ScheduleSearchParams) => void;
  onReset?: () => void;
  isLoading?: boolean;
}

/**
 * Single search form that portals into the auth header when scrolled off-screen.
 * Keeps a height-matched placeholder in-page so layout does not jump (avoids IO flicker).
 */
export function ScheduleSearchHost({
  onSearch,
  onReset,
  isLoading,
}: ScheduleSearchHostProps) {
  const [form] = Form.useForm();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const placeholderHeightRef = useRef(0);
  const [slotEl, setSlotEl] = useState<HTMLElement | null>(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const { compactHeader } = useResponsiveLayout();
  const pinned = useSchedulesHeaderSearchStore((s) => s.pinned);
  const setActive = useSchedulesHeaderSearchStore((s) => s.setActive);
  const setPinned = useSchedulesHeaderSearchStore((s) => s.setPinned);
  const resetStore = useSchedulesHeaderSearchStore((s) => s.reset);

  useEffect(() => {
    setActive(true);
    return () => {
      resetStore();
    };
  }, [resetStore, setActive]);

  // Measure in-page panel height while visible so the pinned placeholder keeps layout stable.
  useEffect(() => {
    if (pinned) {
      return;
    }
    const node = sentinelRef.current;
    if (!node) {
      return;
    }

    const updateHeight = () => {
      const height = Math.round(node.getBoundingClientRect().height);
      if (height > 0) {
        placeholderHeightRef.current = height;
        node.style.setProperty(
          "--schedule-search-placeholder-height",
          `${height}px`,
        );
      }
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(node);
    return () => observer.disconnect();
  }, [pinned]);

  useEffect(() => {
    const root = document.querySelector(".app-content-main");
    const target = sentinelRef.current;
    if (!root || !target) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setPinned(!entry.isIntersecting);
      },
      {
        root,
        threshold: 0,
        rootMargin: "-8px 0px 0px 0px",
      },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [setPinned]);

  useEffect(() => {
    if (!pinned) {
      setMobileSearchOpen(false);
    }
  }, [pinned]);

  useLayoutEffect(() => {
    if (!pinned) {
      setSlotEl(null);
      return;
    }

    const resolveSlot = () =>
      document.getElementById(SCHEDULES_HEADER_SEARCH_SLOT_ID);

    const el = resolveSlot();
    setSlotEl(el);
    if (el) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      setSlotEl(resolveSlot());
    });
    return () => cancelAnimationFrame(frame);
  }, [pinned]);

  useLayoutEffect(() => {
    const node = sentinelRef.current;
    if (!node) {
      return;
    }
    const height = placeholderHeightRef.current;
    if (pinned && height > 0) {
      node.style.setProperty(
        "--schedule-search-placeholder-height",
        `${height}px`,
      );
    }
  }, [pinned]);

  const handleSearch = (params: ScheduleSearchParams) => {
    onSearch(params);
    setMobileSearchOpen(false);
  };

  const handleReset = () => {
    onReset?.();
  };

  const filterProps = {
    form,
    onSearch: handleSearch,
    onReset: handleReset,
    isLoading,
  };

  const mobileHeaderControl = (
    <Tooltip title="Search Schedules">
      <AppButton
        type="primary"
        shape="circle"
        className="app-header-schedules-search-trigger"
        icon={<AppIcon icon={Icons.search} size={16} />}
        onClick={() => setMobileSearchOpen(true)}
        aria-label="Search Schedules"
      />
    </Tooltip>
  );

  const showHeaderPortal = pinned && Boolean(slotEl);
  const portalDesktop = showHeaderPortal && !compactHeader && slotEl;
  const portalMobileIcon = showHeaderPortal && compactHeader && slotEl;

  return (
    <>
      <div
        ref={sentinelRef}
        className={[
          "schedule-search-sentinel",
          pinned ? "schedule-search-sentinel--pinned" : undefined,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {pinned ? (
          <div className="schedule-search-sentinel__spacer" aria-hidden />
        ) : (
          <ScheduleSearchFilter {...filterProps} variant="page" />
        )}
      </div>

      {portalDesktop
        ? createPortal(
            <ScheduleSearchFilter {...filterProps} variant="header" />,
            slotEl,
          )
        : null}
      {portalMobileIcon ? createPortal(mobileHeaderControl, slotEl) : null}

      {compactHeader ? (
        <AppModal
          open={mobileSearchOpen}
          title="Search Schedules"
          onCancel={() => setMobileSearchOpen(false)}
          footer={null}
          dialogSize="md"
        >
          <ScheduleSearchFilter {...filterProps} variant="page" />
        </AppModal>
      ) : null}
    </>
  );
}
