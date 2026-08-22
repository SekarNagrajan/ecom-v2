// Created by Antigravity (2026-08-22 10:15)
import { AppButton } from '@solverminds/shared-ui';
import { Card, Col, Input, Row, Select, Typography, theme, Checkbox, Radio, Divider } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBookingStore } from '../stores/booking.store';
import { ensSchema } from '../types/booking.types';
import { useEffect } from 'react';

const { Text, Title } = Typography;

export function ENSStep() {
  const { token } = theme.useToken();
  const { payload, updateEns, nextStep, prevStep } = useBookingStore();
  
  const { control, handleSubmit, watch, formState: { errors }, reset } = useForm<any>({
    resolver: zodResolver(ensSchema),
    defaultValues: payload.ens || {
      euCustomsZone: false,
      blType: 'Straight BL',
      ensFilingType: 'Single Filing',
      paymentMethod: 'Wire Transfer',
      declarantName: '',
      declarantAddress: '',
      declarantCity: '',
      declarantCountry: '',
      declarantEori: '',
      declarantEmail: '',
      buyerName: '',
      buyerAddress: '',
      buyerCity: '',
      buyerCountry: '',
      sellerName: '',
      sellerAddress: '',
      sellerCity: '',
      sellerCountry: '',
    },
  });

  const euCustomsZone = watch('euCustomsZone');

  useEffect(() => {
    if (payload.ens) reset(payload.ens);
  }, [payload.ens, reset]);

  const onSubmit = (data: any) => {
    updateEns(data);
    nextStep();
  };

  const labelStyle: React.CSSProperties = { fontWeight: 600, fontSize: 13, color: token.colorTextSecondary, marginBottom: 6, display: 'block' };

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
      <Card size="small" style={{ marginBottom: 24 }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={6}>
            <label style={labelStyle}>EU Customs Zone</label>
            <Controller control={control} name="euCustomsZone" render={({ field: { value, onChange, ...field } }) => (
              <Radio.Group {...field} value={value} onChange={e => onChange(e.target.value)}>
                <Radio value={true}>Yes</Radio>
                <Radio value={false}>No</Radio>
              </Radio.Group>
            )} />
          </Col>

          <Col xs={24} md={6}>
            <label style={labelStyle}>Type of BL</label>
            <Controller control={control} name="blType" render={({ field }) => (
              <Select {...field} options={[{value: 'Straight BL', label: 'Straight BL'}, {value: 'Master BL', label: 'Master BL'}]} style={{ width: '100%', height: 40 }} />
            )} />
          </Col>

          <Col xs={24} md={6}>
            <label style={labelStyle}>Type of ENS Filing</label>
            <Controller control={control} name="ensFilingType" render={({ field }) => (
              <Select {...field} options={[{value: 'Single Filing', label: 'Single Filing'}, {value: 'Multiple Filing', label: 'Multiple Filing'}]} style={{ width: '100%', height: 40 }} />
            )} />
          </Col>

          <Col xs={24} md={6}>
            <label style={labelStyle}>Method of Payment</label>
            <Controller control={control} name="paymentMethod" render={({ field }) => (
              <Select {...field} options={[{value: 'Wire Transfer', label: 'Wire Transfer'}, {value: 'Not Prepaid', label: 'Not Prepaid'}]} style={{ width: '100%', height: 40 }} />
            )} />
          </Col>
        </Row>
      </Card>

      {euCustomsZone && (
        <>
          {/* Declarant */}
          <Card size="small" title="Supplementary Declarant" style={{ marginBottom: 24 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <label style={labelStyle}>Name</label>
                <Controller control={control} name="declarantName" render={({ field }) => (
                  <Input {...field} size="large" />
                )} />
              </Col>
              <Col xs={24} md={16}>
                <label style={labelStyle}>Address</label>
                <Controller control={control} name="declarantAddress" render={({ field }) => (
                  <Input {...field} size="large" />
                )} />
              </Col>
              <Col xs={24} md={6}>
                <label style={labelStyle}>City</label>
                <Controller control={control} name="declarantCity" render={({ field }) => (
                  <Input {...field} size="large" />
                )} />
              </Col>
              <Col xs={24} md={6}>
                <label style={labelStyle}>Country</label>
                <Controller control={control} name="declarantCountry" render={({ field }) => (
                  <Input {...field} size="large" />
                )} />
              </Col>
              <Col xs={24} md={6}>
                <label style={labelStyle}>EORI</label>
                <Controller control={control} name="declarantEori" render={({ field }) => (
                  <Input {...field} size="large" />
                )} />
              </Col>
              <Col xs={24} md={6}>
                <label style={labelStyle}>Email</label>
                <Controller control={control} name="declarantEmail" render={({ field }) => (
                  <Input {...field} size="large" />
                )} />
              </Col>
            </Row>
          </Card>

          <Row gutter={24}>
            {/* Buyer */}
            <Col xs={24} md={12}>
              <Card size="small" title="Buyer Details">
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <label style={labelStyle}>Name</label>
                    <Controller control={control} name="buyerName" render={({ field }) => (
                      <Input {...field} size="large" />
                    )} />
                  </Col>
                  <Col span={24}>
                    <label style={labelStyle}>Address</label>
                    <Controller control={control} name="buyerAddress" render={({ field }) => (
                      <Input {...field} size="large" />
                    )} />
                  </Col>
                  <Col span={12}>
                    <label style={labelStyle}>City</label>
                    <Controller control={control} name="buyerCity" render={({ field }) => (
                      <Input {...field} size="large" />
                    )} />
                  </Col>
                  <Col span={12}>
                    <label style={labelStyle}>Country</label>
                    <Controller control={control} name="buyerCountry" render={({ field }) => (
                      <Input {...field} size="large" />
                    )} />
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Seller */}
            <Col xs={24} md={12}>
              <Card size="small" title="Seller Details">
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <label style={labelStyle}>Name</label>
                    <Controller control={control} name="sellerName" render={({ field }) => (
                      <Input {...field} size="large" />
                    )} />
                  </Col>
                  <Col span={24}>
                    <label style={labelStyle}>Address</label>
                    <Controller control={control} name="sellerAddress" render={({ field }) => (
                      <Input {...field} size="large" />
                    )} />
                  </Col>
                  <Col span={12}>
                    <label style={labelStyle}>City</label>
                    <Controller control={control} name="sellerCity" render={({ field }) => (
                      <Input {...field} size="large" />
                    )} />
                  </Col>
                  <Col span={12}>
                    <label style={labelStyle}>Country</label>
                    <Controller control={control} name="sellerCountry" render={({ field }) => (
                      <Input {...field} size="large" />
                    )} />
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
        <AppButton onClick={prevStep}>Previous</AppButton>
        <AppButton type="primary" htmlType="submit" style={{ marginLeft: 8 }}>Next</AppButton>
      </div>
    </form>
  );
}
