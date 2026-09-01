// Created by Sekar Nagarajan (2026-08-28 11:15)
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

const FILE_CATEGORIES: BLFileUploadItem["category"][] = [
  "VGM",
  "DG",
  "LOI",
  "OTHER",
];

export function BlFileUploadStep({
  data,
  onNext,
  onPrevious,
  onUpdate,
  onGoToStep,
  isFirstStep,
  isSubmitting,
}: BLWizardStepProps) {
  const toast = useToast();
  const [category, setCategory] =
    useState<BLFileUploadItem["category"]>("OTHER");
  const [files, setFiles] = useState<BLFileUploadItem[]>(
    () => data.files ?? [],
  );
  const [uploading, setUploading] = useState(false);

  const handleUpload = (file: File) => {
    setUploading(true);
    const item: BLFileUploadItem = {
      id: `file-${crypto.randomUUID()}`,
      category,
      fileName: file.name,
      uploadedAt: new Date().toISOString(),
    };
    setFiles((prev) => [...prev, item]);
    toast.success(`${file.name} added (${category}).`);
    setUploading(false);
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
          <Text type="secondary" className="form-step-hint">
            Upload VGM certificates, dangerous goods declarations, letters of
            indemnity, or other supporting documents.
          </Text>

          <div className="booking-upload-type-row">
            <label className="form-field-label">Document Category</label>
            <Select
              size="large"
              className="form-field-full-width"
              value={category}
              onChange={setCategory}
              options={FILE_CATEGORIES.map((c) => ({ value: c, label: c }))}
            />
          </div>

          <Dragger
            name="file"
            multiple
            showUploadList={false}
            disabled={uploading || isSubmitting}
            beforeUpload={(file) => {
              handleUpload(file);
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
              Selected category: {category}. Files are attached to this B/L.
            </p>
          </Dragger>

          {files.length > 0 ? (
            <List
              className="booking-upload-list"
              header={<Text strong>Uploaded Documents</Text>}
              dataSource={files}
              renderItem={(item) => (
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
