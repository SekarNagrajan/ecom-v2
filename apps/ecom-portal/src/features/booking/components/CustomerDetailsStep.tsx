// Created by Antigravity (2026-08-22 09:50)
import { AppButton } from '@solverminds/shared-ui';
import { Col, Input, Row, Typography, theme } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBookingStore } from '../stores/booking.store';
import { partiesSchema, type PartiesData } from '../types/booking.types';
import { useEffect } from 'react';

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
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
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

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
        <AppButton onClick={prevStep}>Previous</AppButton>
        <AppButton type="primary" htmlType="submit" style={{ marginLeft: 8 }}>Next</AppButton>
      </div>
    </form>
  );
}
