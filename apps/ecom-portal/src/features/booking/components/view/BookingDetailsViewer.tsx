// Modified by Sekar Nagarajan (2026-09-08 14:58)
import { useQuery } from "@tanstack/react-query";
import { Result, Skeleton, Typography } from "antd";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../../components/icons";
import { useWizardStepTitles } from "../../../../i18n/use-module-titles";
import { bookingApi } from "../../api/booking.api";
import { bookingKeys } from "../../api/booking.keys";
import type { BookingActivityEvent } from "../../types/booking.types";
import { migrateLegacyCargo } from "../../types/booking.types";
import {
  partiesToCards,
  type PartyRoleKey,
} from "../../utils/party-role.utils";
import { BookingModuleStyles } from "../booking-module-styles";
import { PreviewCargoReview } from "../preview/PreviewCargoReview";
import {
  BookingPreviewEmpty,
  BookingPreviewEmptyPartyCard,
  BookingPreviewFieldGrid,
  BookingPreviewPartyCard,
  BookingPreviewSection,
} from "../preview/booking-preview-section";

const { Text } = Typography;

interface BookingDetailsViewerProps {
  bookingId?: string;
}

type ActivityTone =
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "muted";

const REVIEW_PARTY_ROLES: PartyRoleKey[] = [
  "shipper",
  "consignee",
  "notifyParty",
  "forwarder",
];

function dash(value?: string | number | null): string {
  if (value === undefined || value === null || value === "") return "—";
  return String(value);
}

function getActivityStepVisual(action: string): {
  icon: LucideIcon;
  tone: ActivityTone;
} {
  const key = action.toLowerCase();
  if (key.includes("cancel") || key.includes("reject")) {
    return { icon: Icons.circleX, tone: "error" };
  }
  if (key.includes("confirm") || key.includes("approv")) {
    return { icon: Icons.checkCircle, tone: "success" };
  }
  if (key.includes("amend") || key.includes("edit") || key.includes("update")) {
    return { icon: Icons.squarePen, tone: "warning" };
  }
  if (
    key.includes("submit") ||
    key.includes("sent") ||
    key.includes("forward")
  ) {
    return { icon: Icons.send, tone: "info" };
  }
  if (key.includes("creat") || key.includes("draft") || key.includes("new")) {
    return { icon: Icons.filePlus, tone: "primary" };
  }
  return { icon: Icons.history, tone: "muted" };
}

