// Modified by Sekar Nagarajan (2026-08-26 11:10)
import { zodResolver } from '@hookform/resolvers/zod';
import { AppButton } from '@solverminds/shared-ui';
import { Card, Col, Input, Radio, Row, Select, Typography } from 'antd';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useBookingStore } from '../stores/booking.store';
import { ensSchema } from '../types/booking.types';

const { Text } = Typography;

export function ENSStep() {
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className="form-step-layout">
      <div className="custom-scroll form-step-scroll">
        <Card size="small" className="form-step-card form-step-section">
          <Row gutter={[24, 24]}>
            <Col xs={24} md={6}>
              <label className="form-field-label">EU Customs Zone</label>
              <Controller control={control} name="euCustomsZone" render={({ field: { value, onChange, ...field } }) => (
                <Radio.Group {...field} value={value} onChange={e => onChange(e.target.value)}>
                  <Radio value={true}>Yes</Radio>
                  <Radio value={false}>No</Radio>
                </Radio.Group>
              )} />
            </Col>

            <Col xs={24} md={6}>
              <label className="form-field-label">Type of BL</label>
              <Controller control={control} name="blType" render={({ field }) => (
                <Select {...field} size="large" options={[{ value: 'Straight BL', label: 'Straight BL' }, { value: 'Master BL', label: 'Master BL' }]}  className="form-field-full-width" />
              )} />
            </Col>

            <Col xs={24} md={6}>
              <label className="form-field-label">Type of ENS Filing</label>
              <Controller control={control} name="ensFilingType" render={({ field }) => (
                <Select {...field} size="large" options={[{ value: 'Single Filing', label: 'Single Filing' }, { value: 'Multiple Filing', label: 'Multiple Filing' }]}  className="form-field-full-width" />
              )} />
            </Col>

            <Col xs={24} md={6}>
              <label className="form-field-label">Method of Payment</label>
              <Controller control={control} name="paymentMethod" render={({ field }) => (
                <Select {...field} size="large" options={[{ value: 'Wire Transfer', label: 'Wire Transfer' }, { value: 'Not Prepaid', label: 'Not Prepaid' }]}  className="form-field-full-width" />
              )} />
            </Col>
          </Row>
        </Card>

        {euCustomsZone && (
          <>
            <Card size="small" title="Supplementary Declarant" className="form-step-card form-step-section">
              <Row gutter={[24, 24]}>
                <Col xs={24} md={8}>
                  <label className="form-field-label">Name</label>
                  <Controller control={control} name="declarantName" render={({ field }) => (
                    <Input {...field} size="large" />
                  )} />
                  {errors.declarantName && <Text type="danger" className="form-field-error">{errors.declarantName.message as string}</Text>}
                </Col>
                <Col xs={24} md={16}>
                  <label className="form-field-label">Address</label>
                  <Controller control={control} name="declarantAddress" render={({ field }) => (
                    <Input {...field} size="large" />
                  )} />
                </Col>
                <Col xs={24} md={6}>
                  <label className="form-field-label">City</label>
                  <Controller control={control} name="declarantCity" render={({ field }) => (
                    <Input {...field} size="large" />
                  )} />
                </Col>
                <Col xs={24} md={6}>
                  <label className="form-field-label">Country</label>
                  <Controller control={control} name="declarantCountry" render={({ field }) => (
                    <Input {...field} size="large" />
                  )} />
                </Col>
                <Col xs={24} md={6}>
                  <label className="form-field-label">EORI</label>
                  <Controller control={control} name="declarantEori" render={({ field }) => (
                    <Input {...field} size="large" />
                  )} />
                </Col>
                <Col xs={24} md={6}>
                  <label className="form-field-label">Email</label>
                  <Controller control={control} name="declarantEmail" render={({ field }) => (
                    <Input {...field} size="large" />
                  )} />
                </Col>
              </Row>
            </Card>

            <Row gutter={[24, 24]} className="form-step-card form-step-section">
              <Col xs={24} md={12}>
                <Card size="small" title="Buyer Details" className="form-step-card">
                  <Row gutter={[24, 24]}>
                    <Col span={24}>
                      <label className="form-field-label">Name</label>
                      <Controller control={control} name="buyerName" render={({ field }) => (
                        <Input {...field} size="large" />
                      )} />
                    </Col>
                    <Col span={24}>
                      <label className="form-field-label">Address</label>
                      <Controller control={control} name="buyerAddress" render={({ field }) => (
                        <Input {...field} size="large" />
                      )} />
                    </Col>
                    <Col span={12}>
                      <label className="form-field-label">City</label>
                      <Controller control={control} name="buyerCity" render={({ field }) => (
                        <Input {...field} size="large" />
                      )} />
                    </Col>
                    <Col span={12}>
                      <label className="form-field-label">Country</label>
                      <Controller control={control} name="buyerCountry" render={({ field }) => (
                        <Input {...field} size="large" />
                      )} />
                    </Col>
                  </Row>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card size="small" title="Seller Details" className="form-step-card">
                  <Row gutter={[24, 24]}>
                    <Col span={24}>
                      <label className="form-field-label">Name</label>
                      <Controller control={control} name="sellerName" render={({ field }) => (
                        <Input {...field} size="large" />
                      )} />
                    </Col>
                    <Col span={24}>
                      <label className="form-field-label">Address</label>
                      <Controller control={control} name="sellerAddress" render={({ field }) => (
                        <Input {...field} size="large" />
                      )} />
                    </Col>
                    <Col span={12}>
                      <label className="form-field-label">City</label>
                      <Controller control={control} name="sellerCity" render={({ field }) => (
                        <Input {...field} size="large" />
                      )} />
                    </Col>
                    <Col span={12}>
                      <label className="form-field-label">Country</label>
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
      </div>

      <div className="form-step-footer">
        <AppButton onClick={prevStep}>Previous</AppButton>
        <AppButton type="primary" htmlType="submit">Next</AppButton>
        <AppButton type="link" onClick={() => nextStep()}>Skip</AppButton>
      </div>
    </form>
  );
}
