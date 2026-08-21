// Modified by Antigravity (2026-08-21)
import { EnvironmentOutlined, MailOutlined, PhoneOutlined, SafetyCertificateOutlined, SaveOutlined, UserOutlined } from '@ant-design/icons';
import { AppButton, AppDrawer } from '@solverminds/shared-ui';
import { useToast } from '@solverminds/shared-ui/hooks';
import { Col, Form, Input, Row, Select, Space, Spin, Tag, theme, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { userModulesApi } from '../api/user-modules.api';
import type { CustomerProfile } from '../types/user-modules.types';

const { Title, Text } = Typography;

export interface ProfileViewProps {
  open?: boolean;
  onClose?: () => void;
}

export function ProfileView({ open = true, onClose }: ProfileViewProps) {
  const { token } = theme.useToken();
  const toast = useToast();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);

  useEffect(() => {
    if (open) {
      setLoading(true);
      userModulesApi
        .getProfile()
        .then((data) => {
          setProfile(data);
          form.setFieldsValue(data);
        })
        .catch(() => toast.error('Failed to load profile details'))
        .finally(() => setLoading(false));
    }
  }, [open, form, toast]);

  const handleSave = async (values: CustomerProfile) => {
    setSaving(true);
    try {
      const updated = await userModulesApi.updateProfile(values);
      setProfile(updated);
      toast.success('Customer Profile details updated successfully');
      if (onClose) onClose();
    } catch {
      toast.error('Failed to save profile changes');
    } finally {
      setSaving(false);
    }
  };

  const formFields = (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSave}
      size="large"
      requiredMark={(label, { required }) => (
        <span>
          {label}
          {required && <span style={{ color: token.colorError, marginLeft: 4 }}>*</span>}
        </span>
      )}
    >
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item label="Login Account ID" name="loginName">
            <Input prefix={<UserOutlined style={{ color: token.colorTextQuaternary }} />} disabled />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Company Name" name="companyName">
            <Input disabled />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={12}>
          <Form.Item label="First Name" name="firstName" rules={[{ required: true, message: 'First name is required' }]}>
            <Input placeholder="Enter first name" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Last Name" name="lastName" rules={[{ required: true, message: 'Last name is required' }]}>
            <Input placeholder="Enter last name" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={12}>
          <Form.Item label="Primary Email Address" name="email" rules={[{ required: true, type: 'email', message: 'Valid email is required' }]}>
            <Input prefix={<MailOutlined style={{ color: token.colorTextQuaternary }} />} placeholder="Enter email address" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Telephone Number" name="phoneNo" rules={[{ required: true, message: 'Phone number is required' }]}>
            <Input prefix={<PhoneOutlined style={{ color: token.colorTextQuaternary }} />} placeholder="Enter contact phone" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={12}>
          <Form.Item label="Country" name="country">
            <Input prefix={<EnvironmentOutlined style={{ color: token.colorTextQuaternary }} />} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Tax ID / Registration Number" name="taxId">
            <Input placeholder="Enter Tax ID" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={12}>
          <Form.Item label="Preferred Portal Language" name="defLanguage">
            <Select
              options={[
                { value: 'en', label: 'English (United States)' },
                { value: 'es', label: 'Spanish (Español)' },
                { value: 'zh', label: 'Mandarin Chinese (中文)' },
                { value: 'de', label: 'German (Deutsch)' },
              ]}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Preferred Timezone" name="prefTimeZone">
            <Select
              options={[
                { value: 'UTC-5 (EST)', label: 'Eastern Standard Time (EST / UTC-5)' },
                { value: 'UTC+0 (GMT)', label: 'Greenwich Mean Time (GMT / UTC+0)' },
                { value: 'UTC+8 (SGT)', label: 'Singapore Time (SGT / UTC+8)' },
                { value: 'UTC+1 (CET)', label: 'Central European Time (CET / UTC+1)' },
              ]}
            />
          </Form.Item>
        </Col>
      </Row>

      {!onClose && (
        <Form.Item style={{ marginTop: 12, textAlign: 'right' }}>
          <AppButton type="primary" size="large" icon={<SaveOutlined />} loading={saving} htmlType="submit">
            Save Profile Updates
          </AppButton>
        </Form.Item>
      )}
    </Form>
  );

  const headerContent = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
      <div>
        <Space align="center">
          <UserOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
          <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
            Customer Profile Details
          </Title>
        </Space>
        <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
          Manage primary contact information, company details, timezone, and communication preferences
        </Text>
      </div>

      <Tag icon={<SafetyCertificateOutlined />} color="green" style={{ fontSize: 13, padding: '4px 12px' }}>
        VERIFIED CUSTOMER ({profile?.customerCode || 'CUST-001'})
      </Tag>
    </div>
  );

  const bodyContent = (
    <div>
      {headerContent}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" tip="Loading customer profile..." />
        </div>
      ) : (
        formFields
      )}
    </div>
  );

  if (onClose) {
    return (
      <AppDrawer
        open={open}
        onClose={onClose}
        width="50%"
        styles={{
          body: { overflowY: 'auto', maxHeight: 'calc(100vh - 105px)', padding: '20px 24px' },
          footer: { display: 'flex', justifyContent: 'flex-end', borderTop: `1px solid ${token.colorBorderSecondary}`, padding: '8px 20px', background: token.colorBgContainer },
        }}
        title="Customer Account Profile"
        mask={{ blur: false }}
        footer={
          <Space style={{ width: '100%', justifyContent: 'flex-end' }} size={8}>
            <AppButton danger onClick={onClose}>Cancel</AppButton>
            <AppButton type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => form.submit()}>
              Save Profile Updates
            </AppButton>
          </Space>
        }
      >
        {bodyContent}
      </AppDrawer>
    );
  }

  return bodyContent;
}
