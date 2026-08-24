// Created by Antigravity (2026-08-24 11:30)
import { AppButton } from '@solverminds/shared-ui';
import { Card, Result, Typography, theme } from 'antd';
import { DollarCircleOutlined } from '@ant-design/icons';
import type { SIDTO } from '../types/si.types';

const { Text } = Typography;

export function ChargesStep({ 
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <Card style={{ border: `1px solid ${token.colorBorderSecondary}`, borderRadius: 8 }}>
          <Result
            icon={<DollarCircleOutlined style={{ color: token.colorPrimary }} />}
            title="Freight Option Selected"
            subTitle={
              <div style={{ marginTop: 12 }}>
                <Text style={{ fontSize: 16 }}>The freight option for this shipment is set to:</Text>
                <div style={{ fontSize: 28, fontWeight: 700, color: token.colorPrimary, marginTop: 12 }}>
                  {data.freightOption}
                </div>
                <div style={{ marginTop: 24, padding: 16, backgroundColor: token.colorFillAlter, borderRadius: 8 }}>
                  <Text type="secondary">Actual charges will be calculated and applied during Bill of Lading generation.</Text>
                </div>
              </div>
            }
          />
        </Card>
      </div>

      <div style={{ flexShrink: 0, padding: '16px 24px', borderTop: `1px solid ${token.colorBorderSecondary}`, display: 'flex', justifyContent: 'space-between', backgroundColor: token.colorBgContainer }}>
        <AppButton onClick={onPrevious} disabled={isSubmitting}>Previous</AppButton>
        <AppButton type="primary" onClick={onNext} disabled={isSubmitting}>Next</AppButton>
      </div>
    </div>
  );
}
