// Created by Sekar Nagarajan (2026-08-27 11:40)
import type { SubCustomerAccount } from '@solverminds/auth';
import { useAuthStore } from '@solverminds/auth';
import { AppModal } from '@solverminds/shared-ui';
import { Input, List, Typography, theme } from 'antd';
import { useState } from 'react';

import { AppIcon, Icons } from '../../../components/icons';

const { Text } = Typography;

interface CustomerPickerModalProps {
  open: boolean;
  customerList: SubCustomerAccount[];
  onSelect: (customer: SubCustomerAccount) => void;
  onCancel: () => void;
}

export function CustomerPickerModal({
  open,
  customerList,
  onSelect,
  onCancel,
}: CustomerPickerModalProps) {
  const { token } = theme.useToken();
  const { setImpersonatedCustomer } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customerList.filter(
    (c) =>
      c.custCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.compName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSelect = (customer: SubCustomerAccount) => {
    setImpersonatedCustomer(customer);
    setSearchTerm('');
    onSelect(customer);
  };

  return (
    <AppModal
      title="Select Customer Account"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={520}
    >
      <Input
        prefix={<AppIcon icon={Icons.search} size={16} />}
        placeholder="Search by customer code or company name"
        size="large"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        allowClear
        style={{ marginBottom: token.marginMD }}
      />

      <div
        className="custom-scroll"
        style={{ maxHeight: 400, overflowY: 'auto' }}
      >
        <List
          dataSource={filteredCustomers}
          locale={{ emptyText: 'No customers found' }}
          renderItem={(customer) => (
            <List.Item
              onClick={() => handleSelect(customer)}
              style={{
                cursor: 'pointer',
                padding: `${token.paddingSM}px ${token.paddingMD}px`,
                borderRadius: token.borderRadius,
              }}
              className="customer-picker-item"
            >
              <List.Item.Meta
                avatar={
                  <AppIcon
                    icon={Icons.building}
                    size={20}
                    style={{ color: token.colorPrimary }}
                  />
                }
                title={customer.compName}
                description={
                  <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                    {customer.custCode}
                  </Text>
                }
              />
            </List.Item>
          )}
        />
      </div>
    </AppModal>
  );
}
