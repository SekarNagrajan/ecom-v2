// Created by Antigravity (2026-08-22 10:20)
import { AppButton } from '@solverminds/shared-ui';
import { Card, Col, InputNumber, Row, Select, Typography, theme, Checkbox, Radio, Alert } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBookingStore } from '../stores/booking.store';
import { insuranceSchema } from '../types/booking.types';
import { useEffect } from 'react';

const { Text } = Typography;

export function InsuranceStep() {
  const { token } = theme.useToken();
  const { payload, updateInsurance, nextStep, prevStep } = useBookingStore();
  
  const { control, handleSubmit, watch, formState: { errors }, reset } = useForm<any>({
    resolver: zodResolver(insuranceSchema),
    defaultValues: payload.insurance || {
      isInsuranceRequired: false,
      currency: 'USD',
      cargoValue: undefined,
      termsAccepted: false,
    },
  });

  const isInsuranceRequired = watch('isInsuranceRequired');

  useEffect(() => {
    if (payload.insurance) reset(payload.insurance);
  }, [payload.insurance, reset]);

  const onSubmit = (data: any) => {
    updateInsurance(data);
    nextStep();
  };

  const labelStyle: React.CSSProperties = { fontWeight: 600, fontSize: 13, color: token.colorTextSecondary, marginBottom: 6, display: 'block' };

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
      <Card size="small" style={{ marginBottom: 24 }}>
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <label style={labelStyle}>Do you require Cargo Insurance?</label>
            <Controller control={control} name="isInsuranceRequired" render={({ field: { value, onChange, ...field } }) => (
              <Radio.Group {...field} value={value} onChange={e => onChange(e.target.value)}>
                <Radio value={true}>Yes</Radio>
                <Radio value={false}>No</Radio>
              </Radio.Group>
            )} />
          </Col>
        </Row>
      </Card>

      {isInsuranceRequired && (
        <Card size="small" title="Insurance Details" style={{ marginBottom: 24 }}>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <label style={labelStyle}>Currency <Text type="danger">*</Text></label>
              <Controller control={control} name="currency" render={({ field }) => (
                <Select {...field} options={[{value: 'USD', label: 'USD'}, {value: 'EUR', label: 'EUR'}]} style={{ width: '100%', height: 40 }} />
              )} />
              {errors.currency && <Text type="danger" style={{ fontSize: 12, marginTop: 4 }}>{errors.currency.message as string}</Text>}
            </Col>

            <Col xs={24} md={12}>
              <label style={labelStyle}>Cargo Value <Text type="danger">*</Text></label>
              <Controller control={control} name="cargoValue" render={({ field }) => (
                <InputNumber {...field} style={{ width: '100%', height: 40 }} size="large" min={1} />
              )} />
              {errors.cargoValue && <Text type="danger" style={{ fontSize: 12, marginTop: 4 }}>{errors.cargoValue.message as string}</Text>}
            </Col>

            <Col span={24}>
              <Alert 
                message="Insurance Terms & Conditions" 
                description="By requesting cargo insurance, you agree to the carrier's standard terms and conditions of insurance which will be applied to your final booking confirmation. The premium will be added to your freight invoice." 
                type="info" 
                showIcon 
                style={{ marginBottom: 16 }}
              />
              <Controller control={control} name="termsAccepted" render={({ field: { value, onChange, ...field } }) => (
                <Checkbox {...field} checked={value} onChange={e => onChange(e.target.checked)}>
                  I accept the Insurance Terms and Conditions <Text type="danger">*</Text>
                </Checkbox>
              )} />
              {errors.termsAccepted && <div style={{ marginTop: 4 }}><Text type="danger" style={{ fontSize: 12 }}>{errors.termsAccepted.message as string}</Text></div>}
            </Col>
          </Row>
        </Card>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
        <AppButton onClick={prevStep}>Previous</AppButton>
        <AppButton type="primary" htmlType="submit" style={{ marginLeft: 8 }}>Next</AppButton>
      </div>
    </form>
  );
}
