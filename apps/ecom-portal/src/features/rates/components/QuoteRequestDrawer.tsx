// Modified by Antigravity (2026-08-21 23:59)
// QuoteRequestDrawer component aligned with ApplicationResource_en.properties keys:
// ecom.rr.reqforrate=Request for Quote
// ecom.rr.pol=POL
// ecom.rr.pod=POD
// ecom.rr.eqptype=Cargo Type
// ecom.rr.cargoqty=Cargo Quantity
// ecom.rr.cargowt=Cargo Weight
// ecom.rr.commodity=Commodity
// ecom.rr.comments=Comments

import { zodResolver } from '@hookform/resolvers/zod';
import { AppButton, AppDrawer } from '@solverminds/shared-ui';
import { useToast } from '@solverminds/shared-ui/hooks';
import { Form, Input, InputNumber, Select, Space, Typography } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useCreateQuoteMutation } from '../api/rates.queries';
import { CreateQuoteInput } from '../types/rates.types';

const { Text } = Typography;

const quoteSchema = z.object({
  originPort: z.string().min(1, 'Port of Load is required'),
  deliveryPort: z.string().min(1, 'Port of Discharge is required'),
  eqpType: z.string().min(1, 'Cargo Type is required'),
  eqpQuantity: z.number().min(1, 'Cargo Quantity must be at least 1'),
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
  const toast = useToast();
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
        toast.success(`Request for Quote ${newQuote.quoteNo} submitted successfully!`);
        reset();
        onClose();
      },
      onError: () => {
        toast.error('Failed to submit Request for Quote. Please try again.');
      },
    });
  };

  return (
    <AppDrawer
      title="Request for Quote"
      open={open}
      onClose={onClose}
      width={520}
      extra={
        <Space size={8}>
          <AppButton onClick={onClose}>Cancel</AppButton>
          <AppButton type="primary" loading={createMutation.isPending} onClick={handleSubmit(onSubmit)}>
            Submit Request for Quote
          </AppButton>
        </Space>
      }
    >
      <Form layout="vertical" requiredMark={false}>
        {/* Port of Load (POL) */}
        <Form.Item
          label={
            <span>
              Port of Load (POL) <Text type="danger">*</Text>
            </span>
          }
          validateStatus={errors.originPort ? 'error' : ''}
          help={errors.originPort?.message}
        >
          <Controller
            name="originPort"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                showSearch
                options={[
                  { value: 'USNYC', label: 'USNYC - New York, USA' },
                  { value: 'DEHAM', label: 'DEHAM - Hamburg, Germany' },
                  { value: 'INNSA', label: 'INNSA - Nhava Sheva, India' },
                ]}
              />
            )}
          />
        </Form.Item>

        {/* Port of Discharge (POD) */}
        <Form.Item
          label={
            <span>
              Port of Discharge (POD) <Text type="danger">*</Text>
            </span>
          }
          validateStatus={errors.deliveryPort ? 'error' : ''}
          help={errors.deliveryPort?.message}
        >
          <Controller
            name="deliveryPort"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                showSearch
                options={[
                  { value: 'SGSIN', label: 'SGSIN - Singapore, Singapore' },
                  { value: 'CNSHA', label: 'CNSHA - Shanghai, China' },
                  { value: 'AEDXB', label: 'AEDXB - Jebel Ali, UAE' },
                ]}
              />
            )}
          />
        </Form.Item>

        {/* Cargo Type (Eqp Type) */}
        <Form.Item
          label={
            <span>
              Cargo Type <Text type="danger">*</Text>
            </span>
          }
          validateStatus={errors.eqpType ? 'error' : ''}
          help={errors.eqpType?.message}
        >
          <Controller
            name="eqpType"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={[
                  { value: "20' Standard Dry", label: "20' Standard Dry (20DV)" },
                  { value: "40' High Cube Dry", label: "40' High Cube Dry (40HC)" },
                  { value: "40' Reefer Container", label: "40' Reefer Container (40RF)" },
                ]}
              />
            )}
          />
        </Form.Item>

        {/* Cargo Quantity */}
        <Form.Item
          label={
            <span>
              Cargo Quantity <Text type="danger">*</Text>
            </span>
          }
          validateStatus={errors.eqpQuantity ? 'error' : ''}
          help={errors.eqpQuantity?.message}
        >
          <Controller
            name="eqpQuantity"
            control={control}
            render={({ field }) => <InputNumber {...field} min={1} style={{ width: '100%' }} />}
          />
        </Form.Item>

        {/* Commodity */}
        <Form.Item
          label={
            <span>
              Commodity <Text type="danger">*</Text>
            </span>
          }
          validateStatus={errors.commodity ? 'error' : ''}
          help={errors.commodity?.message}
        >
          <Controller
            name="commodity"
            control={control}
            render={({ field }) => <Input {...field} placeholder="e.g. General Cargo / Machinery" />}
          />
        </Form.Item>

        {/* Cargo Weight */}
        <Form.Item
          label={
            <span>
              Cargo Weight (kg) <Text type="danger">*</Text>
            </span>
          }
          validateStatus={errors.cargoWeightKg ? 'error' : ''}
          help={errors.cargoWeightKg?.message}
        >
          <Controller
            name="cargoWeightKg"
            control={control}
            render={({ field }) => <InputNumber {...field} min={100} style={{ width: '100%' }} addonAfter="kg" />}
          />
        </Form.Item>

        {/* Expected Target Amount */}
        <Form.Item label="Expected Target Rate (USD)">
          <Controller
            name="expectedAmountUsd"
            control={control}
            render={({ field }) => <InputNumber {...field} min={0} style={{ width: '100%' }} prefix="$" addonAfter="USD" />}
          />
        </Form.Item>

        {/* Comments */}
        <Form.Item label="Comments">
          <Controller
            name="comments"
            control={control}
            render={({ field }) => (
              <Input.TextArea {...field} rows={3} placeholder="Special stowage or temperature requirements..." />
            )}
          />
        </Form.Item>
      </Form>
    </AppDrawer>
  );
}
