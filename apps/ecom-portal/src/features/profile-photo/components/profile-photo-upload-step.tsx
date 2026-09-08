// Created by Sekar Nagarajan (2026-09-08 15:20)
import { AppFileUpload } from "@solverminds/shared-ui";
import { Flex, Tag, theme } from "antd";

import { AppIcon, Icons } from "../../../components/icons";
import {
  PROFILE_PHOTO_ACCEPT,
  PROFILE_PHOTO_HELPER_TEXT,
  PROFILE_PHOTO_MAX_SIZE_BYTES,
} from "../utils/profile-photo.constants";

interface ProfilePhotoUploadStepProps {
  onBack: () => void;
  onFileSelected: (file: File) => void;
}

export function ProfilePhotoUploadStep({
  onFileSelected,
}: ProfilePhotoUploadStepProps) {
  const { token } = theme.useToken();

  return (
    <Flex vertical align="center" gap={token.marginMD}>
      <AppFileUpload
        accept={PROFILE_PHOTO_ACCEPT}
        compact
        description="or"
        icon={<AppIcon icon={Icons.image} size={28} />}
        maxSizeBytes={PROFILE_PHOTO_MAX_SIZE_BYTES}
        mode="dropzone"
        onFileSelect={(file) => onFileSelected(file)}
        selectButtonLabel="Select a photo from your computer"
        title="Drag a Profile Photo Here"
      />

      <Tag
        color="blue"
        style={{
          margin: 0,
          fontSize: token.fontSizeSM,
          padding: `${token.paddingXXS}px ${token.paddingSM}px`,
        }}
      >
        {PROFILE_PHOTO_HELPER_TEXT}
      </Tag>
    </Flex>
  );
}
