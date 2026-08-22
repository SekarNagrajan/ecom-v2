// Created by Antigravity (2026-08-22 10:15)
import { AppButton } from '@solverminds/shared-ui';
import { Card, Col, DatePicker, Input, Row, Select, Segmented, Typography, theme } from 'antd';
import dayjs from 'dayjs';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBookingStore } from '../stores/booking.store';
import { masterDetailsSchema, type MasterDetailsData } from '../types/booking.types';
import { useEffect, useState } from 'react';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';

const { Text } = Typography;

export function MasterDetailsStep() {
  const { token } = theme.useToken();
  const { payload, updateMasterDetails, nextStep } = useBookingStore();
  const [showAdditional, setShowAdditional] = useState(false);
  
  const { control, handleSubmit, formState: { errors }, reset } = useForm<any>({
    resolver: zodResolver(masterDetailsSchema),
    defaultValues: payload.masterDetails || {
      origin: '',
      delivery: '',
      cargoReadyDate: '',
      haulageOriginType: 'Merchant',
      haulageDestinationType: 'Merchant',
      carriageContract: '',
      onlineBookingNo: '',
      agreementParty: '',
      preferredAgency: '',
      additionalInformation: '',
    },
  });

  useEffect(() => {
    if (payload.masterDetails) {
      reset(payload.masterDetails);
    }
  }, [payload.masterDetails, reset]);

  const onSubmit = (data: MasterDetailsData) => {
    updateMasterDetails(data);
    nextStep();
  };

  const labelStyle: React.CSSProperties = { fontWeight: 600, fontSize: 13, color: token.colorTextSecondary, marginBottom: 6, display: 'block' };

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
      <Card
        style={{ border: `1px solid ${token.colorBorderSecondary}`, borderRadius: 8 }}
        title={<div style={{ textAlign: 'right' }}><AppButton type="primary" style={{ background: '#faad14' }}>Select Template</AppButton></div>}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <label style={labelStyle}>Origin <Text type="danger">*</Text></label>
            <Controller control={control} name="origin" render={({ field }) => (
              <Input {...field} placeholder="Place of Origin" size="large" />
            )} />
            {errors.origin && <Text type="danger" style={{ fontSize: 12, marginTop: 4 }}>{errors.origin.message as string}</Text>}
          </Col>

          <Col xs={24} md={8}>
            <label style={labelStyle}>Delivery <Text type="danger">*</Text></label>
            <Controller control={control} name="delivery" render={({ field }) => (
              <Input {...field} placeholder="Place of Delivery" size="large" />
            )} />
            {errors.delivery && <Text type="danger" style={{ fontSize: 12, marginTop: 4 }}>{errors.delivery.message as string}</Text>}
          </Col>

          <Col xs={24} md={8}>
            <label style={labelStyle}>Cargo Ready Date <Text type="danger">*</Text></label>
            <Controller control={control} name="cargoReadyDate" render={({ field: { value, onChange } }) => (
              <DatePicker 
                style={{ width: '100%', height: 40 }} 
                format="DD-MMM-YYYY"
                value={value ? dayjs(value) : null}
                onChange={(date) => onChange(date ? date.format('YYYY-MM-DD') : '')}
              />
            )} />
            {errors.cargoReadyDate && <Text type="danger" style={{ fontSize: 12, marginTop: 4 }}>{errors.cargoReadyDate.message as string}</Text>}
          </Col>

          <Col xs={24} md={8}>
            <label style={labelStyle}>Haulage Origin</label>
            <Controller control={control} name="haulageOriginType" render={({ field: { value, onChange } }) => (
              <Segmented
                options={['Carrier', 'Merchant']}
                value={value}
                onChange={onChange}
                block
                style={{ height: 40, padding: 4 }}
              />
            )} />
          </Col>

          <Col xs={24} md={8}>
            <label style={labelStyle}>Haulage Destination</label>
            <Controller control={control} name="haulageDestinationType" render={({ field: { value, onChange } }) => (
              <Segmented
                options={['Carrier', 'Merchant']}
                value={value}
                onChange={onChange}
                block
                style={{ height: 40, padding: 4 }}
              />
            )} />
          </Col>

          <Col xs={24} md={8}>
            <label style={labelStyle}>Carriage Contract</label>
            <Controller control={control} name="carriageContract" render={({ field }) => (
              <Select {...field} placeholder="Select Carriage Contract" style={{ width: '100%', height: 40 }} options={[]} />
            )} />
          </Col>

          <Col xs={24} md={8}>
            <label style={labelStyle}>Online Booking No</label>
            <Controller control={control} name="onlineBookingNo" render={({ field }) => (
              <Input {...field} disabled style={{ backgroundColor: token.colorFillAlter }} size="large" />
            )} />
          </Col>

          <Col xs={24} md={8}>
            <label style={labelStyle}>Agreement Party</label>
            <Controller control={control} name="agreementParty" render={({ field }) => (
              <Input {...field} placeholder="Agreement Party" size="large" />
            )} />
          </Col>

          <Col xs={24} md={8}>
            <label style={labelStyle}>Preferred Agency</label>
            <Controller control={control} name="preferredAgency" render={({ field }) => (
              <Select {...field} style={{ width: '100%', height: 40 }} options={[]} />
            )} />
          </Col>
        </Row>

        <div style={{ marginTop: 24 }}>
          <div 
            style={{ color: '#1677ff', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
            onClick={() => setShowAdditional(!showAdditional)}
          >
            {showAdditional ? <MinusOutlined /> : <PlusOutlined />}
            Additional Information
          </div>
          
          {showAdditional && (
            <div style={{ marginTop: 24 }}>
              <Row gutter={[24, 24]}>
                <Col xs={24} md={6}>
                  <label style={labelStyle}>Rate Reference</label>
                  <Controller control={control} name="rateReference" render={({ field }) => (
                    <Input {...field} placeholder="Rate Reference" size="large" />
                  )} />
                </Col>

                <Col xs={24} md={6}>
                  <label style={labelStyle}>Agency Reference</label>
                  <Controller control={control} name="agencyReference" render={({ field }) => (
                    <Input {...field} placeholder="Agency Reference" size="large" />
                  )} />
                </Col>

                <Col xs={24} md={6}>
                  <label style={labelStyle}>Ocean Freight</label>
                  <Controller control={control} name="oceanFreight" render={({ field }) => (
                    <Select {...field} placeholder="Select Option" style={{ width: '100%', height: 40 }} options={[{label: 'Prepaid', value: 'Prepaid'}, {label: 'Collect', value: 'Collect'}]} />
                  )} />
                </Col>

                <Col xs={24} md={6}>
                  <label style={labelStyle}>Place of Final Receipt</label>
                  <Controller control={control} name="placeOfFinalReceipt" render={({ field }) => (
                    <Select {...field} placeholder="Select Place" style={{ width: '100%', height: 40 }} options={[]} />
                  )} />
                </Col>

                <Col xs={24} md={6}>
                  <label style={labelStyle}>NAT Code</label>
                  <Controller control={control} name="natCode" render={({ field }) => (
                    <Input {...field} placeholder="NAT Code" size="large" />
                  )} />
                </Col>

                <Col xs={24} md={6}>
                  <label style={labelStyle}>Haulage Type</label>
                  <Controller control={control} name="haulageType" render={({ field }) => (
                    <Select {...field} placeholder="Select Type" style={{ width: '100%', height: 40 }} options={[{label: 'Live Load', value: 'Live Load'}, {label: 'Drop Only', value: 'Drop Only'}, {label: 'Pickup only', value: 'Pickup only'}, {label: 'Pickup & Drop', value: 'Pickup & Drop'}]} />
                  )} />
                </Col>

                <Col xs={24} md={6}>
                  <label style={labelStyle}>Pickup Date</label>
                  <Controller control={control} name="pickupDate" render={({ field: { value, onChange } }) => (
                    <DatePicker 
                      style={{ width: '100%', height: 40 }} 
                      format="DD-MMM-YYYY"
                      value={value ? dayjs(value) : null}
                      onChange={(date) => onChange(date ? date.format('YYYY-MM-DD') : '')}
                    />
                  )} />
                </Col>

                <Col xs={24} md={6}>
                  <label style={labelStyle}>Drop Date</label>
                  <Controller control={control} name="dropDate" render={({ field: { value, onChange } }) => (
                    <DatePicker 
                      style={{ width: '100%', height: 40 }} 
                      format="DD-MMM-YYYY"
                      value={value ? dayjs(value) : null}
                      onChange={(date) => onChange(date ? date.format('YYYY-MM-DD') : '')}
                    />
                  )} />
                </Col>

                <Col xs={24} md={6}>
                  <label style={labelStyle}>Hauler Code</label>
                  <Controller control={control} name="haulerCode" render={({ field }) => (
                    <Input {...field} placeholder="Hauler Code" size="large" />
                  )} />
                </Col>

                <Col xs={24} md={6}>
                  <label style={labelStyle}>Customer PO</label>
                  <Controller control={control} name="customerPo" render={({ field }) => (
                    <Input {...field} placeholder="Customer PO" size="large" />
                  )} />
                </Col>

                <Col xs={24} md={6}>
                  <label style={labelStyle}>Ref Type</label>
                  <Controller control={control} name="refType" render={({ field }) => (
                    <Select {...field} placeholder="Select Ref Type" style={{ width: '100%', height: 40 }} options={[{label: 'Normal', value: 'Normal'}, {label: 'Express', value: 'Express'}]} />
                  )} />
                </Col>

                <Col xs={24} md={6}>
                  <label style={labelStyle}>Export Ref</label>
                  <Controller control={control} name="exportRef" render={({ field }) => (
                    <Input {...field} placeholder="Export Ref" size="large" />
                  )} />
                </Col>

                <Col xs={24} md={6}>
                  <label style={labelStyle}>Empty Pickup Point</label>
                  <Controller control={control} name="emptyPickupPoint" render={({ field }) => (
                    <Select {...field} placeholder="Select Point" style={{ width: '100%', height: 40 }} options={[{label: 'Terminal', value: 'Terminal'}, {label: 'Depot', value: 'Depot'}]} />
                  )} />
                </Col>

                <Col xs={24} md={6}>
                  <label style={labelStyle}>Select Empty Pick Up</label>
                  <Controller control={control} name="emptyPickupFacility" render={({ field }) => (
                    <Select {...field} placeholder="Select Pick Up" style={{ width: '100%', height: 40 }} options={[]} />
                  )} />
                </Col>

                <Col xs={24} md={6}>
                  <label style={labelStyle}>Empty Pickup Date</label>
                  <Controller control={control} name="emptyPickupDate" render={({ field: { value, onChange } }) => (
                    <DatePicker 
                      style={{ width: '100%', height: 40 }} 
                      format="DD-MMM-YYYY"
                      value={value ? dayjs(value) : null}
                      onChange={(date) => onChange(date ? date.format('YYYY-MM-DD') : '')}
                    />
                  )} />
                </Col>

                <Col xs={24} md={6}>
                  <label style={labelStyle}>Customer Reference</label>
                  <Controller control={control} name="customerReference" render={({ field }) => (
                    <Input {...field} placeholder="Customer Reference" size="large" />
                  )} />
                </Col>

                <Col xs={24} md={6}>
                  <label style={labelStyle}>ACID</label>
                  <Controller control={control} name="acid" render={({ field }) => (
                    <Input {...field} placeholder="ACID" size="large" />
                  )} />
                </Col>

                <Col xs={24} md={6}>
                  <label style={labelStyle}>DPW Shipper Type</label>
                  <Controller control={control} name="dpwShipperType" render={({ field }) => (
                    <Select {...field} placeholder="Select Shipper Type" style={{ width: '100%', height: 40 }} options={[]} />
                  )} />
                </Col>

                <Col xs={24} md={6}>
                  <label style={labelStyle}>DPW Shipper Code</label>
                  <Controller control={control} name="dpwShipperCode" render={({ field }) => (
                    <Input {...field} placeholder="Shipper Code" size="large" disabled style={{ backgroundColor: token.colorFillAlter }} />
                  )} />
                </Col>

                <Col xs={24} md={24}>
                  <label style={labelStyle}>General Notes</label>
                  <Controller control={control} name="additionalInformation" render={({ field }) => (
                    <Input.TextArea {...field} rows={3} placeholder="Enter any additional details or notes" />
                  )} />
                </Col>
              </Row>
            </div>
          )}
        </div>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
        <AppButton>Previous</AppButton>
        <AppButton type="primary" htmlType="submit" style={{ marginLeft: 8 }}>Next</AppButton>
      </div>
    </form>
  );
}
