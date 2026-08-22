// Created by Antigravity (2026-08-22 09:55)
import { AppButton } from '@solverminds/shared-ui';
import { Card, Checkbox, Col, Input, InputNumber, Row, Select, Typography, theme } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBookingStore } from '../stores/booking.store';
import { cargoSchema, type CargoData } from '../types/booking.types';
import { useEffect } from 'react';

const { Text, Title } = Typography;

const COMMODITIES = [
  { value: 'GEN-CGO', label: 'GEN-CGO - General Freight / Merchandise' },
  { value: 'AUTO-PARTS', label: 'AUTO-PARTS - Automotive Spare Parts & Machinery' },
];

const EQUIPMENT_TYPES = [
  { value: "20' Standard Dry", label: "20' Standard Dry (20DV)" },
  { value: "40' High Cube Dry", label: "40' High Cube Dry (40HC)" },
];

export function CargoStep() {
  const { token } = theme.useToken();
  const { payload, updateCargo, nextStep, prevStep } = useBookingStore();
  
  const { control, handleSubmit, watch, formState: { errors }, reset } = useForm<any>({
    resolver: zodResolver(cargoSchema),
    defaultValues: payload.cargo || {
      commodity: '',
      containerType: '',
      containerCount: 1,
      totalWeightKg: 1000,
      isLcl: false,
      packageType: '',
      isDangerousGoods: false,
      unNumber: '',
      dgClass: '',
      flashPoint: '',
      marinePollutant: false,
      shippingName: '',
      isReefer: false,
      setTemp: undefined,
      minTemp: undefined,
      maxTemp: undefined,
      tempUnit: 'Celsius',
      volume: undefined,
      isOog: false,
      olForward: undefined,
      owLeft: undefined,
      oh: undefined,
      olAft: undefined,
      owRight: undefined,
      dimensionUnit: 'CM',
    },
  });

  const isLcl = watch('isLcl');
  const isDg = watch('isDangerousGoods');
  const isReefer = watch('isReefer');
  const isOog = watch('isOog');

  useEffect(() => {
    if (payload.cargo) reset(payload.cargo);
  }, [payload.cargo, reset]);

  const onSubmit = (data: CargoData) => {
    updateCargo(data);
    nextStep();
  };

  const labelStyle: React.CSSProperties = { fontWeight: 600, fontSize: 13, color: token.colorTextSecondary, marginBottom: 6, display: 'block' };

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <label style={labelStyle}>Commodity <Text type="danger">*</Text></label>
          <Controller control={control} name="commodity" render={({ field }) => (
            <Select {...field} options={COMMODITIES} placeholder="Select Commodity" style={{ width: '100%', height: 40 }} />
          )} />
          {errors.commodity && <Text type="danger" style={{ fontSize: 12, marginTop: 4 }}>{errors.commodity.message as string}</Text>}
        </Col>

        <Col xs={24} md={12}>
          <label style={labelStyle}>Equipment Description <Text type="danger">*</Text></label>
          <Controller control={control} name="containerType" render={({ field }) => (
            <Select {...field} options={EQUIPMENT_TYPES} placeholder="Select Equipment" style={{ width: '100%', height: 40 }} />
          )} />
          {errors.containerType && <Text type="danger" style={{ fontSize: 12, marginTop: 4 }}>{errors.containerType.message as string}</Text>}
        </Col>

        <Col xs={24} md={12}>
          <label style={labelStyle}>Container Count <Text type="danger">*</Text></label>
          <Controller control={control} name="containerCount" render={({ field }) => (
            <InputNumber {...field} min={1} max={100} style={{ width: '100%', height: 40 }} size="large" />
          )} />
          {errors.containerCount && <Text type="danger" style={{ fontSize: 12, marginTop: 4 }}>{errors.containerCount.message as string}</Text>}
        </Col>

        <Col xs={24} md={12}>
          <label style={labelStyle}>Total Weight (kg) <Text type="danger">*</Text></label>
          <Controller control={control} name="totalWeightKg" render={({ field }) => (
            <InputNumber {...field} min={100} style={{ width: '100%', height: 40 }} size="large" />
          )} />
          {errors.totalWeightKg && <Text type="danger" style={{ fontSize: 12, marginTop: 4 }}>{errors.totalWeightKg.message as string}</Text>}
        </Col>
      </Row>

      {/* Cargo Requirements Checkboxes */}
      <Card size="small" style={{ marginTop: 24, background: token.colorFillAlter, border: `1px solid ${token.colorBorderSecondary}` }}>
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Controller control={control} name="isLcl" render={({ field: { value, onChange, ...field } }) => (
              <Checkbox {...field} checked={value} onChange={e => onChange(e.target.checked)}><b>LCL</b></Checkbox>
            )} />
          </Col>
          <Col span={6}>
            <Controller control={control} name="isDangerousGoods" render={({ field: { value, onChange, ...field } }) => (
              <Checkbox {...field} checked={value} onChange={e => onChange(e.target.checked)}><b>Hazardous</b></Checkbox>
            )} />
          </Col>
          <Col span={6}>
            <Controller control={control} name="isReefer" render={({ field: { value, onChange, ...field } }) => (
              <Checkbox {...field} checked={value} onChange={e => onChange(e.target.checked)}><b>Reefer</b></Checkbox>
            )} />
          </Col>
          <Col span={6}>
            <Controller control={control} name="isOog" render={({ field: { value, onChange, ...field } }) => (
              <Checkbox {...field} checked={value} onChange={e => onChange(e.target.checked)}><b>OOG</b></Checkbox>
            )} />
          </Col>
        </Row>
      </Card>

      {/* LCL Fields */}
      {isLcl && (
        <Card size="small" title="LCL Details" style={{ marginTop: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <label style={labelStyle}>Package Type <Text type="danger">*</Text></label>
              <Controller control={control} name="packageType" render={({ field }) => (
                <Input {...field} placeholder="e.g. Pallets" size="large" />
              )} />
              {errors.packageType && <Text type="danger" style={{ fontSize: 12, marginTop: 4 }}>{errors.packageType.message as string}</Text>}
            </Col>
          </Row>
        </Card>
      )}

      {/* Hazardous Fields */}
      {isDg && (
        <Card size="small" title="DG Details" style={{ marginTop: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <label style={labelStyle}>UN No <Text type="danger">*</Text></label>
              <Controller control={control} name="unNumber" render={({ field }) => (
                <Input {...field} placeholder="e.g. 1993" size="large" />
              )} />
              {errors.unNumber && <Text type="danger" style={{ fontSize: 12, marginTop: 4 }}>{errors.unNumber.message as string}</Text>}
            </Col>
            <Col xs={24} md={8}>
              <label style={labelStyle}>DG Class <Text type="danger">*</Text></label>
              <Controller control={control} name="dgClass" render={({ field }) => (
                <Input {...field} placeholder="e.g. 3" size="large" />
              )} />
              {errors.dgClass && <Text type="danger" style={{ fontSize: 12, marginTop: 4 }}>{errors.dgClass.message as string}</Text>}
            </Col>
            <Col xs={24} md={8}>
              <label style={labelStyle}>Flash Point</label>
              <Controller control={control} name="flashPoint" render={({ field }) => (
                <Input {...field} placeholder="e.g. 23 C" size="large" />
              )} />
            </Col>
            <Col xs={24} md={16}>
              <label style={labelStyle}>Shipping Name</label>
              <Controller control={control} name="shippingName" render={({ field }) => (
                <Input {...field} placeholder="Proper shipping name" size="large" />
              )} />
            </Col>
            <Col xs={24} md={8} style={{ display: 'flex', alignItems: 'center', paddingTop: 24 }}>
              <Controller control={control} name="marinePollutant" render={({ field: { value, onChange, ...field } }) => (
                <Checkbox {...field} checked={value} onChange={e => onChange(e.target.checked)}>Marine Pollutant</Checkbox>
              )} />
            </Col>
          </Row>
        </Card>
      )}

      {/* Reefer Fields */}
      {isReefer && (
        <Card size="small" title="Reefer Details" style={{ marginTop: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={6}>
              <label style={labelStyle}>Set Temp <Text type="danger">*</Text></label>
              <Controller control={control} name="setTemp" render={({ field }) => (
                <InputNumber {...field} style={{ width: '100%' }} size="large" />
              )} />
              {errors.setTemp && <Text type="danger" style={{ fontSize: 12, marginTop: 4 }}>{errors.setTemp.message as string}</Text>}
            </Col>
            <Col xs={24} md={6}>
              <label style={labelStyle}>Min Temp</label>
              <Controller control={control} name="minTemp" render={({ field }) => (
                <InputNumber {...field} style={{ width: '100%' }} size="large" />
              )} />
            </Col>
            <Col xs={24} md={6}>
              <label style={labelStyle}>Max Temp</label>
              <Controller control={control} name="maxTemp" render={({ field }) => (
                <InputNumber {...field} style={{ width: '100%' }} size="large" />
              )} />
            </Col>
            <Col xs={24} md={6}>
              <label style={labelStyle}>Temp Unit <Text type="danger">*</Text></label>
              <Controller control={control} name="tempUnit" render={({ field }) => (
                <Select {...field} options={[{value: 'Celsius', label: 'Celsius'}, {value: 'Fahrenheit', label: 'Fahrenheit'}]} style={{ width: '100%', height: 40 }} />
              )} />
            </Col>
          </Row>
        </Card>
      )}

      {/* OOG Fields */}
      {isOog && (
        <Card size="small" title="OOG Details" style={{ marginTop: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={6}>
              <label style={labelStyle}>Dimension Unit <Text type="danger">*</Text></label>
              <Controller control={control} name="dimensionUnit" render={({ field }) => (
                <Select {...field} options={[{value: 'CM', label: 'CM'}, {value: 'IN', label: 'IN'}]} style={{ width: '100%', height: 40 }} />
              )} />
              {errors.dimensionUnit && <Text type="danger" style={{ fontSize: 12, marginTop: 4 }}>{errors.dimensionUnit.message as string}</Text>}
            </Col>
            <Col xs={24} md={6}>
              <label style={labelStyle}>OL Forward</label>
              <Controller control={control} name="olForward" render={({ field }) => (
                <InputNumber {...field} style={{ width: '100%' }} size="large" />
              )} />
            </Col>
            <Col xs={24} md={6}>
              <label style={labelStyle}>OL Aft</label>
              <Controller control={control} name="olAft" render={({ field }) => (
                <InputNumber {...field} style={{ width: '100%' }} size="large" />
              )} />
            </Col>
            <Col xs={24} md={6}>
              <label style={labelStyle}>OW Left</label>
              <Controller control={control} name="owLeft" render={({ field }) => (
                <InputNumber {...field} style={{ width: '100%' }} size="large" />
              )} />
            </Col>
            <Col xs={24} md={6}>
              <label style={labelStyle}>OW Right</label>
              <Controller control={control} name="owRight" render={({ field }) => (
                <InputNumber {...field} style={{ width: '100%' }} size="large" />
              )} />
            </Col>
            <Col xs={24} md={6}>
              <label style={labelStyle}>OH</label>
              <Controller control={control} name="oh" render={({ field }) => (
                <InputNumber {...field} style={{ width: '100%' }} size="large" />
              )} />
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