function ActivitySteps({ events }: { events: BookingActivityEvent[] }) {
  return (
    <ol className="booking-activity-steps custom-scroll">
      {events.map((event, index) => {
        const visual = getActivityStepVisual(event.action);
        const isLast = index === events.length - 1;
        return (
          <li
            key={event.id}
            className={[
              "booking-activity-steps__item",
              isLast ? "booking-activity-steps__item--last" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className="booking-activity-steps__rail" aria-hidden>
              <span
                className={`booking-activity-steps__icon booking-activity-steps__icon--${visual.tone} app-icon-inherit`}
              >
                <AppIcon icon={visual.icon} size={14} />
              </span>
              {!isLast ? (
                <span className="booking-activity-steps__connector" />
              ) : null}
            </div>
            <div className="booking-activity-steps__body">
              <Text strong className="booking-activity-steps__action">
                {event.action}
              </Text>
              <Text type="secondary" className="booking-activity-steps__meta">
                {event.by} · {event.at}
              </Text>
              {event.note ? (
                <Text className="booking-activity-steps__note">{event.note}</Text>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function BookingDetailsViewer({ bookingId }: BookingDetailsViewerProps) {
  const { t } = useTranslation(["booking", "common", "modules"]);
  const WIZARD_STEP_TITLES = useWizardStepTitles();
  const {
    data: booking,
    isLoading,
    error,
  } = useQuery({
    queryKey: bookingKeys.detail(String(bookingId ?? "")),
    queryFn: async () => {
      const data = await bookingApi.getBookingById(String(bookingId));
      return {
        ...data,
        cargo: data.cargo ? migrateLegacyCargo(data.cargo) : null,
      };
    },
    enabled: !!bookingId,
  });

  const { data: activity = [], isLoading: activityLoading } = useQuery({
    queryKey: bookingKeys.activity(String(bookingId ?? "")),
    queryFn: () => bookingApi.getBookingActivity(String(bookingId)),
    enabled: !!bookingId,
  });

  if (isLoading) {
    return (
      <div className="booking-panel">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (error || !booking || !booking.masterDetails || !booking.parties) {
    return <Result status="error" title={t("empty.unableToLoadDetails")} />;
  }

  const cargo = booking.cargo;
  const documents = booking.documents ?? [];
  const insuranceRequired = Boolean(booking.insurance?.isInsuranceRequired);
  const partyCards = partiesToCards(booking.parties);
  const reviewRoleSet = new Set(REVIEW_PARTY_ROLES);
  const extraPartyEntries = (
    Object.entries(partyCards) as [PartyRoleKey, (typeof partyCards)[PartyRoleKey]][]
  ).filter(([role, card]) => card && !reviewRoleSet.has(role));

  const masterRows = [
    { label: t("columns.origin"), value: dash(booking.masterDetails.origin) },
    { label: t("columns.delivery"), value: dash(booking.masterDetails.delivery) },
    {
      label: t("labels.cargoReadyDate"),
      value: dash(booking.masterDetails.cargoReadyDate),
    },
    {
      label: t("labels.haulageOrigin"),
      value: dash(booking.masterDetails.haulageOriginType),
    },
    {
      label: t("labels.haulageDestination"),
      value: dash(booking.masterDetails.haulageDestinationType),
    },
    {
      label: t("labels.carriageContract"),
      value: dash(booking.masterDetails.carriageContract),
    },
  ];

  return (
    <div className="booking-review booking-view-sections booking-view-sections--single">
      <BookingModuleStyles />

      <BookingPreviewSection variant="airy" title={t("sections.masterDetails")}>
        <BookingPreviewFieldGrid items={masterRows} />
      </BookingPreviewSection>

      <BookingPreviewSection variant="airy" title={t("sections.customerDetails")}>
        <div className="booking-review__party-grid">
          {REVIEW_PARTY_ROLES.map((role) => {
            const card = partyCards[role];
            return (
              <div key={role} className="booking-party-grid__col">
                {card ? (
                  <BookingPreviewPartyCard role={role} card={card} />
                ) : (
                  <BookingPreviewEmptyPartyCard role={role} />
                )}
              </div>
            );
          })}
          {extraPartyEntries.map(([role, card]) =>
            card ? (
              <div key={role} className="booking-party-grid__col">
                <BookingPreviewPartyCard role={role} card={card} />
              </div>
            ) : null,
          )}
        </div>
      </BookingPreviewSection>

      <BookingPreviewSection variant="airy" title={t("sections.cargoDetails")}>
        <PreviewCargoReview containers={cargo?.containers ?? []} />
      </BookingPreviewSection>

      <BookingPreviewSection variant="airy" title={t("sections.insuranceDetails")}>
        {insuranceRequired && booking.insurance ? (
          <BookingPreviewFieldGrid
            items={[
              {
                label: t("labels.cargoValue"),
                value: `${dash(booking.insurance.cargoValue)} ${dash(
                  booking.insurance.currency,
                )}`,
              },
              {
                label: t("labels.termsAccepted"),
                value: booking.insurance.termsAccepted ? "Yes" : "No",
              },
            ]}
          />
        ) : (
          <BookingPreviewEmpty label={t("empty.insuranceNotRequired")} />
        )}
      </BookingPreviewSection>

      {booking.ens?.euCustomsZone ? (
        <BookingPreviewSection
          variant="airy"
          title={WIZARD_STEP_TITLES.ensDetails}
        >
          <BookingPreviewFieldGrid
            items={[
              { label: t("labels.blType"), value: dash(booking.ens.blType) },
              {
                label: t("labels.filingType"),
                value: dash(booking.ens.ensFilingType),
              },
              {
                label: t("labels.declarantName"),
                value: dash(booking.ens.declarantName),
              },
            ]}
          />
        </BookingPreviewSection>
      ) : null}

      <BookingPreviewSection variant="airy" title={t("sections.documents")}>
        {documents.length === 0 ? (
          <BookingPreviewEmpty label={t("empty.noDocuments")} />
        ) : (
          <BookingPreviewFieldGrid
            items={documents.map((doc) => ({
              label: doc.type,
              value: doc.fileName,
            }))}
          />
        )}
      </BookingPreviewSection>

      <BookingPreviewSection variant="airy" title={t("sections.activity")}>
        {activityLoading ? (
          <Skeleton active paragraph={{ rows: 3 }} />
        ) : activity.length === 0 ? (
          <BookingPreviewEmpty label={t("empty.noActivity")} />
        ) : (
          <ActivitySteps events={activity} />
        )}
      </BookingPreviewSection>
    </div>
  );
}
