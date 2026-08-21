import { Checkbox, Flex, Typography } from 'antd';
import { Controller, useFormContext } from 'react-hook-form';
import { RegistrationFormData } from '../types/registration.schema';
const { Text, Title } = Typography;

export function TermsStep() {
  const { control, formState: { errors } } = useFormContext<RegistrationFormData>();

  return (
    <Flex vertical gap={24} style={{ padding: '24px 0' }}>
      <div style={{ background: '#f8fafc', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0', maxHeight: 300, overflowY: 'auto' }}>
        <Title level={5} style={{ marginTop: 0 }}>Terms and Conditions</Title>
        <Text style={{ display: 'block', marginBottom: 12 }}>
          1. Acceptance of Terms: By registering for an account on the E-Com Portal, you agree to abide by these terms and conditions.
        </Text>
        <Text style={{ display: 'block', marginBottom: 12 }}>
          2. Privacy Policy: We are committed to protecting your privacy. Your personal and company information will be handled in accordance with our Privacy Policy and applicable data protection laws.
        </Text>
        <Text style={{ display: 'block', marginBottom: 12 }}>
          3. Account Security: You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
        </Text>
        <Text style={{ display: 'block', marginBottom: 12 }}>
          4. Accurate Information: You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
        </Text>
      </div>

      <Flex vertical gap={8}>
        <Controller
          name="agreeToTerms"
          control={control}
          render={({ field: { value, onChange, ...field } }) => (
            <Checkbox 
              {...field} 
              checked={value} 
              onChange={(e) => onChange(e.target.checked)}
            >
              <Text strong>I Agree the terms and condition <span style={{ color: 'red' }}>*</span></Text>
            </Checkbox>
          )}
        />
        {errors.agreeToTerms && <Text type="danger" style={{ fontSize: 12 }}>{errors.agreeToTerms.message}</Text>}
      </Flex>
    </Flex>
  );
}
