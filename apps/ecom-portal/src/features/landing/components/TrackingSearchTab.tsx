// Modified by Sekar Nagarajan (2026-09-18 10:45)
import { AppButton } from "@solverminds/shared-ui";
import { Flex, Input, Tabs, theme } from "antd";
import { Controller, type UseFormReturn } from "react-hook-form";

import { AppIcon, Icons } from "../../../components/icons";
import type { TrackingSearchType } from "../../tracking/types/tracking.types";
import type { TrackingSearchForm } from "../types/landing.types";
import { ImageCaptcha } from "./ImageCaptcha";

interface TrackingSearchTabProps {
  form: UseFormReturn<TrackingSearchForm>;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  showImageCaptcha?: boolean;
  isSearching?: boolean;
}

function fieldLabel(searchType: TrackingSearchType): string {
  switch (searchType) {
    case "BOOKING":
      return "Enter the booking number";
    case "BL":
      return "Enter the bill of lading (BL) number";
    case "CONTAINER":
      return "Enter the container number";
    default: {
      const _exhaustive: never = searchType;
      return _exhaustive;
    }
  }
}

function fieldPlaceholder(searchType: TrackingSearchType): string {
  switch (searchType) {
    case "BOOKING":
      return "e.g. BKG-2026-9901";
    case "BL":
      return "e.g. BL-SHA-88401";
    case "CONTAINER":
      return "e.g. SMLU8829102";
    default: {
      const _exhaustive: never = searchType;
      return _exhaustive;
    }
  }
}

export function TrackingSearchTab({
  form,
  onSubmit,
  showImageCaptcha = true,
  isSearching = false,
}: TrackingSearchTabProps) {
  const { token } = theme.useToken();
  const {
    control,
    reset,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = form;

  const searchType = watch("searchType");

  const handleReset = () => {
    reset({
      searchType,
      trackingNumber: "",
      captcha: "",
    });
  };

  const handleTabChange = (key: string) => {
    const next = key as TrackingSearchType;
    setValue("searchType", next);
    setValue("trackingNumber", "");
    clearErrors("trackingNumber");
  };

  const inputStyle = {
    height: 44,
    borderRadius: token.borderRadius,
    fontSize: 15,
  };

  const labelStyle = {
    fontWeight: 600,
    color: "#555",
    marginBottom: 6,
    display: "inline-block",
  };
  const asteriskStyle = { color: token.colorError };

  return (
    <form
      id="tracking-search-form"
      onSubmit={onSubmit}
      style={{ width: "100%" }}
    >
      <Tabs
        activeKey={searchType}
        onChange={handleTabChange}
        className="landing-tracking-search-tabs"
        style={{ marginBottom: 8 }}
        items={[
          {
            key: "CONTAINER",
            label: "Container No",
          },
          {
            key: "BOOKING",
            label: "Booking No",
          },
          {
            key: "BL",
            label: "Bill of Lading (BL)",
          },
        ]}
      />

      <div style={{ marginBottom: 24 }}>
        <div style={{ margin: 0, display: "flex", flexDirection: "column" }}>
          <label style={labelStyle}>
            {fieldLabel(searchType)} <span style={asteriskStyle}>*</span>
          </label>
          <Controller
            control={control}
            name="trackingNumber"
            render={({ field }) => (
              <Input
                {...field}
                id="tracking-number"
                size="large"
                placeholder={fieldPlaceholder(searchType)}
                autoComplete="off"
                allowClear
                style={inputStyle}
                status={errors.trackingNumber ? "error" : undefined}
                prefix={
                  <AppIcon
                    icon={Icons.mapPin}
                    size={16}
                    style={{ marginRight: 8, fontSize: 16 }}
                  />
                }
                onChange={(e) => {
                  field.onChange(e.target.value.toUpperCase());
                }}
              />
            )}
          />
          {errors.trackingNumber && (
            <div
              style={{ color: token.colorError, fontSize: 13, marginTop: 4 }}
            >
              {errors.trackingNumber.message}
            </div>
          )}
        </div>
      </div>

      {showImageCaptcha && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ margin: 0, display: "flex", flexDirection: "column" }}>
            <label style={labelStyle}>Security Verification</label>
            <ImageCaptcha
              control={control}
              name="captcha"
              errorMessage={errors.captcha?.message}
            />
          </div>
        </div>
      )}

      <Flex gap={12} wrap="wrap" className="landing-search-actions">
        <AppButton
          type="primary"
          size="large"
          htmlType="submit"
          id="tracking-search-btn"
          loading={isSearching}
          disabled={isSearching}
          onClick={(e) =>
            onSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
          }
          icon={
            isSearching ? undefined : <AppIcon icon={Icons.search} size={16} />
          }
        >
          Track shipment
        </AppButton>
        <AppButton
          danger
          size="large"
          htmlType="button"
          disabled={isSearching}
          icon={<AppIcon icon={Icons.refreshCw} size={16} tone="delete" />}
          onClick={handleReset}
          aria-label="Reset tracking search"
        >
          Reset
        </AppButton>
      </Flex>
    </form>
  );
}
