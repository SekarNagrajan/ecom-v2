import { Col, Flex, Row, Typography, Input, Select } from 'antd';
import { Controller, useFormContext } from 'react-hook-form';
import { useState } from 'react';
import { RegistrationFormData } from '../types/registration.schema';
import { checkEmail } from '../api/registration.api';

const { Text } = Typography;

export function UserInfoStep() {
  const { control, setError, clearErrors, formState: { errors } } = useFormContext<RegistrationFormData>();
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const handleEmailBlur = async (email: string) => {
    if (!email || errors.email) return;
    setIsCheckingEmail(true);
    try {
      const data = await checkEmail(email);
      if (!data.available) {
        setError('email', { type: 'manual', message: 'This email is already registered.' });
      } else {
        clearErrors('email');
      }
    } catch (e) {
      setError('email', { type: 'manual', message: 'Failed to verify email.' });
    } finally {
      setIsCheckingEmail(false);
    }
  };

  return (
    <Flex vertical gap={24} style={{ padding: '24px 0' }}>
      <Row gutter={[24, 24]}>
        
        <Col span={12}>
          <Flex vertical gap={8}>
            <Text strong>First Name <span style={{ color: 'red' }}>*</span></Text>
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <div>
                  <Input
                    {...field}
                    size="large"
                    placeholder="First Name"
                    status={errors.firstName ? 'error' : undefined}
                  />
                  {errors.firstName && <Text type="danger" style={{ fontSize: 12 }}>{errors.firstName.message}</Text>}
                </div>
              )}
            />
          </Flex>
        </Col>
        
        <Col span={12}>
          <Flex vertical gap={8}>
            <Text strong>Last Name <span style={{ color: 'red' }}>*</span></Text>
            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <div>
                  <Input
                    {...field}
                    size="large"
                    placeholder="Last Name"
                    status={errors.lastName ? 'error' : undefined}
                  />
                  {errors.lastName && <Text type="danger" style={{ fontSize: 12 }}>{errors.lastName.message}</Text>}
                </div>
              )}
            />
          </Flex>
        </Col>

        <Col span={24}>
          <Flex vertical gap={8}>
            <Text strong>Gender <span style={{ color: 'red' }}>*</span></Text>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <div>
                  <Select
                    {...field}
                    value={field.value || undefined}
                    size="large"
                    placeholder="Gender"
                    status={errors.title ? 'error' : undefined}
                    style={{ width: '100%' }}
                    options={[
                      { value: 'Mr.', label: 'Mr.' },
                      { value: 'Mrs.', label: 'Mrs.' },
                      { value: 'Ms.', label: 'Ms.' },
                      { value: 'Dr.', label: 'Dr.' },
                    ]}
                  />
                  {errors.title && <Text type="danger" style={{ fontSize: 12 }}>{errors.title.message}</Text>}
                </div>
              )}
            />
          </Flex>
        </Col>

        <Col span={24}>
          <Flex vertical gap={8}>
            <Text strong>Email Id <span style={{ color: 'red' }}>*</span></Text>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <div>
                  <Input
                    {...field}
                    type="email"
                    size="large"
                    placeholder="Email Id"
                    status={errors.email ? 'error' : undefined}
                    onBlur={(e) => {
                      field.onBlur();
                      handleEmailBlur(e.target.value);
                    }}
                    disabled={isCheckingEmail}
                  />
                  {errors.email && <Text type="danger" style={{ fontSize: 12 }}>{errors.email.message}</Text>}
                </div>
              )}
            />
          </Flex>
        </Col>

        <Col span={12}>
          <Flex vertical gap={8}>
            <Text strong>Password <span style={{ color: 'red' }}>*</span></Text>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <div>
                  <Input.Password
                    {...field}
                    size="large"
                    placeholder="Password"
                    status={errors.password ? 'error' : undefined}
                  />
                  {errors.password && <Text type="danger" style={{ fontSize: 12 }}>{errors.password.message}</Text>}
                </div>
              )}
            />
          </Flex>
        </Col>
        
        <Col span={12}>
          <Flex vertical gap={8}>
            <Text strong>Confirm Password <span style={{ color: 'red' }}>*</span></Text>
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <div>
                  <Input.Password
                    {...field}
                    size="large"
                    placeholder="Confirm Password"
                    status={errors.confirmPassword ? 'error' : undefined}
                  />
                  {errors.confirmPassword && <Text type="danger" style={{ fontSize: 12 }}>{errors.confirmPassword.message}</Text>}
                </div>
              )}
            />
          </Flex>
        </Col>

        <Col span={24}>
          <Flex vertical gap={8}>
            <Text strong>Timezone <span style={{ color: 'red' }}>*</span></Text>
            <Controller
              name="timezone"
              control={control}
              render={({ field }) => (
                <div>
                  <Select
                    {...field}
                    value={field.value || undefined}
                    size="large"
                    placeholder="Timezone"
                    status={errors.timezone ? 'error' : undefined}
                    style={{ width: '100%' }}
                    options={[
                      { value: 'GMT', label: 'GMT - Greenwich Mean Time' },
                      { value: 'UTC', label: 'UTC - Universal Time Coordinated' },
                      { value: 'EST', label: 'EST - Eastern Standard Time' },
                      { value: 'PST', label: 'PST - Pacific Standard Time' },
                      { value: 'IST', label: 'IST - Indian Standard Time' },
                    ]}
                  />
                  {errors.timezone && <Text type="danger" style={{ fontSize: 12 }}>{errors.timezone.message}</Text>}
                </div>
              )}
            />
          </Flex>
        </Col>

        <Col span={12}>
          <Flex vertical gap={8}>
            <Text strong>Default View</Text>
            <Controller
              name="defaultView"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  value={field.value || undefined}
                  size="large"
                  placeholder="Default View"
                  style={{ width: '100%' }}
                  options={[
                    { value: 'STANDARD', label: 'Standard' },
                    { value: 'COMPACT', label: 'Compact' },
                    { value: 'DETAILED', label: 'Detailed' },
                  ]}
                />
              )}
            />
          </Flex>
        </Col>

        <Col span={12}>
          <Flex vertical gap={8}>
            <Text strong>Preferred View</Text>
            <Controller
              name="preferredView"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  value={field.value || undefined}
                  size="large"
                  placeholder="Preferred View"
                  style={{ width: '100%' }}
                  options={[
                    { value: 'HOME', label: 'Home Page' },
                    { value: 'DASHBOARD', label: 'Dashboard' },
                    { value: 'TRACKING', label: 'Tracking' },
                  ]}
                />
              )}
            />
          </Flex>
        </Col>

      </Row>
    </Flex>
  );
}
