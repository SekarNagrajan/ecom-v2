// Modified by Sekar Nagarajan (2026-08-25 15:49)
import { AppButton } from "@solverminds/shared-ui";
import { AutoComplete, Button, DatePicker, Flex, Input, theme } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { AppIcon, Icons } from "../../../components/icons";

import { usePortSearch } from "../api/landing.queries";
import type { ScheduleSearchForm } from "../types/landing.types";

interface ScheduleSearchTabProps {
  form: UseFormReturn<ScheduleSearchForm>;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
}

function usePortAutocomplete(initialQuery = "") {
  const [query, setQuery] = useState(initialQuery);
  const { data: ports = [], isFetching } = usePortSearch(query);
  const { token } = theme.useToken();
  const options = ports.map((p) => ({
    value: `${p.portCode} - ${p.portName}`,
    label: (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            color: token.colorText,
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: 4,
            fontSize: 12,
          }}
        >
          {p.portCode}
        </span>
        <span>{p.portName}</span>
      </div>
    ),
  }));
  return { query, setQuery, options, isFetching };
}

export function ScheduleSearchTab({ form, onSubmit }: ScheduleSearchTabProps) {
  const { token } = theme.useToken();
  const {
    control,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = form;

  const polAC = usePortAutocomplete();
  const podAC = usePortAutocomplete();

  const handleSwap = () => {
    const pol = getValues("pol");
    const pod = getValues("pod");
    setValue("pol", pod, { shouldValidate: true });
    setValue("pod", pol, { shouldValidate: true });
    polAC.setQuery(pod);
    podAC.setQuery(pol);
  };

  const handleReset = () => {
    reset();
    polAC.setQuery("");
    podAC.setQuery("");
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
      id="schedule-search-form"
      onSubmit={onSubmit}
      style={{ width: "100%" }}
    >
      <Flex
        wrap="wrap"
        gap={16}
        align="flex-start"
        style={{ marginBottom: 16 }}
      >
        <div
          style={{
            flex: "1 1 200px",
            minWidth: 200,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <label style={labelStyle}>
            Origin <span style={asteriskStyle}>*</span>
          </label>
          <Controller
            control={control}
            name="pol"
            render={({ field }) => (
              <AutoComplete
                {...field}
                options={polAC.options}
                onSearch={polAC.setQuery}
                onSelect={(val) => {
                  field.onChange(val);
                  polAC.setQuery(val as string);
                }}
                style={{ width: "100%" }}
              >
                <Input
                  placeholder="Singapore"
                  style={inputStyle}
                  prefix={
                    <AppIcon
                      icon={Icons.mapPin}
                      size={16}
                      style={{ marginRight: 8, fontSize: 16 }}
                    />
                  }
                />
              </AutoComplete>
            )}
          />
          {errors.pol && (
            <div
              style={{ color: token.colorError, fontSize: 13, marginTop: 4 }}
            >
              {errors.pol.message}
            </div>
          )}
        </div>

        <div
          style={{ display: "flex", justifyContent: "center", marginTop: 32 }}
        >
          <Button
            icon={<AppIcon icon={Icons.arrowLeftRight} size={16} />}
            onClick={handleSwap}
            shape="circle"
            style={{
              width: 36,
              height: 36,
              borderColor: token.colorPrimaryBgHover,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          />
        </div>

        <div
          style={{
            flex: "1 1 200px",
            minWidth: 200,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <label style={labelStyle}>
            Delivery <span style={asteriskStyle}>*</span>
          </label>
          <Controller
            control={control}
            name="pod"
            render={({ field }) => (
              <AutoComplete
                {...field}
                options={podAC.options}
                onSearch={podAC.setQuery}
                onSelect={(val) => {
                  field.onChange(val);
                  podAC.setQuery(val as string);
                }}
                style={{ width: "100%" }}
              >
                <Input
                  placeholder="Rotterdam"
                  style={inputStyle}
                  prefix={
                    <AppIcon
                      icon={Icons.truck}
                      size={16}
                      style={{ marginRight: 8, fontSize: 16 }}
                    />
                  }
                />
              </AutoComplete>
            )}
          />
          {errors.pod && (
            <div
              style={{ color: token.colorError, fontSize: 13, marginTop: 4 }}
            >
              {errors.pod.message}
            </div>
          )}
        </div>
      </Flex>

      <Flex
        wrap="wrap"
        gap={16}
        align="flex-start"
        style={{ marginBottom: 24 }}
      >
        <div
          style={{
            flex: "1 1 200px",
            minWidth: 200,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <label style={labelStyle}>
            From date <span style={asteriskStyle}>*</span>
          </label>
          <Controller
            control={control}
            name="fromDate"
            render={({ field }) => (
              <DatePicker
                format="MM/DD/YYYY"
                placeholder="MM/DD/YYYY"
                style={{ width: "100%", ...inputStyle }}
                value={field.value ? dayjs(field.value) : null}
                onChange={(date) =>
                  field.onChange(date ? date.format("YYYY-MM-DD") : "")
                }
                suffixIcon={<AppIcon icon={Icons.calendar} size={16} />}
              />
            )}
          />
          {errors.fromDate && (
            <div
              style={{ color: token.colorError, fontSize: 13, marginTop: 4 }}
            >
              {errors.fromDate.message}
            </div>
          )}
        </div>

        <div
          style={{
            flex: "1 1 200px",
            minWidth: 200,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <label style={labelStyle}>
            To date <span style={asteriskStyle}>*</span>
          </label>
          <Controller
            control={control}
            name="toDate"
            render={({ field }) => (
              <DatePicker
                format="MM/DD/YYYY"
                placeholder="MM/DD/YYYY"
                style={{ width: "100%", ...inputStyle }}
                value={field.value ? dayjs(field.value) : null}
                onChange={(date) =>
                  field.onChange(date ? date.format("YYYY-MM-DD") : "")
                }
                suffixIcon={<AppIcon icon={Icons.calendar} size={16} />}
              />
            )}
          />
          {errors.toDate && (
            <div
              style={{ color: token.colorError, fontSize: 13, marginTop: 4 }}
            >
              {errors.toDate.message}
            </div>
          )}
        </div>
      </Flex>

      <Flex gap={12} className="landing-search-actions">
        <AppButton
          type="primary"
          size="large"
          htmlType="submit"
          onClick={(e) =>
            onSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
          }
          icon={<AppIcon icon={Icons.search} size={16} />}
        >
          Search sailings
        </AppButton>
        <AppButton
          size="large"
          htmlType="button"
          icon={<AppIcon icon={Icons.refreshCw} size={16} />}
          onClick={handleReset}
          aria-label="Reset schedule search"
        >
          Reset
        </AppButton>
      </Flex>
    </form>
  );
}
