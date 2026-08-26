// Modified by Sekar Nagarajan (2026-08-24 19:14)
import { AppButton } from '@solverminds/shared-ui';
import { Col, Input, Row, Select, Space, Tag, Typography } from 'antd';
import React from 'react';

import { AppIcon, Icons } from '../../../components/icons';
import { RESPONSIVE_COL } from '../../../constants/responsive-grid';
import type { EmailTemplate } from '../types/admin.types';
import { AdminPanelShell } from './AdminPanelShell';

const { Text } = Typography;
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
    <AdminPanelShell
      icon={Icons.mail}
      title="Email Template Editor"
      subtitle="Create and customize transactional notification templates with dynamic variables."
      extra={
        <AppButton
          type="primary"
          size="large"
          icon={<AppIcon icon={Icons.save} size={16} />}
          onClick={() => onSave(activeTemplate.id, { subject, bodyHtml })}
        >
          Save Template
        </AppButton>
      }
    >
      <Row gutter={[16, 16]}>
        <Col {...RESPONSIVE_COL.formThird}>
          <span className="form-field-label">Select Email Template</span>
          <Select
            size="large"
            className="admin-full-width"
            value={selectedId}
            onChange={(val) => setSelectedId(val)}
            options={templates.map((t) => ({ label: t.templateCode, value: t.id }))}
            style={{ width: '100%' }}
          />

          <div className="admin-vars-box">
            <span className="form-field-label">Available Variables</span>
            <Space wrap size={[4, 8]}>
              {activeTemplate.placeholders.map((ph) => (
                <Tag
                  className="admin-code-tag"
                  color="cyan"
                  key={ph}
                  onClick={() => setBodyHtml((prev) => prev + ` ${ph} `)}
                >
                  {ph}
                </Tag>
              ))}
            </Space>
          </div>
        </Col>

        <Col {...RESPONSIVE_COL.twoThirds}>
          <Space direction="vertical" size="middle" className="admin-stack-full">
            <div>
              <span className="form-field-label">Email Subject Line</span>
              <Input size="large" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>

            <div>
              <span className="form-field-label">HTML Template Body</span>
              <TextArea
                rows={10}
                value={bodyHtml}
                onChange={(e) => setBodyHtml(e.target.value)}
                className="custom-scroll admin-mono-textarea"
              />
            </div>

            <div className="admin-preview-box">
              <Text type="secondary" className="admin-preview-box__label">
                Live Preview
              </Text>
              <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
            </div>
          </Space>
        </Col>
      </Row>
    </AdminPanelShell>
  );
}
