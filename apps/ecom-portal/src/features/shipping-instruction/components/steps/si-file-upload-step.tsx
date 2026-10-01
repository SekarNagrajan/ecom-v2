// Modified by Sekar Nagarajan (2026-09-15 11:20)
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Card, List, Select, Typography, Upload } from "antd";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../../components/icons";
import type { SIFileItem, SIWizardStepProps } from "../../types/si.types";

const { Text } = Typography;
const { Dragger } = Upload;

export function SiFileUploadStep({
  data,
  onNext,
  onPrevious,
  onUpdate,
  isFirstStep,
  isSubmitting,
}: SIWizardStepProps) {
  const { t } = useTranslation(["shipping-instruction", "common", "modules"]);
  const toast = useToast();

  const FILE_CATEGORIES = useMemo<{ value: string; label: string }[]>(
    () => [
      { value: "VGM", label: t("wizard.files.categories.vgm") },
      { value: "DG", label: t("wizard.files.categories.dg") },
      { value: "LOI", label: t("wizard.files.categories.loi") },
      { value: "OTHER", label: t("wizard.files.categories.other") },
    ],
    [t],
  );

  const [docType, setDocType] = useState<string>("OTHER");
  const [files, setFiles] = useState<SIFileItem[]>(() => data.files ?? []);
  const [uploading, setUploading] = useState(false);

  const selectedCategoryLabel = useMemo(
    () =>
      FILE_CATEGORIES.find((c) => c.value === docType)?.label ?? docType,
    [FILE_CATEGORIES, docType],
  );

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
      toast.success(t("wizard.files.uploadSuccess", { fileName: file.name }));
    } catch {
      toast.error(t("wizard.files.uploadFailed", { fileName: file.name }));
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
          title={t("wizard.files.title")}
        >
          <div className="si-upload-type-row">
            <label className="form-field-label">
              {t("wizard.files.documentType")}
            </label>
            <Select
              size="large"
              className="form-field-full-width"
              value={docType}
              onChange={setDocType}
              options={FILE_CATEGORIES}
              placeholder={t("wizard.files.documentTypePlaceholder")}
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
            <p className="ant-upload-text">{t("wizard.files.draggerText")}</p>
            <p className="ant-upload-hint">
              {t("wizard.files.draggerHint", { type: selectedCategoryLabel })}
            </p>
          </Dragger>

          {files.length > 0 ? (
            <List
              className="si-upload-list"
              header={<Text strong>{t("wizard.files.uploadedList")}</Text>}
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
                      {t("common:actions.remove")}
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
          {t("common:actions.previous")}
        </AppButton>
        <AppButton type="primary" onClick={handleNext} disabled={isSubmitting}>
          {t("common:actions.next")}
        </AppButton>
      </div>
    </div>
  );
}
