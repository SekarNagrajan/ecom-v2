import { PhoneOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';
import { FloatButton, Drawer, Collapse, Typography, Space } from 'antd';
import { useState } from 'react';

const { Panel } = Collapse;
const { Text, Link } = Typography;

export function AgencyHotlineWidget() {
  const [open, setOpen] = useState(false);

  const showDrawer = () => setOpen(true);
  const onClose = () => setOpen(false);

  // Mock data representing the hotline contacts per region
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
        icon={<PhoneOutlined />}
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
        width={350}
      >
        <Collapse defaultActiveKey={['0']} ghost>
          {mockContacts.map((region, index) => (
            <Panel header={<Text strong>{region.region}</Text>} key={index.toString()}>
              <Collapse ghost>
                {region.ports.map((port, pIndex) => (
                  <Panel header={<Text style={{ color: '#1677ff' }}>{port.name}</Text>} key={`${index}-${pIndex}`}>
                    <Space direction="vertical" size={2}>
                      <Text type="secondary"><UserOutlined style={{ marginRight: 8 }} />{port.contact}</Text>
                      <Text type="secondary"><PhoneOutlined style={{ marginRight: 8 }} />{port.phone}</Text>
                      <Link href={`mailto:${port.email}`}><MailOutlined style={{ marginRight: 8 }} />{port.email}</Link>
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
