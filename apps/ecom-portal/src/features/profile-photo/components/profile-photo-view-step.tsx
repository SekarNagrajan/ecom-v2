// Created by Sekar Nagarajan (2026-09-08 15:20)
import { AppButton } from "@solverminds/shared-ui";
import { Flex, Typography, theme } from "antd";

import { AppIcon, Icons } from "../../../components/icons";
import { UserAvatar } from "../../../components/shared/user-avatar";

const { Text, Title } = Typography;

interface ProfilePhotoViewStepProps {
  fullName?: string | null;
  hasPhoto: boolean;
  initials?: string | null;
  isRemoving: boolean;
  onChangeImage: () => void;
  onRemove: () => void;
  photoUrl: string | null;
  roleLabel?: string | null;
}

const VIEW_AVATAR_SIZE = 120;

export function ProfilePhotoViewStep({
  fullName,
  hasPhoto,
  initials,
  isRemoving,
  onChangeImage,
  onRemove,
  photoUrl,
  roleLabel,
}: ProfilePhotoViewStepProps) {
  const { token } = theme.useToken();

  return (
    <Flex
      vertical
      align="center"
      gap={token.marginSM}
      style={{ paddingTop: token.paddingSM, paddingBottom: token.paddingXS }}
    >
      <UserAvatar
        initials={initials}
        src={photoUrl ?? undefined}
        size={VIEW_AVATAR_SIZE}
        style={{ fontSize: token.fontSizeHeading2 }}
      />

      {fullName || roleLabel ? (
        <Flex vertical align="center" gap={0}>
          {fullName ? (
            <Title level={5} style={{ margin: 0 }}>
              {fullName}
            </Title>
          ) : null}
          {roleLabel ? (
            <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              {roleLabel}
            </Text>
          ) : null}
        </Flex>
      ) : null}

      <Flex gap={token.marginXS} justify="center" wrap="nowrap">
        <AppButton
          icon={<AppIcon icon={Icons.image} size={16} />}
          onClick={onChangeImage}
          type="primary"
        >
          Change Image
        </AppButton>
        {hasPhoto ? (
          <AppButton
            danger
            icon={<AppIcon icon={Icons.trash} size={16} tone="delete" />}
            loading={isRemoving}
            onClick={onRemove}
            type="default"
          >
            Remove Photo
          </AppButton>
        ) : null}
      </Flex>
    </Flex>
  );
}
