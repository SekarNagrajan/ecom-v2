// Modified by Sekar Nagarajan (2026-08-27 18:21)
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { useQuery } from "@tanstack/react-query";
import { Card, List, Select, Typography, Upload } from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import { bookingApi } from "../api/booking.api";
import { bookingKeys } from "../api/booking.keys";
import { useBookingStore } from "../stores/booking.store";
import type { BookingDocument } from "../types/booking.types";

const { Text } = Typography;
const { Dragger } = Upload;

export function FileUploadStep() {
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
      toast.success(`${uploaded.fileName} uploaded successfully.`);
    } catch {
      toast.error(`${file.name} upload failed.`);
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
        toast.error(
          "MSDS document is required when any commodity is marked as Dangerous Goods.",
        );
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
          title="Upload Supporting Documents"
        >
          <div className="booking-upload-type-row">
            <label className="form-field-label">Document Type</label>
            <Select
              size="large"
              className="form-field-full-width"
              value={docType}
              onChange={setDocType}
              options={documentTypes}
              placeholder="Select document type"
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
              Click or drag file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Selected type: {docType}. Files are attached to this booking
              request.
            </p>
          </Dragger>

          {documents.length > 0 ? (
            <List
              className="booking-upload-list"
              header={<Text strong>Uploaded Documents</Text>}
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
                      Remove
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
        <AppButton onClick={prevStep}>Previous</AppButton>
        <AppButton type="primary" onClick={handleNext}>
          Next
        </AppButton>
      </div>
    </div>
  );
}
