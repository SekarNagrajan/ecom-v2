// Created by Antigravity (2026-08-22 09:50)
import { zodResolver } from '@hookform/resolvers/zod';
import { AppButton } from '@solverminds/shared-ui';
import { Col, Input, Row, Typography, theme } from 'antd';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useBookingStore } from '../stores/booking.store';
import { partiesSchema, type PartiesData } from '../types/booking.types';

const { Text } = Typography;

export function CustomerDetailsStep() {
  const { token } = theme.useToken();
  const { payload, updateParties, nextStep, prevStep } = useBookingStore();

  const { control, handleSubmit, formState: { errors }, reset } = useForm<PartiesData>({
    resolver: zodResolver(partiesSchema),
    defaultValues: payload.parties || {
      shipperName: '',
      shipperReference: '',
      consigneeName: '',
      notifyPartyName: '',
      freightForwarder: '',
      agreementParty: '',
      siSubmittingParty: '',
    },
  });

  useEffect(() => {
    if (payload.parties) reset(payload.parties);
  }, [payload.parties, reset]);

  const onSubmit = (data: PartiesData) => {
    updateParties(data);
    nextStep();
  };

  const labelStyle: React.CSSProperties = { fontWeight: 600, fontSize: 13, color: token.colorTextSecondary, marginBottom: 6, display: 'block' };

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px 24px' }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <label style={labelStyle}>Shipper Name <Text type="danger">*</Text></label>
          <Controller control={control} name="shipperName" render={({ field }) => (
            <Input {...field} placeholder="Enter Shipper Name" size="large" />
          )} />
          {errors.shipperName && <Text type="danger" style={{ fontSize: 12, marginTop: 4 }}>{errors.shipperName.message}</Text>}
        </Col>

        <Col xs={24} md={12}>
          <label style={labelStyle}>Shipper Reference</label>
          <Controller control={control} name="shipperReference" render={({ field }) => (
            <Input {...field} placeholder="Optional Reference" size="large" />
          )} />
        </Col>

        <Col xs={24} md={12}>
          <label style={labelStyle}>Consignee Name <Text type="danger">*</Text></label>
          <Controller control={control} name="consigneeName" render={({ field }) => (
            <Input {...field} placeholder="Enter Consignee Name" size="large" />
          )} />
          {errors.consigneeName && <Text type="danger" style={{ fontSize: 12, marginTop: 4 }}>{errors.consigneeName.message}</Text>}
        </Col>

        <Col xs={24} md={12}>
          <label style={labelStyle}>Notify Party</label>
          <Controller control={control} name="notifyPartyName" render={({ field }) => (
            <Input {...field} placeholder="Enter Notify Party Name" size="large" />
          )} />
        </Col>

        <Col xs={24} md={12}>
          <label style={labelStyle}>Freight Forwarder</label>
          <Controller control={control} name="freightForwarder" render={({ field }) => (
            <Input {...field} placeholder="Enter Freight Forwarder Name" size="large" />
          )} />
        </Col>

        <Col xs={24} md={12}>
          <label style={labelStyle}>Agreement Party <Text type="danger">*</Text></label>
          <Controller control={control} name="agreementParty" render={({ field }) => (
            <Input {...field} placeholder="Enter Agreement Party" size="large" />
          )} />
          {errors.agreementParty && <Text type="danger" style={{ fontSize: 12, marginTop: 4 }}>{errors.agreementParty.message}</Text>}
        </Col>

        <Col xs={24} md={12}>
          <label style={labelStyle}>Delegated SI Submitting Party <Text type="danger">*</Text></label>
          <Controller control={control} name="siSubmittingParty" render={({ field }) => (
            <Input {...field} placeholder="Enter Submitting Party" size="large" />
          )} />
          {errors.siSubmittingParty && <Text type="danger" style={{ fontSize: 12, marginTop: 4 }}>{errors.siSubmittingParty.message}</Text>}
        </Col>
      </Row>
      </div>

      <div style={{ flexShrink: 0, padding: '16px 24px', borderTop: `1px solid ${token.colorBorderSecondary}`, display: 'flex', justifyContent: 'flex-end', backgroundColor: token.colorBgContainer }}>
        <AppButton onClick={prevStep}>Previous</AppButton>
        <AppButton type="primary" htmlType="submit" style={{ marginLeft: 8 }}>Next</AppButton>
      </div>
    </form>
  );
}
