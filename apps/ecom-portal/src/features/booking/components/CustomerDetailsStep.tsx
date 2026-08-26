// Modified by Sekar Nagarajan (2026-08-24 18:24)
import { zodResolver } from '@hookform/resolvers/zod';
import { AppButton } from '@solverminds/shared-ui';
import { Card, Col, Input, Row, Typography } from 'antd';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useBookingStore } from '../stores/booking.store';
import { partiesSchema, type PartiesData } from '../types/booking.types';

const { Text } = Typography;

export function CustomerDetailsStep() {
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className="form-step-layout">
      <div className="custom-scroll form-step-scroll">
        <Card className="form-step-card form-step-section">
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <div className="form-field-cell">
                <label className="form-field-label">Shipper Name <Text type="danger">*</Text></label>
                <Controller control={control} name="shipperName" render={({ field }) => (
                  <Input {...field} placeholder="Enter Shipper Name" size="large" />
                )} />
                {errors.shipperName && <Text type="danger" className="form-field-error">{errors.shipperName.message}</Text>}
              </div>
            </Col>

            <Col xs={24} md={12}>
              <div className="form-field-cell">
                <label className="form-field-label">Shipper Reference</label>
                <Controller control={control} name="shipperReference" render={({ field }) => (
                  <Input {...field} placeholder="Optional Reference" size="large" />
                )} />
              </div>
            </Col>

            <Col xs={24} md={12}>
              <div className="form-field-cell">
                <label className="form-field-label">Consignee Name <Text type="danger">*</Text></label>
                <Controller control={control} name="consigneeName" render={({ field }) => (
                  <Input {...field} placeholder="Enter Consignee Name" size="large" />
                )} />
                {errors.consigneeName && <Text type="danger" className="form-field-error">{errors.consigneeName.message}</Text>}
              </div>
            </Col>

            <Col xs={24} md={12}>
              <div className="form-field-cell">
                <label className="form-field-label">Notify Party</label>
                <Controller control={control} name="notifyPartyName" render={({ field }) => (
                  <Input {...field} placeholder="Enter Notify Party Name" size="large" />
                )} />
              </div>
            </Col>

            <Col xs={24} md={12}>
              <div className="form-field-cell">
                <label className="form-field-label">Freight Forwarder</label>
                <Controller control={control} name="freightForwarder" render={({ field }) => (
                  <Input {...field} placeholder="Enter Freight Forwarder Name" size="large" />
                )} />
              </div>
            </Col>

            <Col xs={24} md={12}>
              <div className="form-field-cell">
                <label className="form-field-label">Agreement Party <Text type="danger">*</Text></label>
                <Controller control={control} name="agreementParty" render={({ field }) => (
                  <Input {...field} placeholder="Enter Agreement Party" size="large" />
                )} />
                {errors.agreementParty && <Text type="danger" className="form-field-error">{errors.agreementParty.message}</Text>}
              </div>
            </Col>

            <Col xs={24} md={12}>
              <div className="form-field-cell">
                <label className="form-field-label">Delegated SI Submitting Party <Text type="danger">*</Text></label>
                <Controller control={control} name="siSubmittingParty" render={({ field }) => (
                  <Input {...field} placeholder="Enter Submitting Party" size="large" />
                )} />
                {errors.siSubmittingParty && <Text type="danger" className="form-field-error">{errors.siSubmittingParty.message}</Text>}
              </div>
            </Col>
          </Row>
        </Card>
      </div>

      <div className="form-step-footer">
        <AppButton onClick={prevStep}>Previous</AppButton>
        <AppButton type="primary" htmlType="submit">Next</AppButton>
      </div>
    </form>
  );
}
