// Modified by Sekar Nagarajan (2026-09-17 21:14)
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
 * Uses a 1px pin sentinel (not a height-matched spacer) so results sit flush
 * under the header with no empty white gap.
 */
export function ScheduleSearchHost({
  onSearch,
  onReset,
  isLoading,
}: ScheduleSearchHostProps) {
  const [form] = Form.useForm();
  const pinSentinelRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const root = document.querySelector(".app-content-main");
    const target = pinSentinelRef.current;
    if (!root || !target) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        // Pin once the in-page search origin scrolls under the sticky header.
        setPinned(!entry.isIntersecting);
      },
      {
        root,
        threshold: 0,
        // Match app header height so unpin happens as search would reappear.
        rootMargin: "-64px 0px 0px 0px",
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
      {/* Stable 1px marker — height never collapses, so pin/unpin does not flicker */}
      <div
        ref={pinSentinelRef}
        className="schedule-search-pin-sentinel"
        aria-hidden
      />

      <div
        className={[
          "schedule-search-sentinel",
          pinned ? "schedule-search-sentinel--pinned" : undefined,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {pinned ? null : (
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
