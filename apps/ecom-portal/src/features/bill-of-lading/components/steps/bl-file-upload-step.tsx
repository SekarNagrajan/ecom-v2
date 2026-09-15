// Modified by Sekar Nagarajan (2026-09-15 11:10)
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Card, List, Select, Typography, Upload } from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../../../components/icons";
import type { BLFileUploadItem } from "../../types/bl.types";
import { BlWizardFooter } from "../bl-wizard-footer";
import type { BLWizardStepProps } from "./MasterDetailsStep";

const { Text } = Typography;
const { Dragger } = Upload;

const FILE_CATEGORIES: {
  value: BLFileUploadItem["category"];
  label: string;
}[] = [
  { value: "VGM", label: "VGM" },
  { value: "DG", label: "Dangerous Goods (DG)" },
  { value: "LOI", label: "Letter of Indemnity (LOI)" },
  { value: "OTHER", label: "Other" },
];

export function BlFileUploadStep({
  data,
  onNext,
  onPrevious,
  onUpdate,
  isFirstStep,
  isSubmitting,
}: BLWizardStepProps) {
  const toast = useToast();
  const [docType, setDocType] =
    useState<BLFileUploadItem["category"]>("OTHER");
  const [files, setFiles] = useState<BLFileUploadItem[]>(
    () => data.files ?? [],
  );
  const [uploading, setUploading] = useState(false);

  const handleUpload = (file: File) => {
    setUploading(true);
    try {
      const item: BLFileUploadItem = {
        id: `file-${crypto.randomUUID()}`,
        category: docType,
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
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
          <div className="bl-upload-type-row">
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
              Selected type: {docType}. Files are attached to this B/L request.
            </p>
          </Dragger>

          {files.length > 0 ? (
            <List
              className="bl-upload-list"
              header={<Text strong>Uploaded Documents</Text>}
              dataSource={files}
              renderItem={(item: BLFileUploadItem) => (
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
                    description={`${item.category} · ${item.uploadedAt}`}
                  />
                </List.Item>
              )}
            />
          ) : null}
        </Card>
      </div>

      <BlWizardFooter
        onPrevious={onPrevious}
        onNext={handleNext}
        isFirstStep={isFirstStep}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
