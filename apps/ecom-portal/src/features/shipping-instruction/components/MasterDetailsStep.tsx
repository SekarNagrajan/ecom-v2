// Created by Antigravity (2026-08-24 11:30)
import { AppButton } from '@solverminds/shared-ui';
import { Card, Col, Row, Typography, theme, Select } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import type { SIDTO } from '../types/si.types';

const { Text } = Typography;

export function MasterDetailsStep({ 
  data, 
  onNext, 
  onPrevious, 
  isFirstStep,
  isSubmitting 
}: { 
  data: SIDTO;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
}) {
  const { token } = theme.useToken();
  const { control, handleSubmit } = useForm({
    defaultValues: {
      blType: data.blType,
      releaseType: data.releaseType,
      freightOption: data.freightOption,
    }
  });

  const onSubmit = (formData: any) => {
    console.log('Saved data:', formData);
    onNext();
  };

  const labelStyle: React.CSSProperties = { fontWeight: 600, fontSize: 13, color: token.colorTextSecondary, marginBottom: 6, display: 'block' };

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <Card style={{ border: `1px solid ${token.colorBorderSecondary}`, borderRadius: 8 }}>
          <Row gutter={[24, 24]}>
            <Col span={12}>
              <label style={labelStyle}>Booking Number</label>
              <div style={{ fontSize: 16, fontWeight: 500, marginTop: 4 }}>{data.bookingNo}</div>
            </Col>
            
            <Col span={12}>
              <label style={labelStyle}>SI Number</label>
              <div style={{ fontSize: 16, fontWeight: 500, marginTop: 4 }}>{data.siNo || 'Draft'}</div>
            </Col>

            <Col xs={24} md={8}>
              <label style={labelStyle}>B/L Type <Text type="danger">*</Text></label>
              <Controller control={control} name="blType" render={({ field }) => (
                <Select {...field} size="large" style={{ width: '100%' }} options={[
                  { label: 'Original', value: 'Original' },
                  { label: 'Seaway', value: 'Seaway' }
                ]} />
              )} />
            </Col>

            <Col xs={24} md={8}>
              <label style={labelStyle}>Release Type <Text type="danger">*</Text></label>
              <Controller control={control} name="releaseType" render={({ field }) => (
                <Select {...field} size="large" style={{ width: '100%' }} options={[
                  { label: 'Original', value: 'O' },
                  { label: 'Telex', value: 'T' }
                ]} />
              )} />
            </Col>

            <Col xs={24} md={8}>
              <label style={labelStyle}>Freight Option <Text type="danger">*</Text></label>
              <Controller control={control} name="freightOption" render={({ field }) => (
                <Select {...field} size="large" style={{ width: '100%' }} options={[
                  { label: 'PREPAID', value: 'PREPAID' },
                  { label: 'COLLECT', value: 'COLLECT' }
                ]} />
              )} />
            </Col>
          </Row>
        </Card>
      </div>

      <div style={{ flexShrink: 0, padding: '16px 24px', borderTop: `1px solid ${token.colorBorderSecondary}`, display: 'flex', justifyContent: 'space-between', backgroundColor: token.colorBgContainer }}>
        <AppButton onClick={onPrevious} disabled={isFirstStep || isSubmitting}>Previous</AppButton>
        <AppButton type="primary" htmlType="submit" disabled={isSubmitting}>Next</AppButton>
      </div>
    </form>
  );
}
