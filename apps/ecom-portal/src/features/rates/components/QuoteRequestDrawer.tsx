// Modified by sekar nagarajan (2026-08-21 23:39)

import { zodResolver } from '@hookform/resolvers/zod';
import { AppButton, AppDrawer, useToast } from '@solverminds/shared-ui';
import { Form, Input, InputNumber, Select, Space, Typography } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useCreateQuoteMutation } from '../api/rates.queries';
import { CreateQuoteInput } from '../types/rates.types';

const { Text } = Typography;

const quoteSchema = z.object({
  originPort: z.string().min(1, 'Origin Port is required'),
  deliveryPort: z.string().min(1, 'Destination Port is required'),
  eqpType: z.string().min(1, 'Equipment Type is required'),
  eqpQuantity: z.number().min(1, 'Quantity must be at least 1'),
  commodity: z.string().min(1, 'Commodity is required'),
  cargoWeightKg: z.number().min(100, 'Cargo Weight is required'),
  expectedAmountUsd: z.number().optional(),
  comments: z.string().optional(),
});

interface QuoteRequestDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function QuoteRequestDrawer({ open, onClose }: QuoteRequestDrawerProps) {
  const { showToast } = useToast();
  const createMutation = useCreateQuoteMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateQuoteInput>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      originPort: 'USNYC',
      deliveryPort: 'SGSIN',
      eqpType: "40' High Cube Dry",
      eqpQuantity: 1,
      commodity: 'General Merchandise',
      cargoWeightKg: 15000,
    },
  });

  const onSubmit = (data: CreateQuoteInput) => {
    createMutation.mutate(data, {
      onSuccess: (newQuote) => {
        showToast(`Spot Quote Request ${newQuote.quoteNo} submitted successfully!`, 'success');
        reset();
        onClose();
      },
      onError: () => {
        showToast('Failed to submit quote request. Please try again.', 'error');
      },
    });
  };

  return (
    <AppDrawer
      title="Request Spot Rate Quotation"
      open={open}
      onClose={onClose}
      width={500}
      extra={
        <Space>
          <AppButton onClick={onClose}>Cancel</AppButton>
          <AppButton type="primary" loading={createMutation.isPending} onClick={handleSubmit(onSubmit)}>
            Submit Request
          </AppButton>
        </Space>
      }
    >
      <Form layout="vertical">
        {/* Origin Port */}
        <Form.Item label={<Text strong style={{ fontSize: 13 }}>Origin Port <Text type="danger">*</Text></Text>}>
          <Controller
            name="originPort"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                size="large"
                options={[
                  { label: 'USNYC - New York, USA', value: 'USNYC' },
                  { label: 'DEHAM - Hamburg, Germany', value: 'DEHAM' },
                  { label: 'INNSA - Nhava Sheva, India', value: 'INNSA' },
                ]}
              />
            )}
          />
          {errors.originPort && <Text type="danger" style={{ fontSize: 12 }}>{errors.originPort.message}</Text>}
        </Form.Item>

        {/* Destination Port */}
        <Form.Item label={<Text strong style={{ fontSize: 13 }}>Destination Port <Text type="danger">*</Text></Text>}>
          <Controller
            name="deliveryPort"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                size="large"
                options={[
                  { label: 'SGSIN - Singapore Port', value: 'SGSIN' },
                  { label: 'CNSHA - Shanghai, China', value: 'CNSHA' },
                  { label: 'AEDXB - Jebel Ali, UAE', value: 'AEDXB' },
                ]}
              />
            )}
          />
          {errors.deliveryPort && <Text type="danger" style={{ fontSize: 12 }}>{errors.deliveryPort.message}</Text>}
        </Form.Item>

        {/* Equipment Type */}
        <Form.Item label={<Text strong style={{ fontSize: 13 }}>Equipment Type <Text type="danger">*</Text></Text>}>
          <Controller
            name="eqpType"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                size="large"
                options={[
                  { label: "20' Standard Dry", value: "20' Standard Dry" },
                  { label: "40' High Cube Dry", value: "40' High Cube Dry" },
                  { label: "40' Reefer Container", value: "40' Reefer Container" },
                ]}
              />
            )}
          />
          {errors.eqpType && <Text type="danger" style={{ fontSize: 12 }}>{errors.eqpType.message}</Text>}
        </Form.Item>

        {/* Equipment Quantity */}
        <Form.Item label={<Text strong style={{ fontSize: 13 }}>Container Quantity (TEU) <Text type="danger">*</Text></Text>}>
          <Controller
            name="eqpQuantity"
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                size="large"
                min={1}
                max={100}
                style={{ width: '100%' }}
              />
            )}
          />
          {errors.eqpQuantity && <Text type="danger" style={{ fontSize: 12 }}>{errors.eqpQuantity.message}</Text>}
        </Form.Item>

        {/* Commodity */}
        <Form.Item label={<Text strong style={{ fontSize: 13 }}>Cargo Commodity <Text type="danger">*</Text></Text>}>
          <Controller
            name="commodity"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                size="large"
                placeholder="e.g. General Cargo, Auto Parts, Electronics"
              />
            )}
          />
          {errors.commodity && <Text type="danger" style={{ fontSize: 12 }}>{errors.commodity.message}</Text>}
        </Form.Item>

        {/* Cargo Weight */}
        <Form.Item label={<Text strong style={{ fontSize: 13 }}>Total Cargo Weight (KG) <Text type="danger">*</Text></Text>}>
          <Controller
            name="cargoWeightKg"
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                size="large"
                min={100}
                style={{ width: '100%' }}
                placeholder="e.g. 18500"
              />
            )}
          />
          {errors.cargoWeightKg && <Text type="danger" style={{ fontSize: 12 }}>{errors.cargoWeightKg.message}</Text>}
        </Form.Item>

        {/* Expected Rate */}
        <Form.Item label={<Text strong style={{ fontSize: 13 }}>Expected Target Rate (USD)</Text>}>
          <Controller
            name="expectedAmountUsd"
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                size="large"
                prefix="$"
                style={{ width: '100%' }}
                placeholder="Optional expected rate per container"
              />
            )}
          />
        </Form.Item>

        {/* Comments */}
        <Form.Item label={<Text strong style={{ fontSize: 13 }}>Special Routing Instructions / Remarks</Text>}>
          <Controller
            name="comments"
            control={control}
            render={({ field }) => (
              <Input.TextArea
                {...field}
                rows={3}
                placeholder="Enter any special handling, dangerous goods details, or target date preferences..."
              />
            )}
          />
        </Form.Item>
      </Form>
    </AppDrawer>
  );
}
