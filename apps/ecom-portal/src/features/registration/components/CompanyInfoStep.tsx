// Modified by Sekar Nagarajan (2026-08-25 16:15)
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

import { RESPONSIVE_COL } from "../../../constants/responsive-grid";
import { checkCustomerCode, searchAddress } from "../api/registration.api";
import type {
  AddressLookupResult,
  RegistrationFormData,
} from "../types/registration.schema";

const { Text } = Typography;

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
        toast.success("Customer code verified. Auto-filling details.");
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
          message: "Invalid Customer Code",
        });
      }
    } catch {
      setError("customerCode", {
        type: "manual",
        message: "Error validating code",
      });
    } finally {
      setIsCheckingCode(false);
    }
  };

  return (
    <Flex vertical gap={24} className="reg-step-body">
      <Controller
        name="customerType"
        control={control}
        render={({ field }) => (
          <Radio.Group {...field} optionType="button" buttonStyle="solid">
            <Radio value="NEW">New Customer</Radio>
            <Radio value="EXISTING">Existing Customer</Radio>
          </Radio.Group>
        )}
      />

      {customerType === "EXISTING" && (
        <Row gutter={[24, 24]}>
          <Col {...RESPONSIVE_COL.formHalf}>
            <Flex vertical gap={8}>
              <FieldLabel required>Customer Code</FieldLabel>
              <Controller
                name="customerCode"
                control={control}
                render={({ field }) => (
                  <div>
                    <Input
                      {...field}
                      size="large"
                      placeholder="Enter Customer Code"
                      status={errors.customerCode ? "error" : undefined}
                      onBlur={(e) => {
                        field.onBlur();
                        handleCustomerCodeBlur(e.target.value);
                      }}
                      disabled={isCheckingCode}
                    />
                    {errors.customerCode && (
                      <Text type="danger" className="form-field-error">
                        {errors.customerCode.message}
                      </Text>
                    )}
                  </div>
                )}
              />
            </Flex>
          </Col>
        </Row>
      )}

      <Row gutter={[24, 24]}>
        <Col {...RESPONSIVE_COL.formHalf}>
          <Flex vertical gap={8}>
            <FieldLabel required>Company Name</FieldLabel>
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
                      placeholder="Company Name"
                      status={errors.companyName ? "error" : undefined}
                    />
                  </AutoComplete>
                  {errors.companyName && (
                    <Text type="danger" className="form-field-error">
                      {errors.companyName.message}
                    </Text>
                  )}
                </div>
              )}
            />
          </Flex>
        </Col>

        <Col {...RESPONSIVE_COL.formHalf}>
          <Flex vertical gap={8}>
            <FieldLabel required>Country</FieldLabel>
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <div>
                  <Select
                    {...field}
                    value={field.value || undefined}
                    size="large"
                    placeholder="Country"
                    status={errors.country ? "error" : undefined}
                    className="reg-field-full"
                    options={[
                      { value: "US", label: "United States" },
                      { value: "GB", label: "United Kingdom" },
                      { value: "CA", label: "Canada" },
                      { value: "IN", label: "India" },
                      { value: "AU", label: "Australia" },
                      { value: "SG", label: "Singapore" },
                    ]}
                  />
                  {errors.country && (
                    <Text type="danger" className="form-field-error">
                      {errors.country.message}
                    </Text>
                  )}
                </div>
              )}
            />
          </Flex>
        </Col>

        <Col {...RESPONSIVE_COL.formHalf}>
          <Flex vertical gap={8}>
            <FieldLabel required>Controlling Agency</FieldLabel>
            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <div>
                  <Select
                    {...field}
                    value={field.value || undefined}
                    size="large"
                    placeholder="Controlling Agency"
                    status={errors.location ? "error" : undefined}
                    className="reg-field-full"
                    options={[
                      { value: "AGENCY_US", label: "US Agency" },
                      { value: "AGENCY_GB", label: "UK Agency" },
                      { value: "AGENCY_SG", label: "Singapore Agency" },
                    ]}
                  />
                  {errors.location && (
                    <Text type="danger" className="form-field-error">
                      {errors.location.message}
                    </Text>
                  )}
                </div>
              )}
            />
          </Flex>
        </Col>

        <Col {...RESPONSIVE_COL.formHalf}>
          <Flex vertical gap={8}>
            <FieldLabel required>City</FieldLabel>
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <div>
                  <Input
                    {...field}
                    size="large"
                    placeholder="City"
                    status={errors.city ? "error" : undefined}
                  />
                  {errors.city && (
                    <Text type="danger" className="form-field-error">
                      {errors.city.message}
                    </Text>
                  )}
                </div>
              )}
            />
          </Flex>
        </Col>

        <Col {...RESPONSIVE_COL.full}>
          <Flex vertical gap={8}>
            <FieldLabel required>Address 1</FieldLabel>
            <Controller
              name="address1"
              control={control}
              render={({ field }) => (
                <div>
                  <Input
                    {...field}
                    size="large"
                    placeholder="Address 1"
                    status={errors.address1 ? "error" : undefined}
                  />
                  {errors.address1 && (
                    <Text type="danger" className="form-field-error">
                      {errors.address1.message}
                    </Text>
                  )}
                </div>
              )}
            />
          </Flex>
        </Col>

        <Col {...RESPONSIVE_COL.full}>
          <Flex vertical gap={8}>
            <FieldLabel>Address 2</FieldLabel>
            <Controller
              name="address2"
              control={control}
              render={({ field }) => (
                <Input {...field} size="large" placeholder="Address 2" />
              )}
            />
          </Flex>
        </Col>

        <Col {...RESPONSIVE_COL.formHalf}>
          <Flex vertical gap={8}>
            <FieldLabel>Postal Code</FieldLabel>
            <Controller
              name="postalCode"
              control={control}
              render={({ field }) => (
                <Input {...field} size="large" placeholder="Postal Code" />
              )}
            />
          </Flex>
        </Col>

        <Col {...RESPONSIVE_COL.formHalf}>
          <Flex vertical gap={8}>
            <FieldLabel>Tax ID</FieldLabel>
            <Controller
              name="taxId"
              control={control}
              render={({ field }) => (
                <Input {...field} size="large" placeholder="Tax ID" />
              )}
            />
          </Flex>
        </Col>

        <Col {...RESPONSIVE_COL.formHalf}>
          <Flex vertical gap={8}>
            <FieldLabel>Website</FieldLabel>
            <Controller
              name="companyDomain"
              control={control}
              render={({ field }) => (
                <Input {...field} size="large" placeholder="Website" />
              )}
            />
          </Flex>
        </Col>

        <Col {...RESPONSIVE_COL.formHalf}>
          <Flex vertical gap={8}>
            <FieldLabel>Recent BL/Booking number</FieldLabel>
            <Controller
              name="recentBL"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  size="large"
                  placeholder="Recent BL/Booking number"
                />
              )}
            />
          </Flex>
        </Col>

        <Col {...RESPONSIVE_COL.formHalf}>
          <Flex vertical gap={8}>
            <FieldLabel required>Company Phone</FieldLabel>
            <Flex gap={8}>
              <Controller
                name="companyPhoneCountryCode"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    size="large"
                    placeholder="+1"
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
                      placeholder="Phone"
                      status={errors.companyPhoneNo ? "error" : undefined}
                    />
                  </div>
                )}
              />
            </Flex>
            {errors.companyPhoneNo && (
              <Text type="danger" className="form-field-error">
                {errors.companyPhoneNo.message}
              </Text>
            )}
          </Flex>
        </Col>
      </Row>
    </Flex>
  );
}
