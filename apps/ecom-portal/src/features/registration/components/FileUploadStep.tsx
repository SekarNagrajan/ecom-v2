// Modified by Sekar Nagarajan (2026-08-27 22:15)
import { useToast } from "@solverminds/shared-ui/hooks";
import { Flex, Typography, Upload } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import type { RegistrationFormData } from "../types/registration.schema";

const { Text, Title } = Typography;
const { Dragger } = Upload;

function toFileList(value: unknown): UploadFile[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as UploadFile[];
  if (value instanceof File) {
    return [
      {
        uid: value.name,
        name: value.name,
        status: "done",
        originFileObj: value as UploadFile["originFileObj"],
      },
    ];
  }
  return [value as UploadFile];
}

export function FileUploadStep() {
  const { t } = useTranslation(["registration", "common"]);
  const { control } = useFormContext<RegistrationFormData>();
  const toast = useToast();

  return (
    <Flex vertical gap={24} className="reg-step-body">
      <div>
        <Title level={5} className="reg-page__title">
          {t("kyc.title")}
        </Title>
        <Text type="secondary">{t("kyc.description")}</Text>
      </div>

      <Controller
        name="kycFile"
        control={control}
        render={({ field: { onChange, value } }) => (
          <Dragger
            name="file"
            multiple={false}
            fileList={toFileList(value)}
            className="reg-upload-dragger"
            beforeUpload={(file) => {
              const isLt10M = file.size / 1024 / 1024 < 10;
              if (!isLt10M) {
                toast.error(t("toasts.fileTooLarge"));
                return Upload.LIST_IGNORE;
              }

              const allowedTypes = [
                "application/pdf",
                "image/jpeg",
                "image/png",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              ];
              if (!allowedTypes.includes(file.type)) {
                toast.error(t("toasts.fileTypeInvalid"));
                return Upload.LIST_IGNORE;
              }

              onChange(file);
              return false;
            }}
            onRemove={() => {
              onChange(undefined);
            }}
          >
            <p className="ant-upload-drag-icon">
              <AppIcon icon={Icons.inbox} size={16} />
            </p>
            <p className="ant-upload-text">{t("kyc.dragText")}</p>
            <p className="ant-upload-hint reg-upload-hint">
              {t("kyc.dragHint")}
            </p>
          </Dragger>
        )}
      />
    </Flex>
  );
}
