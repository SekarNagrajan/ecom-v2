// Modified by Sekar Nagarajan (2026-09-15 11:20)
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Card, List, Select, Typography, Upload } from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../../../components/icons";
import type { SIFileItem, SIWizardStepProps } from "../../types/si.types";

const { Text } = Typography;
const { Dragger } = Upload;

const FILE_CATEGORIES: { value: string; label: string }[] = [
  { value: "VGM", label: "VGM" },
  { value: "DG", label: "Dangerous Goods (DG)" },
  { value: "LOI", label: "Letter of Indemnity (LOI)" },
  { value: "OTHER", label: "Other" },
];

export function SiFileUploadStep({
  data,
  onNext,
  onPrevious,
  onUpdate,
  isFirstStep,
  isSubmitting,
}: SIWizardStepProps) {
  const toast = useToast();
  const [docType, setDocType] = useState<string>("OTHER");
  const [files, setFiles] = useState<SIFileItem[]>(() => data.files ?? []);
  const [uploading, setUploading] = useState(false);

  const handleUpload = (file: File) => {
    setUploading(true);
    try {
      const item: SIFileItem = {
        id: `file-${crypto.randomUUID()}`,
        fileName: file.name,
        fileType: docType,
        uploadedAt: new Date().toISOString(),
        sizeKb: Math.max(1, Math.round(file.size / 1024)),
      };
      setFiles((prev) => [...prev, item]);
      toast.success(`${file.name} uploaded successfully.`);
    } catch {
      toast.error(`${file.name} upload failed.`);
    } finally {
      setUploading(false);
    }
    return false;
  };

  const handleRemove = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleNext = () => {
    onUpdate({ files });
    onNext();
  };

  return (
    <div className="form-step-layout">
      <div className="custom-scroll form-step-scroll">
        <Card
          className="form-step-card form-step-section"
          title="Upload Supporting Documents"
        >
          <div className="si-upload-type-row">
            <label className="form-field-label">Document Type</label>
            <Select
              size="large"
              className="form-field-full-width"
              value={docType}
              onChange={setDocType}
              options={FILE_CATEGORIES}
              placeholder="Select document type"
            />
          </div>

          <Dragger
            name="file"
            multiple
            showUploadList={false}
            disabled={uploading || isSubmitting}
            beforeUpload={(file) => {
              void handleUpload(file);
              return false;
            }}
          >
            <p className="ant-upload-drag-icon">
              <AppIcon icon={Icons.inbox} size={16} />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Selected type: {docType}. Files are attached to this shipping
              instruction.
            </p>
          </Dragger>

          {files.length > 0 ? (
            <List
              className="si-upload-list"
              header={<Text strong>Uploaded Documents</Text>}
              dataSource={files}
              renderItem={(item: SIFileItem) => (
                <List.Item
                  actions={[
                    <AppButton
                      key="remove"
                      type="link"
                      danger
                      onClick={() => handleRemove(item.id)}
                    >
                      Remove
                    </AppButton>,
                  ]}
                >
                  <List.Item.Meta
                    title={item.fileName}
                    description={`${item.fileType} · ${item.sizeKb} KB · ${item.uploadedAt}`}
                  />
                </List.Item>
              )}
            />
          ) : null}
        </Card>
      </div>

      <div className="form-step-footer">
        <AppButton
          onClick={onPrevious}
          disabled={isFirstStep || isSubmitting}
        >
          Previous
        </AppButton>
        <AppButton type="primary" onClick={handleNext} disabled={isSubmitting}>
          Next
        </AppButton>
      </div>
    </div>
  );
}
