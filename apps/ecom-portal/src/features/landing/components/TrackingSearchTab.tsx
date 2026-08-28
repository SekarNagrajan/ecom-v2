// Modified by Sekar Nagarajan (2026-08-25 15:45)
import { AppButton } from "@solverminds/shared-ui";
import { Flex, Input, theme } from "antd";
import { Controller, type UseFormReturn } from "react-hook-form";
import { AppIcon, Icons } from "../../../components/icons";

import type { TrackingSearchForm } from "../types/landing.types";
import { ImageCaptcha } from "./ImageCaptcha";

interface TrackingSearchTabProps {
  form: UseFormReturn<TrackingSearchForm>;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  showImageCaptcha?: boolean;
}

export function TrackingSearchTab({
  form,
  onSubmit,
  showImageCaptcha = true,
}: TrackingSearchTabProps) {
  const { token } = theme.useToken();
  const {
    control,
    reset,
    formState: { errors },
  } = form;

  const handleReset = () => {
    reset();
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
      <div style={{ marginBottom: 24 }}>
        <div style={{ margin: 0, display: "flex", flexDirection: "column" }}>
          <label style={labelStyle}>
            BL / Booking / Container Number <span style={asteriskStyle}>*</span>
          </label>
          <Controller
            control={control}
            name="trackingNumber"
            render={({ field }) => (
              <Input
                {...field}
                id="tracking-number"
                placeholder="e.g. MSKU1234567 or BKG-2024-001"
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
                  form.setValue("trackingNumber", e.target.value.toUpperCase());
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
          onClick={(e) =>
            onSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
          }
          icon={<AppIcon icon={Icons.search} size={16} />}
        >
          Track shipment
        </AppButton>
        <AppButton
          size="large"
          htmlType="button"
          icon={<AppIcon icon={Icons.refreshCw} size={16} />}
          onClick={handleReset}
          aria-label="Reset tracking search"
        >
          Reset
        </AppButton>
      </Flex>
    </form>
  );
}
