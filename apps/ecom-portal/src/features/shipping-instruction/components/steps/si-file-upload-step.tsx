// Modified by Sekar Nagarajan (2026-08-28 11:52)
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Card, List, Select, Typography, Upload } from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../../../components/icons";
import type { SIFileItem, SIWizardStepProps } from "../../types/si.types";

const { Text } = Typography;
const { Dragger } = Upload;

const FILE_CATEGORIES = ["VGM", "DG", "LOI", "OTHER"] as const;

export function SiFileUploadStep({
  data,
  onNext,
  onPrevious,
  onUpdate,
  isFirstStep,
  isSubmitting,
}: SIWizardStepProps) {
  const toast = useToast();
  const [category, setCategory] =
    useState<(typeof FILE_CATEGORIES)[number]>("OTHER");
  const [files, setFiles] = useState<SIFileItem[]>(() => data.files ?? []);

  const handleUpload = (file: File) => {
    const item: SIFileItem = {
      id: `file-${crypto.randomUUID()}`,
      fileName: file.name,
      fileType: category,
      uploadedAt: new Date().toISOString(),
      sizeKb: Math.max(1, Math.round(file.size / 1024)),
    };
    setFiles((prev) => [...prev, item]);
    toast.success(`${file.name} added (${category}).`);
    return false;
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
            Upload VGM, DG declarations, seaway LOI, or other supporting files.
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
            multiple
            beforeUpload={handleUpload}
            showUploadList={false}
            className="form-step-section"
          >
            <p className="ant-upload-drag-icon">
              <AppIcon icon={Icons.inbox} size={32} />
            </p>
            <p className="ant-upload-text">Click or drag files to upload</p>
          </Dragger>

          {files.length > 0 ? (
            <List
              className="form-step-section"
              size="small"
              bordered
              dataSource={files}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <AppButton
                      key="remove"
                      type="link"
                      danger
                      onClick={() =>
                        setFiles((prev) =>
                          prev.filter((f) => f.id !== item.id),
                        )
                      }
                    >
                      Remove
                    </AppButton>,
                  ]}
                >
                  <List.Item.Meta
                    title={item.fileName}
                    description={`${item.fileType} · ${item.sizeKb} KB`}
                  />
                </List.Item>
              )}
            />
          ) : null}
        </Card>
      </div>

      {/* Modified by Sekar Nagarajan (2026-08-28 12:40) */}
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
