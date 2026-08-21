// Modified by sekar nagarajan (2026-08-21)
import { useToast } from '@solverminds/shared-ui/hooks';
import { AutoComplete, Col, Flex, Input, Radio, Row, Select, Typography } from 'antd';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { checkCustomerCode, searchAddress } from '../api/registration.api';
import { RegistrationFormData } from '../types/registration.schema';

const { Text } = Typography;

export function CompanyInfoStep() {
  const { control, watch, setValue, setError, clearErrors, formState: { errors } } = useFormContext<RegistrationFormData>();
  const [addressOptions, setAddressOptions] = useState<{ value: string; label: string; payload: unknown }[]>([]);
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const toast = useToast();

  const customerType = watch('customerType');

  // Debounced search for Google Address lookup
  const handleSearch = async (value: string) => {
    if (!value) {
      setAddressOptions([]);
      return;
    }
    try {
      const results = await searchAddress(value);
      setAddressOptions(results.map((r: { companyName: string; city: string; country: string; address1: string }) => ({
        value: r.companyName,
        label: `${r.companyName} - ${r.city}, ${r.country}`,
        payload: r
      })));
    } catch (e) {
      setAddressOptions([]);
    }
  };

  const handleSelect = (value: string, option: unknown) => {
    const { payload } = option as { payload: { companyName: string; city: string; country: string; address1: string } };
    setValue('companyName', payload.companyName, { shouldValidate: true });
    setValue('address1', payload.address1, { shouldValidate: true });
    setValue('city', payload.city, { shouldValidate: true });
    setValue('country', payload.country, { shouldValidate: true });
  };

  const handleCustomerCodeBlur = async (code: string) => {
    if (!code) return;
    setIsCheckingCode(true);
    try {
      const data = await checkCustomerCode(code);
      if (data.valid) {
        clearErrors('customerCode');
        toast.success('Customer code verified. Auto-filling details.');
        setValue('companyName', data.companyName, { shouldValidate: true });
        setValue('country', data.country, { shouldValidate: true });
        setValue('address1', data.address1, { shouldValidate: true });
        setValue('city', data.city, { shouldValidate: true });
      } else {
        setError('customerCode', { type: 'manual', message: 'Invalid Customer Code' });
      }
    } catch (e) {
      setError('customerCode', { type: 'manual', message: 'Error validating code' });
    } finally {
      setIsCheckingCode(false);
    }
  };

  return (
    <Flex vertical gap={24} style={{ padding: '24px 0' }}>
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

      {customerType === 'EXISTING' && (
        <Row gutter={[24, 24]} style={{ marginTop: -8 }}>
          <Col span={12}>
            <Flex vertical gap={8}>
              <Text strong>Customer Code <span style={{ color: 'red' }}>*</span></Text>
              <Controller
                name="customerCode"
                control={control}
                render={({ field }) => (
                  <div>
                    <Input
                      {...field}
                      size="large"
                      placeholder="Enter Customer Code"
                      status={errors.customerCode ? 'error' : undefined}
                      onBlur={(e) => {
                        field.onBlur();
                        handleCustomerCodeBlur(e.target.value);
                      }}
                      disabled={isCheckingCode}
                    />
                    {errors.customerCode && <Text type="danger" style={{ fontSize: 12 }}>{errors.customerCode.message}</Text>}
                  </div>
                )}
              />
            </Flex>
          </Col>
        </Row>
      )}

      <Row gutter={[24, 24]}>
        <Col span={12}>
          <Flex vertical gap={8}>
            <Text strong>Company Name <span style={{ color: 'red' }}>*</span></Text>
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
                    style={{ width: '100%' }}
                  >
                    <Input
                      size="large"
                      placeholder="Company Name"
                      status={errors.companyName ? 'error' : undefined}
                    />
                  </AutoComplete>
                  {errors.companyName && <Text type="danger" style={{ fontSize: 12 }}>{errors.companyName.message}</Text>}
                </div>
              )}
            />
          </Flex>
        </Col>

        <Col span={12}>
          <Flex vertical gap={8}>
            <Text strong>Country <span style={{ color: 'red' }}>*</span></Text>
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
                    status={errors.country ? 'error' : undefined}
                    style={{ width: '100%' }}
                    options={[
                      { value: 'US', label: 'United States' },
                      { value: 'GB', label: 'United Kingdom' },
                      { value: 'CA', label: 'Canada' },
                      { value: 'IN', label: 'India' },
                      { value: 'AU', label: 'Australia' },
                      { value: 'SG', label: 'Singapore' },
                    ]}
                  />
                  {errors.country && <Text type="danger" style={{ fontSize: 12 }}>{errors.country.message}</Text>}
                </div>
              )}
            />
          </Flex>
        </Col>

        <Col span={12}>
          <Flex vertical gap={8}>
            <Text strong>Controlling Agency <span style={{ color: 'red' }}>*</span></Text>
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
                    status={errors.location ? 'error' : undefined}
                    style={{ width: '100%' }}
                    options={[
                      { value: 'AGENCY_US', label: 'US Agency' },
                      { value: 'AGENCY_GB', label: 'UK Agency' },
                      { value: 'AGENCY_SG', label: 'Singapore Agency' },
                    ]}
                  />
                  {errors.location && <Text type="danger" style={{ fontSize: 12 }}>{errors.location.message}</Text>}
                </div>
              )}
            />
          </Flex>
        </Col>

        <Col span={12}>
          <Flex vertical gap={8}>
            <Text strong>City <span style={{ color: 'red' }}>*</span></Text>
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <div>
                  <Input
                    {...field}
                    size="large"
                    placeholder="City"
                    status={errors.city ? 'error' : undefined}
                  />
                  {errors.city && <Text type="danger" style={{ fontSize: 12 }}>{errors.city.message}</Text>}
                </div>
              )}
            />
          </Flex>
        </Col>

        <Col span={24}>
          <Flex vertical gap={8}>
            <Text strong>Address 1 <span style={{ color: 'red' }}>*</span></Text>
            <Controller
              name="address1"
              control={control}
              render={({ field }) => (
                <div>
                  <Input
                    {...field}
                    size="large"
                    placeholder="Address 1"
                    status={errors.address1 ? 'error' : undefined}
                  />
                  {errors.address1 && <Text type="danger" style={{ fontSize: 12 }}>{errors.address1.message}</Text>}
                </div>
              )}
            />
          </Flex>
        </Col>

        <Col span={24}>
          <Flex vertical gap={8}>
            <Text strong>Address 2</Text>
            <Controller
              name="address2"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  size="large"
                  placeholder="Address 2"
                />
              )}
            />
          </Flex>
        </Col>

        <Col span={12}>
          <Flex vertical gap={8}>
            <Text strong>Postal Code</Text>
            <Controller
              name="postalCode"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  size="large"
                  placeholder="Postal Code"
                />
              )}
            />
          </Flex>
        </Col>

        <Col span={12}>
          <Flex vertical gap={8}>
            <Text strong>Tax ID</Text>
            <Controller
              name="taxId"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  size="large"
                  placeholder="Tax ID"
                />
              )}
            />
          </Flex>
        </Col>

        <Col span={12}>
          <Flex vertical gap={8}>
            <Text strong>Website</Text>
            <Controller
              name="companyDomain"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  size="large"
                  placeholder="Website"
                />
              )}
            />
          </Flex>
        </Col>

        <Col span={12}>
          <Flex vertical gap={8}>
            <Text strong>Recent BL/Booking number</Text>
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

        <Col span={12}>
          <Flex vertical gap={8}>
            <Text strong>Company Phone <span style={{ color: 'red' }}>*</span></Text>
            <Flex gap={8}>
              <Controller
                name="companyPhoneCountryCode"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    size="large"
                    placeholder="+1"
                    style={{ width: 80 }}
                  />
                )}
              />
              <Controller
                name="companyPhoneNo"
                control={control}
                render={({ field }) => (
                  <div style={{ flex: 1 }}>
                    <Input
                      {...field}
                      size="large"
                      placeholder="Phone"
                      status={errors.companyPhoneNo ? 'error' : undefined}
                    />
                  </div>
                )}
              />
            </Flex>
            {errors.companyPhoneNo && <Text type="danger" style={{ fontSize: 12 }}>{errors.companyPhoneNo.message}</Text>}
          </Flex>
        </Col>

      </Row>
    </Flex>
  );
}
