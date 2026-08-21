// Modified by sekar nagarajan (2026-08-21)
import { SearchOutlined } from '@ant-design/icons';
import { Button, Input, theme } from 'antd';
import { Controller, type UseFormReturn } from 'react-hook-form';

import type { TrackingSearchForm } from '../types/landing.types';
import { ImageCaptcha } from './ImageCaptcha';

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
  const { control, formState: { errors } } = form;

  const inputStyle = {
    height: 44,
    borderRadius: token.borderRadius,
    fontSize: 15,
  };

  const labelStyle = { fontWeight: 600, color: '#555', marginBottom: 6, display: 'inline-block' };
  const asteriskStyle = { color: token.colorError };

  return (
    <form
      id="tracking-search-form"
      onSubmit={onSubmit}
      style={{ width: '100%' }}
    >
      <div style={{ marginBottom: 24 }}>
        <div style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
          <label style={labelStyle}>BL / Booking / Container Number <span style={asteriskStyle}>*</span></label>
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
                status={errors.trackingNumber ? 'error' : undefined}
                prefix={<SearchOutlined style={{ color: '#888', marginRight: 8, fontSize: 16 }} />}
                onChange={(e) => {
                  form.setValue('trackingNumber', e.target.value.toUpperCase());
                }}
              />
            )}
          />
          {errors.trackingNumber && (
            <div style={{ color: token.colorError, fontSize: 13, marginTop: 4 }}>
              {errors.trackingNumber.message}
            </div>
          )}
        </div>
      </div>

      {showImageCaptcha && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
            <label style={labelStyle}>Security Verification</label>
            <ImageCaptcha
              control={control}
              name="captcha"
              errorMessage={errors.captcha?.message}
            />
          </div>
        </div>
      )}

      <Button
        htmlType="submit"
        id="tracking-search-btn"
        type="primary"
        icon={<SearchOutlined />}
        style={{
          width: '100%',
          height: 44,
          borderRadius: token.borderRadius,
          fontWeight: 600,
          fontSize: 16,
          background: token.colorPrimary,
          boxShadow: `0 4px 12px ${token.colorPrimary}40`
        }}
      >
        Track shipment
      </Button>
    </form>
  );
}
