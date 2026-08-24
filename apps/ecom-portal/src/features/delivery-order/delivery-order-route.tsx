// Created by Sekar Nagarajan (2026-08-24 14:46)
import { useState } from 'react';
import { Card, theme } from 'antd';
import { DeliveryOrderLanding } from './components/DeliveryOrderLanding';
import { DeliveryOrderListing } from './components/DeliveryOrderListing';
import { DeliveryOrderDetails } from './components/DeliveryOrderDetails';

export function DeliveryOrderRoute() {
  const { token } = theme.useToken();
  const [view, setView] = useState<'landing' | 'listing'>('landing');
  const [selectedDo, setSelectedDo] = useState<string | null>(null);

  const openDetails = (delOrdNo: string) => {
    setSelectedDo(delOrdNo);
  };

  const closeDetails = () => {
    setSelectedDo(null);
  };

  return (
    <Card
      bordered={false}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: token.borderRadiusLG,
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
      }}
      bodyStyle={{
        flex: 1,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
        {view === 'landing' && (
          <div style={{ padding: '0 24px' }}>
            <DeliveryOrderLanding onOpen={() => setView('listing')} />
          </div>
        )}
        {view === 'listing' && (
          <DeliveryOrderListing onView={openDetails} onBack={() => setView('landing')} />
        )}
      </div>

      {selectedDo && (
        <DeliveryOrderDetails delOrdNo={selectedDo} onClose={closeDetails} />
      )}
    </Card>
  );
}
