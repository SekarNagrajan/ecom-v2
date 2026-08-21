// Modified by Antigravity (2026-08-21)
import React, { useState } from 'react';
import { Card, Tag, Switch, Typography, Space, Progress, Alert, Input, Row, Col, Checkbox, theme } from 'antd';
import { UserAddOutlined, TeamOutlined, UserOutlined, MailOutlined, PhoneOutlined, KeyOutlined, SolutionOutlined } from '@ant-design/icons';
import { AppButton, AppModal } from '@solverminds/shared-ui';
import { DataView, DataViewColumn } from '@solverminds/shared-ui/data-view';
import { useToast } from '@solverminds/shared-ui/hooks';
import { useUserCreationController } from '../hooks/use-user-creation-controller';
import type { SubUser } from '../types/user-creation.types';

const { Title, Text } = Typography;

export function UserCreationView() {
  const { token } = theme.useToken();
  const toast = useToast();
  const controller = useUserCreationController();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form fields
  const [loginName, setLoginName] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('Apex Shipping Logistics');
  const [custPhoneNo, setCustPhoneNo] = useState('');
  const [selectedModules, setSelectedModules] = useState<string[]>(['SCH', 'TRK', 'BKG', 'SI']);

  const handleCreate = async () => {
    if (!loginName || !password || !firstName || !lastName || !email || !custPhoneNo) {
      toast.error('Please fill in all mandatory sub-user details');
      return;
    }

    if (controller.limitInfo.limitReached) {
      toast.error('Creation of user profile limit has been reached');
      return;
    }

    try {
      await controller.createSubUser({
        loginName,
        password,
        firstName,
        lastName,
        email,
        companyName,
        custPhoneNo,
        custCountryCode: '+1',
        custPhoneCode: '212',
        mobileCode: '+1',
        defLanguage: 'en',
        prefLanguage: 'en',
        allowedModules: selectedModules,
      });
      toast.success('Sub-user profile created successfully');
      setIsModalOpen(false);
      // Reset form
      setLoginName('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setEmail('');
      setCustPhoneNo('');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create sub-user profile';
      toast.error(errorMsg);
    }
  };

  const filteredUsers = controller.subUsers.filter(
    (u) =>
      u.loginName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columnDefs: DataViewColumn<SubUser>[] = [
    {
      headerName: 'Login Username',
      field: 'loginName',
      sortable: true,
      cellRenderer: (params: { data?: SubUser }) => {
        const record = params.data;
        if (!record) return null;
        return (
          <Space>
            <UserOutlined style={{ color: token.colorPrimary }} />
            <strong>{record.loginName}</strong>
          </Space>
        );
      },
    },
    {
      headerName: 'Full Name',
      field: 'firstName',
      sortable: true,
      valueGetter: (params: { data?: SubUser }) =>
        params.data ? `${params.data.firstName} ${params.data.lastName}` : '',
    },
    {
      headerName: 'Email Address',
      field: 'email',
      sortable: true,
    },
    {
      headerName: 'Company Name',
      field: 'companyName',
      sortable: true,
    },
    {
      headerName: 'Contact Phone',
      field: 'custPhoneNo',
      sortable: true,
    },
    {
      headerName: 'Allowed Capabilities',
      field: 'allowedModules',
      sortable: false,
      cellRenderer: (params: { data?: SubUser }) => {
        const mods = params.data?.allowedModules || [];
        return (
          <Space wrap size={[2, 4]}>
            {mods.map((m) => (
              <Tag color="blue" key={m}>
                {m}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      headerName: 'Account Status',
      field: 'isActive',
      sortable: true,
      cellRenderer: (params: { data?: SubUser }) => {
        const record = params.data;
        if (!record) return null;
        return (
          <Space>
            <Switch
              checked={record.isActive}
              onChange={(checked) => controller.toggleSubUserStatus({ id: record.id, active: checked })}
            />
            <Tag color={record.isActive ? 'green' : 'red'}>{record.isActive ? 'ACTIVE' : 'DISABLED'}</Tag>
          </Space>
        );
      },
    },
  ];

  const percentUsed = Math.round(
    (controller.limitInfo.currentlyAllocated / controller.limitInfo.allowedUserLimit) * 100
  );

  return (
    <Card style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: 'none' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Space align="center">
            <TeamOutlined style={{ fontSize: 22, color: token.colorPrimary }} />
            <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
              Sub-User Creation & Account Management (USC)
            </Title>
          </Space>
          <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
            Create and manage sub-user profile credentials for company employees, agents, and delegates
          </Text>
        </div>

        <AppButton
          type="primary"
          size="large"
          icon={<UserAddOutlined />}
          disabled={controller.limitInfo.limitReached}
          onClick={() => setIsModalOpen(true)}
        >
          Create New Sub-User
        </AppButton>
      </div>

      {/* User Limit Allocation Bar */}
      <Card type="inner" style={{ marginBottom: 20, borderRadius: 12, background: token.colorFillAlter }}>
        <Row gutter={24} align="middle">
          <Col span={8}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              CUSTOMER USER PROFILE LIMIT:
            </Text>
            <Title level={3} style={{ margin: 0, color: token.colorPrimary }}>
              {controller.limitInfo.currentlyAllocated} / {controller.limitInfo.allowedUserLimit} Users
            </Title>
          </Col>
          <Col span={10}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
              Account Allocation Status ({controller.limitInfo.remainingSlots} slots remaining):
            </Text>
            <Progress
              percent={percentUsed}
              status={controller.limitInfo.limitReached ? 'exception' : 'active'}
              strokeColor={token.colorPrimary}
            />
          </Col>
          <Col span={6} style={{ textAlign: 'right' }}>
            <Tag
              color={controller.limitInfo.limitReached ? 'red' : 'green'}
              style={{ fontSize: 13, padding: '4px 12px' }}
            >
              {controller.limitInfo.limitReached ? 'LIMIT REACHED' : 'SLOTS AVAILABLE'}
            </Tag>
          </Col>
        </Row>
      </Card>

      {controller.limitInfo.limitReached && (
        <Alert
          message="Creation Limit Exceeded"
          description="Creation of user profile limit has been reached. Please contact system admin to expand your allowed user quota."
          type="warning"
          showIcon
          style={{ marginBottom: 20, borderRadius: 8 }}
        />
      )}

      {/* Filter Input */}
      <div style={{ marginBottom: 16 }}>
        <Input
          size="large"
          prefix={<SolutionOutlined style={{ color: token.colorTextQuaternary }} />}
          placeholder="Search sub-users by login name, name, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 360 }}
        />
      </div>

      {/* AG Grid DataView Surface */}
      <DataView
        style={{ height: 480 }}
        columnDefs={columnDefs}
        rowData={filteredUsers}
        loading={controller.isLoadingUsers}
        allowedViewModes={['list']}
        listOptions={{
          gridOptions: {
            domLayout: 'autoHeight',
          },
        }}
      />

      {/* Create Sub-User Modal */}
      <AppModal
        open={isModalOpen}
        title="Create Sub-User Account Credentials"
        onCancel={() => setIsModalOpen(false)}
        onOk={handleCreate}
        confirmLoading={controller.isCreating}
      >
        <Space direction="vertical" style={{ width: '100%', marginTop: 16 }} size="middle">
          <Row gutter={16}>
            <Col span={12}>
              <Text style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Login Username *</Text>
              <Input
                size="large"
                prefix={<UserOutlined />}
                placeholder="e.g. SUB_EMP_01"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
              />
            </Col>
            <Col span={12}>
              <Text style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Initial Password *</Text>
              <Input.Password
                size="large"
                prefix={<KeyOutlined />}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Text style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>First Name *</Text>
              <Input size="large" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" />
            </Col>
            <Col span={12}>
              <Text style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Last Name *</Text>
              <Input size="large" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Text style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Email Address *</Text>
              <Input
                size="large"
                prefix={<MailOutlined />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john.doe@company.com"
              />
            </Col>
            <Col span={12}>
              <Text style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Contact Phone *</Text>
              <Input
                size="large"
                prefix={<PhoneOutlined />}
                value={custPhoneNo}
                onChange={(e) => setCustPhoneNo(e.target.value)}
                placeholder="+1 212 555-0199"
              />
            </Col>
          </Row>

          <div>
            <Text style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Company Profile</Text>
            <Input size="large" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>

          <div>
            <Text style={{ fontWeight: 600, display: 'block', marginBottom: 8 }}>Module Access Entitlements</Text>
            <Checkbox.Group
              options={[
                { label: 'Schedules (SCH)', value: 'SCH' },
                { label: 'Tracking (TRK)', value: 'TRK' },
                { label: 'e-Booking (BKG)', value: 'BKG' },
                { label: 'Shipping Instruction (SI)', value: 'SI' },
                { label: 'VGM Filing', value: 'VGM' },
                { label: 'Bill of Lading (BL)', value: 'BL' },
              ]}
              value={selectedModules}
              onChange={(vals) => setSelectedModules(vals as string[])}
            />
          </div>
        </Space>
      </AppModal>
    </Card>
  );
}
