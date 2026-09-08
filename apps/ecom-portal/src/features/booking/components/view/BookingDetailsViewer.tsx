// Modified by Sekar Nagarajan (2026-09-08 14:58)
import { useQuery } from "@tanstack/react-query";
import { Result, Skeleton, Typography } from "antd";
import type { LucideIcon } from "lucide-react";

import { AppIcon, Icons } from "../../../../components/icons";
import { WIZARD_STEP_TITLES } from "../../../../constants/module-titles";
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
    return <Result status="error" title="Failed to load booking details" />;
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
    { label: "Origin", value: dash(booking.masterDetails.origin) },
    { label: "Delivery", value: dash(booking.masterDetails.delivery) },
    {
      label: "Cargo ready date",
      value: dash(booking.masterDetails.cargoReadyDate),
    },
    {
      label: "Haulage origin",
      value: dash(booking.masterDetails.haulageOriginType),
    },
    {
      label: "Haulage destination",
      value: dash(booking.masterDetails.haulageDestinationType),
    },
    {
      label: "Carriage contract",
      value: dash(booking.masterDetails.carriageContract),
    },
  ];

  return (
    <div className="booking-review booking-view-sections booking-view-sections--single">
      <BookingModuleStyles />

      <BookingPreviewSection variant="airy" title="Master details">
        <BookingPreviewFieldGrid items={masterRows} />
      </BookingPreviewSection>

      <BookingPreviewSection variant="airy" title="Customer details">
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

      <BookingPreviewSection variant="airy" title="Cargo details">
        <PreviewCargoReview containers={cargo?.containers ?? []} />
      </BookingPreviewSection>

      <BookingPreviewSection variant="airy" title="Insurance details">
        {insuranceRequired && booking.insurance ? (
          <BookingPreviewFieldGrid
            items={[
              {
                label: "Cargo value",
                value: `${dash(booking.insurance.cargoValue)} ${dash(
                  booking.insurance.currency,
                )}`,
              },
              {
                label: "Terms accepted",
                value: booking.insurance.termsAccepted ? "Yes" : "No",
              },
            ]}
          />
        ) : (
          <BookingPreviewEmpty label="Insurance not required for this booking." />
        )}
      </BookingPreviewSection>

      {booking.ens?.euCustomsZone ? (
        <BookingPreviewSection
          variant="airy"
          title={WIZARD_STEP_TITLES.ensDetails}
        >
          <BookingPreviewFieldGrid
            items={[
              { label: "BL type", value: dash(booking.ens.blType) },
              {
                label: "Filing type",
                value: dash(booking.ens.ensFilingType),
              },
              {
                label: "Declarant name",
                value: dash(booking.ens.declarantName),
              },
            ]}
          />
        </BookingPreviewSection>
      ) : null}

      <BookingPreviewSection variant="airy" title="Documents">
        {documents.length === 0 ? (
          <BookingPreviewEmpty label="No documents uploaded" />
        ) : (
          <BookingPreviewFieldGrid
            items={documents.map((doc) => ({
              label: doc.type,
              value: doc.fileName,
            }))}
          />
        )}
      </BookingPreviewSection>

      <BookingPreviewSection variant="airy" title="Activity">
        {activityLoading ? (
          <Skeleton active paragraph={{ rows: 3 }} />
        ) : activity.length === 0 ? (
          <BookingPreviewEmpty label="No activity recorded" />
        ) : (
          <ActivitySteps events={activity} />
        )}
      </BookingPreviewSection>
    </div>
  );
}
