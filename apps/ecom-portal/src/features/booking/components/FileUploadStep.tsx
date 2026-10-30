// Modified by Sekar Nagarajan (2026-09-11 11:54)
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { useQuery } from "@tanstack/react-query";
import { Card, List, Select, Typography, Upload } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import { bookingApi } from "../api/booking.api";
import { bookingKeys } from "../api/booking.keys";
import { useBookingStore } from "../stores/booking.store";
import type { BookingDocument } from "../types/booking.types";

const { Text } = Typography;
const { Dragger } = Upload;

export function FileUploadStep() {
  const { t } = useTranslation(["booking", "common"]);
  const toast = useToast();
  const { payload, updateDocuments, nextStep, prevStep } = useBookingStore();
  const [docType, setDocType] = useState<string>("PACKING_LIST");
  const [uploading, setUploading] = useState(false);

  const documents = payload.documents ?? [];

  const { data: documentTypes = [] } = useQuery({
    queryKey: bookingKeys.lookups("documentTypes"),
    queryFn: () => bookingApi.getLookups("documentTypes"),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const hasDangerousGoods = (payload.cargo?.containers ?? []).some((c) =>
    c.commodities.some((m) => m.isDangerousGoods),
  );

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", docType);
      const uploaded = await bookingApi.uploadDocument(formData);
      updateDocuments([...documents, uploaded]);
      toast.success(t("wizard.files.uploadSuccess", { fileName: uploaded.fileName }));
    } catch {
      toast.error(t("wizard.files.uploadFailed", { fileName: file.name }));
    } finally {
      setUploading(false);
    }
    return false;
  };

  const handleRemove = (id: string) => {
    updateDocuments(documents.filter((d) => d.id !== id));
  };

  const handleNext = () => {
    if (hasDangerousGoods) {
      const hasMsds = documents.some((d) => d.type === "MSDS");
      if (!hasMsds) {
        toast.error(t("wizard.files.msdsRequired"));
        return;
      }
    }
    nextStep();
  };

  return (
    <div className="form-step-layout">
      <div className="custom-scroll form-step-scroll">
        <Card
          className="form-step-card form-step-section"
          title={t("wizard.files.title")}
        >
          <div className="booking-upload-type-row">
            <label className="form-field-label">{t("wizard.files.documentType")}</label>
            <Select
              size="large"
              className="form-field-full-width"
              value={docType}
              onChange={setDocType}
              options={documentTypes}
              placeholder={t("wizard.files.documentTypePlaceholder")}
            />
          </div>

          <Dragger
            name="file"
            multiple
            showUploadList={false}
            disabled={uploading}
            beforeUpload={(file) => {
              void handleUpload(file);
              return false;
            }}
          >
            <p className="ant-upload-drag-icon">
              <AppIcon icon={Icons.inbox} size={16} />
            </p>
            <p className="ant-upload-text">
              {t("wizard.files.draggerText")}
            </p>
            <p className="ant-upload-hint">
              {t("wizard.files.draggerHint", { type: docType })}
            </p>
          </Dragger>

          {documents.length > 0 ? (
            <List
              className="booking-upload-list"
              header={<Text strong>{t("wizard.files.uploadedList")}</Text>}
              dataSource={documents}
              renderItem={(item: BookingDocument) => (
                <List.Item
                  actions={[
                    <AppButton
                      key="remove"
                      type="link"
                      danger
                      onClick={() => handleRemove(item.id)}
                    >
                      {t("wizard.files.remove")}
                    </AppButton>,
                  ]}
                >
                  <List.Item.Meta
                    title={item.fileName}
                    description={`${item.type} · ${item.uploadedAt}`}
                  />
                </List.Item>
              )}
            />
          ) : null}
        </Card>
      </div>

      <div className="form-step-footer">
        <AppButton onClick={prevStep}>{t("common:actions.previous")}</AppButton>
        <AppButton type="primary" onClick={handleNext}>
          {t("common:actions.next")}
        </AppButton>
      </div>
    </div>
  );
}
