// Modified by Sekar Nagarajan (2026-09-11 12:02)
import { useToast } from "@solverminds/shared-ui/hooks";
import {
  AutoComplete,
  Col,
  Flex,
  Input,
  Radio,
  Row,
  Select,
  Typography,
} from "antd";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { RESPONSIVE_COL } from "../../../constants/responsive-grid";
import { checkCustomerCode, searchAddress } from "../api/registration.api";
import type {
  AddressLookupResult,
  RegistrationFormData,
} from "../types/registration.schema";

const { Text } = Typography;

const COL3 = RESPONSIVE_COL.formThird;

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <span className="form-field-label">
      {children}
      {required ? <Text type="danger"> *</Text> : null}
    </span>
  );
}

export function CompanyInfoStep() {
  const { t } = useTranslation(["registration", "common"]);
  const {
    control,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext<RegistrationFormData>();
  const [addressOptions, setAddressOptions] = useState<
    { value: string; label: string; payload: AddressLookupResult }[]
  >([]);
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const toast = useToast();

  const customerType = watch("customerType");
  const isExisting = customerType === "EXISTING";

  const countryOptions = [
    { value: "US", label: t("options.countries.US") },
    { value: "GB", label: t("options.countries.GB") },
    { value: "CA", label: t("options.countries.CA") },
    { value: "IN", label: t("options.countries.IN") },
    { value: "AU", label: t("options.countries.AU") },
    { value: "SG", label: t("options.countries.SG") },
  ];

  const agencyOptions = [
    { value: "AGENCY_US", label: t("options.agencies.AGENCY_US") },
    { value: "AGENCY_GB", label: t("options.agencies.AGENCY_GB") },
    { value: "AGENCY_SG", label: t("options.agencies.AGENCY_SG") },
  ];

  const handleSearch = async (value: string) => {
    if (!value) {
      setAddressOptions([]);
      return;
    }
    try {
      const results = await searchAddress(value);
      setAddressOptions(
        results.map((r) => ({
          value: r.companyName,
          label: `${r.companyName} - ${r.city}, ${r.country}`,
          payload: r,
        })),
      );
    } catch {
      setAddressOptions([]);
    }
  };

  const handleSelect = (_value: string, option: unknown) => {
    const { payload } = option as { payload: AddressLookupResult };
    setValue("companyName", payload.companyName, { shouldValidate: true });
    setValue("address1", payload.address1, { shouldValidate: true });
    setValue("city", payload.city, { shouldValidate: true });
    setValue("country", payload.country, { shouldValidate: true });
  };

  const handleCustomerCodeBlur = async (code: string) => {
    if (!code) return;
    setIsCheckingCode(true);
    try {
      const data = await checkCustomerCode(code);
      if (data.valid) {
        clearErrors("customerCode");
        toast.success(t("toasts.customerCodeVerified"));
        if (data.companyName) {
          setValue("companyName", data.companyName, { shouldValidate: true });
        }
        if (data.country) {
          setValue("country", data.country, { shouldValidate: true });
        }
        if (data.address1) {
          setValue("address1", data.address1, { shouldValidate: true });
        }
        if (data.city) {
          setValue("city", data.city, { shouldValidate: true });
        }
      } else {
        setError("customerCode", {
          type: "manual",
          message: t("validation.invalidCustomerCode"),
        });
      }
    } catch {
      setError("customerCode", {
        type: "manual",
        message: t("validation.errorValidatingCode"),
      });
    } finally {
      setIsCheckingCode(false);
    }
  };

  const companyNameField = (
    <Col {...COL3}>
      <Flex vertical gap={8}>
        <FieldLabel required>{t("company.companyName")}</FieldLabel>
        <Controller
          name="companyName"
          control={control}
          render={({ field }) => (
            <div>
              <AutoComplete
                options={addressOptions}
                onSearch={handleSearch}
                onSelect={handleSelect}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                className="reg-field-full"
              >
                <Input
                  size="large"
                  placeholder={t("company.companyName")}
                  status={errors.companyName ? "error" : undefined}
                />
              </AutoComplete>
              {errors.companyName ? (
                <Text type="danger" className="form-field-error">
                  {errors.companyName.message}
                </Text>
              ) : null}
            </div>
          )}
        />
      </Flex>
    </Col>
  );

  const countryField = (
    <Col {...COL3}>
      <Flex vertical gap={8}>
        <FieldLabel required>{t("company.country")}</FieldLabel>
        <Controller
          name="country"
          control={control}
          render={({ field }) => (
            <div>
              <Select
                {...field}
                value={field.value || undefined}
                size="large"
                placeholder={t("company.country")}
                status={errors.country ? "error" : undefined}
                className="reg-field-full"
                options={countryOptions}
              />
              {errors.country ? (
                <Text type="danger" className="form-field-error">
                  {errors.country.message}
                </Text>
              ) : null}
            </div>
          )}
        />
      </Flex>
    </Col>
  );

  const agencyField = (
    <Col {...COL3}>
      <Flex vertical gap={8}>
        <FieldLabel required>{t("company.controllingAgency")}</FieldLabel>
        <Controller
          name="location"
          control={control}
          render={({ field }) => (
            <div>
              <Select
                {...field}
                value={field.value || undefined}
                size="large"
                placeholder={t("company.controllingAgency")}
                status={errors.location ? "error" : undefined}
                className="reg-field-full"
                options={agencyOptions}
              />
              {errors.location ? (
                <Text type="danger" className="form-field-error">
                  {errors.location.message}
                </Text>
              ) : null}
            </div>
          )}
        />
      </Flex>
    </Col>
  );

  const cityField = (
    <Col {...COL3}>
      <Flex vertical gap={8}>
        <FieldLabel required>{t("company.city")}</FieldLabel>
        <Controller
          name="city"
          control={control}
          render={({ field }) => (
            <div>
              <Input
                {...field}
                size="large"
                placeholder={t("company.city")}
                status={errors.city ? "error" : undefined}
              />
              {errors.city ? (
                <Text type="danger" className="form-field-error">
                  {errors.city.message}
                </Text>
              ) : null}
            </div>
          )}
        />
      </Flex>
    </Col>
  );

  const postalField = (
    <Col {...COL3}>
      <Flex vertical gap={8}>
        <FieldLabel>{t("company.postalCode")}</FieldLabel>
        <Controller
          name="postalCode"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              size="large"
              placeholder={t("company.postalCode")}
            />
          )}
        />
      </Flex>
    </Col>
  );

  const address1Field = (
    <Col {...COL3}>
      <Flex vertical gap={8}>
        <FieldLabel required>{t("company.address1")}</FieldLabel>
        <Controller
          name="address1"
          control={control}
          render={({ field }) => (
            <div>
              <Input
                {...field}
                size="large"
                placeholder={t("company.address1")}
                status={errors.address1 ? "error" : undefined}
              />
              {errors.address1 ? (
                <Text type="danger" className="form-field-error">
                  {errors.address1.message}
                </Text>
              ) : null}
            </div>
          )}
        />
      </Flex>
    </Col>
  );

  const address2Field = (
    <Col {...COL3}>
      <Flex vertical gap={8}>
        <FieldLabel>{t("company.address2")}</FieldLabel>
        <Controller
          name="address2"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              size="large"
              placeholder={t("company.address2")}
            />
          )}
        />
      </Flex>
    </Col>
  );

  const websiteField = (
    <Col {...COL3}>
      <Flex vertical gap={8}>
        <FieldLabel>{t("company.website")}</FieldLabel>
        <Controller
          name="companyDomain"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              size="large"
              placeholder={t("company.website")}
            />
          )}
        />
      </Flex>
    </Col>
  );

  const recentBlField = (
    <Col {...COL3}>
      <Flex vertical gap={8}>
        <FieldLabel>{t("company.recentBl")}</FieldLabel>
        <Controller
          name="recentBL"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              size="large"
              placeholder={t("company.recentBl")}
            />
          )}
        />
      </Flex>
    </Col>
  );

  const phoneField = (
    <Col {...COL3}>
      <Flex vertical gap={8}>
        <FieldLabel required>{t("company.companyPhone")}</FieldLabel>
        <Flex gap={8}>
          <Controller
            name="companyPhoneCountryCode"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                size="large"
                placeholder={t("company.phoneCodePlaceholder")}
                className="reg-phone-code"
              />
            )}
          />
          <Controller
            name="companyPhoneNo"
            control={control}
            render={({ field }) => (
              <div className="reg-phone-number">
                <Input
                  {...field}
                  size="large"
                  placeholder={t("company.phonePlaceholder")}
                  status={errors.companyPhoneNo ? "error" : undefined}
                />
              </div>
            )}
          />
        </Flex>
        {errors.companyPhoneNo ? (
          <Text type="danger" className="form-field-error">
            {errors.companyPhoneNo.message}
          </Text>
        ) : null}
      </Flex>
    </Col>
  );

  return (
    <Flex vertical gap={12} className="reg-step-body">
      <Controller
        name="customerType"
        control={control}
        render={({ field }) => (
          <Radio.Group {...field} optionType="button" buttonStyle="solid">
            <Radio value="NEW">{t("company.newCustomer")}</Radio>
            <Radio value="EXISTING">{t("company.existingCustomer")}</Radio>
          </Radio.Group>
        )}
      />

      {isExisting ? (
        <>
          {/* Row 1 — 3 cols */}
          <Row gutter={[16, 12]}>
            <Col {...COL3}>
              <Flex vertical gap={8}>
                <FieldLabel required>{t("company.customerCode")}</FieldLabel>
                <Controller
                  name="customerCode"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Input
                        {...field}
                        size="large"
                        placeholder={t("company.customerCodePlaceholder")}
                        status={errors.customerCode ? "error" : undefined}
                        onBlur={(e) => {
                          field.onBlur();
                          handleCustomerCodeBlur(e.target.value);
                        }}
                        disabled={isCheckingCode}
                      />
                      {errors.customerCode ? (
                        <Text type="danger" className="form-field-error">
                          {errors.customerCode.message}
                        </Text>
                      ) : null}
                    </div>
                  )}
                />
              </Flex>
            </Col>
            {companyNameField}
            {countryField}
          </Row>

          {/* Row 2 — 3 cols */}
          <Row gutter={[16, 12]}>
            {agencyField}
            {cityField}
            {postalField}
          </Row>

          {/* Row 3 — 3 cols */}
          <Row gutter={[16, 12]}>
            {address1Field}
            {address2Field}
            {websiteField}
          </Row>

          {/* Row 4 — remaining fields on same 3-col grid */}
          <Row gutter={[16, 12]}>
            {recentBlField}
            {phoneField}
          </Row>
        </>
      ) : (
        <>
          <Row gutter={[16, 12]}>
            {companyNameField}
            {countryField}
            {agencyField}
          </Row>

          <Row gutter={[16, 12]}>
            {cityField}
            {postalField}
            {address1Field}
          </Row>

          <Row gutter={[16, 12]}>
            {address2Field}
            {websiteField}
            {recentBlField}
          </Row>

          <Row gutter={[16, 12]}>{phoneField}</Row>
        </>
      )}
    </Flex>
  );
}
