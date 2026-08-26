// Modified by Sekar Nagarajan (2026-08-24 18:24)
import { AppButton } from "@solverminds/shared-ui";
import { Card, Typography, Upload, message } from "antd";
import { AppIcon, Icons } from "../../../components/icons";
import { useBookingStore } from "../stores/booking.store";

const { Text } = Typography;
const { Dragger } = Upload;

export function FileUploadStep() {
  const { nextStep, prevStep } = useBookingStore();

  const uploadProps = {
    name: "file",
    multiple: true,
    action: "/api/booking/upload",
    onChange(info: {
      file: { status?: string; name: string };
      fileList: unknown;
    }) {
      const { status } = info.file;
      if (status === "done") {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  return (
    <div className="form-step-layout">
      <div className="custom-scroll form-step-scroll">
        <Card
          className="form-step-card form-step-section"
          title="Upload Supporting Documents"
        >
          <Text type="secondary" className="form-step-hint">
            Please upload any relevant documentation such as MSDS for hazardous
            cargo, VGM certificates, or specific packing lists.
          </Text>
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <AppIcon icon={Icons.inbox} size={16} />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for a single or bulk upload. Strictly prohibited from
              uploading company data or other banned files.
            </p>
          </Dragger>
        </Card>
      </div>

      <div className="form-step-footer">
        <AppButton onClick={prevStep}>Previous</AppButton>
        <AppButton type="primary" onClick={nextStep}>
          Next
        </AppButton>
      </div>
    </div>
  );
}
