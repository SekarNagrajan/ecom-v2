// Modified by Antigravity (2026-08-21)
import { Controller } from 'react-hook-form';
import { Flex, Input, Select, Typography, Descriptions, theme } from 'antd';
import type { useContactUsController } from '../hooks/use-contact-us-controller';

const { Text } = Typography;
const { TextArea } = Input;

interface ContactUsFormProps {
  controller: ReturnType<typeof useContactUsController>;
}

/**
 * ContactUsForm — renders the form body.
 *
 * Two modes (parity with legacy ContactUs.jsp):
 * 1. **Authenticated**: Profile fields shown as read-only labels, only Subject + Message editable.
 * 2. **Guest**: All fields editable with full validation.
 */
export function ContactUsForm({ controller }: ContactUsFormProps) {
  const { token } = theme.useToken();
  const {
    form,
    isAuthenticated,
    user,
    countries,
    countriesLoading,
    states,
    statesLoading,
  } = controller;
  const { control, formState: { errors } } = form;

  const fieldStyle: React.CSSProperties = {
    borderRadius: 8,
  };

  const labelStyle: React.CSSProperties = {
    fontWeight: 600,
    fontSize: 13,
    color: token.colorTextSecondary,
    marginBottom: 6,
    display: 'block',
  };

  return (
    <Flex vertical gap={20}>
      {/* ── Profile info (read-only for authenticated users) ───────── */}
      {isAuthenticated && user ? (
        <Descriptions
          bordered
          size="small"
          column={2}
          labelStyle={{ fontWeight: 600, width: 160, background: token.colorBgLayout }}
          contentStyle={{ background: '#fff' }}
          style={{ marginBottom: 8 }}
        >
          <Descriptions.Item label="Name">{user.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="Company">{user.company || '-'}</Descriptions.Item>
          <Descriptions.Item label="Email">{user.email || '-'}</Descriptions.Item>
          <Descriptions.Item label="Role">{user.role || '-'}</Descriptions.Item>
        </Descriptions>
      ) : (
        <>
          {/* ── Guest editable fields ───────────────────────────────── */}
          <Flex gap={16}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>
                Name <Text type="danger">*</Text>
              </label>
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="contact-name"
                    size="large"
                    placeholder="Enter your name"
                    maxLength={100}
                    style={fieldStyle}
                  />
                )}
              />
              {errors.name && (
                <Text type="danger" style={{ fontSize: 12, marginTop: 2 }}>
                  {errors.name.message}
                </Text>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>
                Company Name <Text type="danger">*</Text>
              </label>
              <Controller
                control={control}
                name="companyName"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="contact-company"
                    size="large"
                    placeholder="Enter company name"
                    maxLength={50}
                    style={fieldStyle}
                  />
                )}
              />
              {errors.companyName && (
                <Text type="danger" style={{ fontSize: 12, marginTop: 2 }}>
                  {errors.companyName.message}
                </Text>
              )}
            </div>
          </Flex>

          <Flex gap={16}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>
                Country <Text type="danger">*</Text>
              </label>
              <Controller
                control={control}
                name="country"
                render={({ field }) => (
                  <Select
                    {...field}
                    value={field.value || undefined}
                    id="contact-country"
                    placeholder="Select Country"
                    loading={countriesLoading}
                    showSearch
                    size="large"
                    optionFilterProp="label"
                    options={countries.map((c) => ({ value: c.code, label: c.name }))}
                    style={{ ...fieldStyle, width: '100%' }}
                    onChange={(val) => {
                      field.onChange(val);
                      // Reset state when country changes (legacy cascade behavior)
                      form.setValue('state', '');
                    }}
                  />
                )}
              />
              {errors.country && (
                <Text type="danger" style={{ fontSize: 12, marginTop: 2 }}>
                  {errors.country.message}
                </Text>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>State</label>
              <Controller
                control={control}
                name="state"
                render={({ field }) => (
                  <Select
                    {...field}
                    value={field.value || undefined}
                    id="contact-state"
                    placeholder="Select State"
                    loading={statesLoading}
                    showSearch
                    size="large"
                    optionFilterProp="label"
                    options={states.map((s) => ({ value: s.code, label: s.name }))}
                    style={{ ...fieldStyle, width: '100%' }}
                    allowClear
                    disabled={!form.watch('country')}
                  />
                )}
              />
            </div>
          </Flex>

          <div>
            <label style={labelStyle}>
              City <Text type="danger">*</Text>
            </label>
            <Controller
              control={control}
              name="city"
              render={({ field }) => (
                <Input
                  {...field}
                  id="contact-city"
                  size="large"
                  placeholder="Enter city"
                  maxLength={150}
                  style={fieldStyle}
                />
              )}
            />
            {errors.city && (
              <Text type="danger" style={{ fontSize: 12, marginTop: 2 }}>
                {errors.city.message}
              </Text>
            )}
          </div>

          <Flex gap={16}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Phone</label>
              <Controller
                control={control}
                name="phone"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="contact-phone"
                    size="large"
                    placeholder="Enter phone number"
                    maxLength={15}
                    style={fieldStyle}
                  />
                )}
              />
              {errors.phone && (
                <Text type="danger" style={{ fontSize: 12, marginTop: 2 }}>
                  {errors.phone.message}
                </Text>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Mobile</label>
              <Controller
                control={control}
                name="mobile"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="contact-mobile"
                    size="large"
                    placeholder="Enter mobile number"
                    maxLength={11}
                    style={fieldStyle}
                  />
                )}
              />
              {errors.mobile && (
                <Text type="danger" style={{ fontSize: 12, marginTop: 2 }}>
                  {errors.mobile.message}
                </Text>
              )}
            </div>
          </Flex>

          <div>
            <label style={labelStyle}>
              Email <Text type="danger">*</Text>
            </label>
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <Input
                  {...field}
                  id="contact-email"
                  size="large"
                  placeholder="Enter email address"
                  maxLength={300}
                  style={fieldStyle}
                />
              )}
            />
            {errors.email && (
              <Text type="danger" style={{ fontSize: 12, marginTop: 2 }}>
                {errors.email.message}
              </Text>
            )}
          </div>
        </>
      )}

      {/* ── Subject & Message (always editable) ───────────────────── */}
      <div>
        <label style={labelStyle}>
          Subject <Text type="danger">*</Text>
        </label>
        <Controller
          control={control}
          name="subject"
          render={({ field }) => (
            <Input
              {...field}
              id="contact-subject"
              size="large"
              placeholder="Enter subject"
              maxLength={100}
              style={fieldStyle}
            />
          )}
        />
        {errors.subject && (
          <Text type="danger" style={{ fontSize: 12, marginTop: 2 }}>
            {errors.subject.message}
          </Text>
        )}
      </div>

      <div>
        <label style={labelStyle}>
          Message <Text type="danger">*</Text>
        </label>
        <Controller
          control={control}
          name="message"
          render={({ field }) => (
            <TextArea
              {...field}
              id="contact-message"
              placeholder="Type your message here..."
              maxLength={5000}
              rows={5}
              showCount
              style={{ borderRadius: 8, resize: 'none' }}
            />
          )}
        />
        {errors.message && (
          <Text type="danger" style={{ fontSize: 12, marginTop: 2 }}>
            {errors.message.message}
          </Text>
        )}
      </div>
    </Flex>
  );
}
