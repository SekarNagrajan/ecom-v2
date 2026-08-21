// Modified by Sekar Nagarajan (2026-08-21 14:55)
import React from 'react';
import { Card, Input, Tag, Typography, Space, Row, Col, Select } from 'antd';
import { MailOutlined, SaveOutlined } from '@ant-design/icons';
import { AppButton } from '@solverminds/shared-ui';
import type { EmailTemplate } from '../types/admin.types';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface EmailTemplateEditorViewProps {
  templates: EmailTemplate[];
  onSave: (id: string, data: Partial<EmailTemplate>) => void;
}

export function EmailTemplateEditorView({ templates, onSave }: EmailTemplateEditorViewProps) {
  const [selectedId, setSelectedId] = React.useState<string>(templates[0]?.id || '');
  const activeTemplate = templates.find((t) => t.id === selectedId) || templates[0];

  const [subject, setSubject] = React.useState<string>(activeTemplate?.subject || '');
  const [bodyHtml, setBodyHtml] = React.useState<string>(activeTemplate?.bodyHtml || '');

  React.useEffect(() => {
    if (activeTemplate) {
      setSubject(activeTemplate.subject);
      setBodyHtml(activeTemplate.bodyHtml);
    }
  }, [activeTemplate]);

  if (!activeTemplate) return null;

  return (
    <Card style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Space align="center">
            <MailOutlined style={{ fontSize: 20, color: '#13c2c2' }} />
            <Title level={4} style={{ margin: 0 }}>Email Template Editor</Title>
          </Space>
          <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
            Create and customize transactional notification templates with dynamic variables
          </Text>
        </div>
        <AppButton type="primary" size="large" icon={<SaveOutlined />} onClick={() => onSave(activeTemplate.id, { subject, bodyHtml })}>
          Save Template
        </AppButton>
      </div>

      <Row gutter={16}>
        <Col span={8}>
          <Text style={{ fontWeight: 600, display: 'block', marginBottom: 8 }}>Select Email Template</Text>
          <Select
            size="large"
            style={{ width: '100%' }}
            value={selectedId}
            onChange={(val) => setSelectedId(val)}
            options={templates.map((t) => ({ label: t.templateCode, value: t.id }))}
          />

          <div style={{ marginTop: 24, padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <Text style={{ fontWeight: 600, display: 'block', marginBottom: 8 }}>Available Variables</Text>
            <Space wrap size={[4, 8]}>
              {activeTemplate.placeholders.map((ph) => (
                <Tag color="cyan" key={ph} style={{ cursor: 'pointer' }} onClick={() => setBodyHtml((prev) => prev + ` ${ph} `)}>
                  {ph}
                </Tag>
              ))}
            </Space>
          </div>
        </Col>

        <Col span={16}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Text style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Email Subject Line</Text>
              <Input size="large" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>

            <div>
              <Text style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>HTML Template Body</Text>
              <TextArea
                rows={10}
                value={bodyHtml}
                onChange={(e) => setBodyHtml(e.target.value)}
                className="custom-scroll"
                style={{ fontFamily: 'monospace' }}
              />
            </div>

            <div style={{ padding: 16, background: '#ffffff', borderRadius: 8, border: '1px dashed #cbd5e1' }}>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                LIVE PREVIEW:
              </Text>
              <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
            </div>
          </Space>
        </Col>
      </Row>
    </Card>
  );
}
