// Created by Antigravity (2026-08-24 11:30)
import { AppButton } from '@solverminds/shared-ui';
import { Card, Col, Row, Typography, theme, Switch, Input } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import type { SIDTO } from '../types/si.types';

const { Text, Title } = Typography;
const { TextArea } = Input;

export function PartiesStep({ 
  data, 
  onNext, 
  onPrevious, 
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
      shipperName: data.parties.shipper.name,
      shipperAddress: data.parties.shipper.address,
      shipperPrint: data.parties.shipper.printOnBl,
      
      consigneeName: data.parties.consignee.name,
      consigneeAddress: data.parties.consignee.address,
      consigneePrint: data.parties.consignee.printOnBl,
      consigneeToOrder: data.parties.consignee.toOrder,
      
      notifyName: data.parties.notify.name,
      notifyAddress: data.parties.notify.address,
      notifyPrint: data.parties.notify.printOnBl,
    }
  });

  const onSubmit = (formData: any) => {
    console.log('Saved data:', formData);
    onNext();
  };

  const labelStyle: React.CSSProperties = { fontWeight: 600, fontSize: 13, color: token.colorTextSecondary, marginBottom: 6, display: 'block' };
  const cardStyle = { border: `1px solid ${token.colorBorderSecondary}`, borderRadius: 8, marginBottom: 24 };

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        
        {/* SHIPPER */}
        <Card style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={5} style={{ margin: 0, color: token.colorPrimary }}>SHIPPER</Title>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Text>Print on B/L</Text>
              <Controller control={control} name="shipperPrint" render={({ field: { value, onChange } }) => (
                <Switch checked={value} onChange={onChange} />
              )} />
            </div>
          </div>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <label style={labelStyle}>Shipper Name <Text type="danger">*</Text></label>
              <Controller control={control} name="shipperName" render={({ field }) => (
                <Input {...field} size="large" />
              )} />
            </Col>
            <Col xs={24} md={12}>
              <label style={labelStyle}>Address <Text type="danger">*</Text></label>
              <Controller control={control} name="shipperAddress" render={({ field }) => (
                <TextArea {...field} rows={3} />
              )} />
            </Col>
          </Row>
        </Card>

        {/* CONSIGNEE */}
        <Card style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <Title level={5} style={{ margin: 0, color: token.colorPrimary }}>CONSIGNEE</Title>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Text>To Order</Text>
                <Controller control={control} name="consigneeToOrder" render={({ field: { value, onChange } }) => (
                  <Switch checked={value} onChange={onChange} />
                )} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Text>Print on B/L</Text>
              <Controller control={control} name="consigneePrint" render={({ field: { value, onChange } }) => (
                <Switch checked={value} onChange={onChange} />
              )} />
            </div>
          </div>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <label style={labelStyle}>Consignee Name <Text type="danger">*</Text></label>
              <Controller control={control} name="consigneeName" render={({ field }) => (
                <Input {...field} size="large" />
              )} />
            </Col>
            <Col xs={24} md={12}>
              <label style={labelStyle}>Address <Text type="danger">*</Text></label>
              <Controller control={control} name="consigneeAddress" render={({ field }) => (
                <TextArea {...field} rows={3} />
              )} />
            </Col>
          </Row>
        </Card>

        {/* NOTIFY PARTY */}
        <Card style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={5} style={{ margin: 0, color: token.colorPrimary }}>NOTIFY PARTY</Title>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Text>Print on B/L</Text>
              <Controller control={control} name="notifyPrint" render={({ field: { value, onChange } }) => (
                <Switch checked={value} onChange={onChange} />
              )} />
            </div>
          </div>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <label style={labelStyle}>Notify Party Name <Text type="danger">*</Text></label>
              <Controller control={control} name="notifyName" render={({ field }) => (
                <Input {...field} size="large" />
              )} />
            </Col>
            <Col xs={24} md={12}>
              <label style={labelStyle}>Address <Text type="danger">*</Text></label>
              <Controller control={control} name="notifyAddress" render={({ field }) => (
                <TextArea {...field} rows={3} />
              )} />
            </Col>
          </Row>
        </Card>

      </div>

      <div style={{ flexShrink: 0, padding: '16px 24px', borderTop: `1px solid ${token.colorBorderSecondary}`, display: 'flex', justifyContent: 'space-between', backgroundColor: token.colorBgContainer }}>
        <AppButton onClick={onPrevious} disabled={isSubmitting}>Previous</AppButton>
        <AppButton type="primary" htmlType="submit" disabled={isSubmitting}>Next</AppButton>
      </div>
    </form>
  );
}
