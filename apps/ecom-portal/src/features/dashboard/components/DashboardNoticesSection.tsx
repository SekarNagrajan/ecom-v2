// Modified by Sekar Nagarajan (2026-08-24 16:05)
import { Flex, List, Typography, theme } from 'antd';

import { AppIcon, Icons } from '../../../components/icons';
import type { NoticeItem } from '../mocks/dashboard.mock';

const { Text, Title } = Typography;

interface DashboardNoticesSectionProps {
  notices: NoticeItem[];
}

export function DashboardNoticesSection({ notices }: DashboardNoticesSectionProps) {
  const { token } = theme.useToken();

  return (
    <div
      style={{
        background: token.colorBgContainer,
        borderRadius: 12,
        border: `1px solid ${token.colorBorder}`,
        padding: '16px 20px',
        height: '100%',
      }}
    >
      <Flex align="center" justify="space-between" style={{ marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0, fontWeight: 600 }}>
          Notices & Advisories
        </Title>
        <Text type="secondary" style={{ fontSize: 12 }}>All</Text>
      </Flex>
      <List
        dataSource={notices}
        renderItem={(item) => (
          <List.Item style={{ padding: '14px 0', borderBottom: `1px solid ${token.colorBorder}`, alignItems: 'flex-start' }}>
            <div style={{ width: '100%' }}>
              <Flex align="flex-start" gap={10}>
                <AppIcon icon={Icons.bell} size={16} style={{ marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <Text strong style={{ display: 'block', fontSize: 14, marginBottom: 4 }}>
                    {item.title}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 13, display: 'block', lineHeight: 1.5 }}>
                    {item.body}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 8 }}>
                    {item.date}
                  </Text>
                </div>
              </Flex>
            </div>
          </List.Item>
        )}
      />
    </div>
  );
}
