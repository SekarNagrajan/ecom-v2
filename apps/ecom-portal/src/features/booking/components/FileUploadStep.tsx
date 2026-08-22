// Created by Antigravity (2026-08-22 10:20)
import { AppButton } from '@solverminds/shared-ui';
import { Card, Typography, Upload, message, theme } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useBookingStore } from '../stores/booking.store';

const { Title, Text } = Typography;
const { Dragger } = Upload;

export function FileUploadStep() {
  const { token } = theme.useToken();
  const { nextStep, prevStep } = useBookingStore();

  const uploadProps = {
    name: 'file',
    multiple: true,
    action: '/api/booking/upload',
    onChange(info: any) {
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e: any) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  return (
    <div>
      <Card title="Upload Supporting Documents" style={{ border: `1px solid ${token.colorBorderSecondary}`, borderRadius: 8 }}>
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          Please upload any relevant documentation such as MSDS for hazardous cargo, VGM certificates, or specific packing lists.
        </Text>
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ color: '#1677ff' }} />
          </p>
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
          <p className="ant-upload-hint">
            Support for a single or bulk upload. Strictly prohibited from uploading company data or other
            banned files.
          </p>
        </Dragger>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
        <AppButton onClick={prevStep}>Previous</AppButton>
        <AppButton type="primary" onClick={nextStep}>Next</AppButton>
      </div>
    </div>
  );
}
