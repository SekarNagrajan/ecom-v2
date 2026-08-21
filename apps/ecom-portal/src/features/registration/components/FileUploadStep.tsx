// Modified by Antigravity (2026-08-21)
import { Flex, Typography, Upload, Button } from 'antd';
import { InboxOutlined, UploadOutlined } from '@ant-design/icons';
import { useToast } from '@solverminds/shared-ui/hooks';
import { Controller, useFormContext } from 'react-hook-form';
import { RegistrationFormData } from '../types/registration.schema';

const { Text, Title } = Typography;
const { Dragger } = Upload;

export function FileUploadStep() {
  const { control } = useFormContext<RegistrationFormData>();
  const toast = useToast();

  return (
    <Flex vertical gap={24} style={{ padding: '24px 0' }}>
      <div>
        <Title level={5} style={{ marginTop: 0 }}>KYC Document Upload</Title>
        <Text type="secondary">
          Please upload your company registration certificate, trade license, or other KYC documents as required by the controlling agency.
        </Text>
      </div>

      <Controller
        name="kycFile"
        control={control}
        render={({ field: { onChange, value } }) => {
          const fileList = value ? (Array.isArray(value) ? value : [value]) : [];

          return (
            <Dragger
              name="file"
              multiple={false}
              fileList={fileList}
              beforeUpload={(file) => {
                const isLt10M = file.size / 1024 / 1024 < 10;
                if (!isLt10M) {
                  toast.error('File must be smaller than 10MB!');
                  return Upload.LIST_IGNORE;
                }
                
                // Allow user to upload any standard document format
                const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                if (!allowedTypes.includes(file.type)) {
                  toast.error('You can only upload PDF, JPG, PNG or DOC/DOCX files!');
                  return Upload.LIST_IGNORE;
                }

                // Since we are not actually uploading to a server here (doing it on form submit)
                // we return false to stop the automatic upload behavior.
                onChange(file);
                return false;
              }}
              onRemove={() => {
                onChange(undefined);
              }}
              style={{ padding: '40px 0', background: '#fafafa', borderRadius: 12 }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ color: '#1677ff' }} />
              </p>
              <p className="ant-upload-text" style={{ fontSize: 16, fontWeight: 500 }}>
                Click or drag file to this area to upload
              </p>
              <p className="ant-upload-hint" style={{ color: '#888' }}>
                Support for a single PDF, DOCX, JPG, or PNG upload. Maximum size 10MB.
              </p>
            </Dragger>
          );
        }}
      />
    </Flex>
  );
}
