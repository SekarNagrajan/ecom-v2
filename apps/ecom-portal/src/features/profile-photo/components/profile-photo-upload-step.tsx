// Created by Sekar Nagarajan (2026-09-08 15:20)
import { AppFileUpload } from "@solverminds/shared-ui";
import { Flex, Tag, theme } from "antd";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import {
  PROFILE_PHOTO_ACCEPT,
  PROFILE_PHOTO_MAX_SIZE_BYTES,
} from "../utils/profile-photo.constants";

interface ProfilePhotoUploadStepProps {
  onBack: () => void;
  onFileSelected: (file: File) => void;
}

export function ProfilePhotoUploadStep({
  onFileSelected,
}: ProfilePhotoUploadStepProps) {
  const { t } = useTranslation(["profile-photo", "common"]);
  const { token } = theme.useToken();

  return (
    <Flex vertical align="center" gap={token.marginMD}>
      <AppFileUpload
        accept={PROFILE_PHOTO_ACCEPT}
        compact
        description={t("upload.or")}
        icon={<AppIcon icon={Icons.image} size={28} />}
        maxSizeBytes={PROFILE_PHOTO_MAX_SIZE_BYTES}
        mode="dropzone"
        onFileSelect={(file) => onFileSelected(file)}
        selectButtonLabel={t("upload.selectButton")}
        title={t("upload.title")}
      />

      <Tag
        color="blue"
        style={{
          margin: 0,
          fontSize: token.fontSizeSM,
          padding: `${token.paddingXXS}px ${token.paddingSM}px`,
        }}
      >
        {t("helper")}
      </Tag>
    </Flex>
  );
}
