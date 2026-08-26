// Modified by Sekar Nagarajan (2026-08-25 15:05)
import { FloatButton, Drawer, Collapse, Typography, Space } from 'antd';
import { useState } from 'react';

import { AppIcon, Icons } from '../../../components/icons';

const { Panel } = Collapse;
const { Text, Link } = Typography;

export function AgencyHotlineWidget() {
  const [open, setOpen] = useState(false);

  const showDrawer = () => setOpen(true);
  const onClose = () => setOpen(false);

  const mockContacts = [
    {
      region: 'Asia Pacific',
      ports: [
        { name: 'Singapore (SGSIN)', contact: 'John Doe', phone: '+65 1234 5678', email: 'sg.support@solverminds.com' },
        { name: 'Port Klang (MYPKG)', contact: 'Jane Smith', phone: '+60 3 1234 5678', email: 'my.support@solverminds.com' },
      ]
    },
    {
      region: 'Europe',
      ports: [
        { name: 'Rotterdam (NLRTM)', contact: 'Jan de Vries', phone: '+31 10 123 4567', email: 'nl.support@solverminds.com' },
      ]
    }
  ];

  return (
    <>
      <FloatButton
        icon={<AppIcon icon={Icons.phone} size={18} />}
        type="primary"
        style={{ right: 24, bottom: 24 }}
        onClick={showDrawer}
        description="Hotline"
        shape="square"
      />
      <Drawer
        title="Agency Hotline"
        placement="right"
        onClose={onClose}
        open={open}
        size={350}
      >
        <Collapse defaultActiveKey={['0']} ghost>
          {mockContacts.map((region, index) => (
            <Panel header={<Text strong>{region.region}</Text>} key={index.toString()}>
              <Collapse ghost>
                {region.ports.map((port, pIndex) => (
                  <Panel header={<Text style={{ color: '#1677ff' }}>{port.name}</Text>} key={`${index}-${pIndex}`}>
                    <Space direction="vertical" size={2}>
                      <Text type="secondary"><AppIcon icon={Icons.user} size={14} style={{ marginRight: 8 }} />{port.contact}</Text>
                      <Text type="secondary"><AppIcon icon={Icons.phone} size={14} style={{ marginRight: 8 }} />{port.phone}</Text>
                      <Link href={`mailto:${port.email}`}><AppIcon icon={Icons.mail} size={14} style={{ marginRight: 8 }} />{port.email}</Link>
                    </Space>
                  </Panel>
                ))}
              </Collapse>
            </Panel>
          ))}
        </Collapse>
      </Drawer>
    </>
  );
}
