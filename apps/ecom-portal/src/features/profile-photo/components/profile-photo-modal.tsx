// Created by Sekar Nagarajan (2026-09-08 15:20)
import { extractApiError } from "@solverminds/platform";
import { AppModal } from "@solverminds/shared-ui";
import { useConfirm, useToast } from "@solverminds/shared-ui/hooks";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useProfilePhoto } from "../providers/profile-photo-provider";
import { ProfilePhotoCropStep } from "./profile-photo-crop-step";
import { ProfilePhotoUploadStep } from "./profile-photo-upload-step";
import { ProfilePhotoViewStep } from "./profile-photo-view-step";

type ProfilePhotoModalStep = "view" | "select" | "crop";

interface ProfilePhotoModalProps {
  fullName?: string | null;
  initials?: string | null;
  onClose: () => void;
  open: boolean;
  roleLabel?: string | null;
}

export function ProfilePhotoModal({
  fullName,
  initials,
  onClose,
  open,
  roleLabel,
}: ProfilePhotoModalProps) {
  const { t } = useTranslation(["profile-photo", "common"]);
  const toast = useToast();
  const confirm = useConfirm();
  const { photoUrl, upload, remove, isUploading, isRemoving } =
    useProfilePhoto();
  const [step, setStep] = useState<ProfilePhotoModalStep>("view");
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);

  const stepTitle = t(`steps.${step}`);

  const releaseSelectedFile = () => {
    if (selectedFileUrl) {
      URL.revokeObjectURL(selectedFileUrl);
    }
    setSelectedFileUrl(null);
  };

  const handleClose = () => {
    releaseSelectedFile();
    setStep("view");
    onClose();
  };

  const handleFileSelected = (file: File) => {
    setSelectedFileUrl(URL.createObjectURL(file));
    setStep("crop");
  };

  const handleCropCancel = () => {
    releaseSelectedFile();
    setStep("select");
  };

  // X / Esc / mask: step back; only view step closes the dialog.
  const handleDismiss = () => {
    if (step === "crop") {
      handleCropCancel();
      return;
    }
    if (step === "select") {
      setStep("view");
      return;
    }
    handleClose();
  };

  const handleCropSave = async (blob: Blob) => {
    try {
      await upload(blob);
      releaseSelectedFile();
      setStep("view");
      toast.success(t("toasts.updated"));
    } catch (error) {
      toast.error(extractApiError(error) || t("errors.uploadFailed"));
    }
  };

  const handleRemove = () => {
    confirm.danger({
      title: t("confirms.removeTitle"),
      content: t("confirms.removeContent"),
      okText: t("common:actions.remove"),
      cancelText: t("common:actions.cancel"),
      onOk: async () => {
        try {
          await remove();
          toast.success(t("toasts.removed"));
        } catch (error) {
          toast.error(extractApiError(error) || t("errors.removeFailed"));
        }
      },
    });
  };

  return (
    <AppModal
      dialogSize="xs"
      destroyOnHidden
      footer={null}
      onCancel={handleDismiss}
      open={open}
      title={stepTitle}
    >
      {step === "view" ? (
        <ProfilePhotoViewStep
          fullName={fullName}
          hasPhoto={!!photoUrl}
          initials={initials}
          isRemoving={isRemoving}
          onChangeImage={() => setStep("select")}
          onRemove={handleRemove}
          photoUrl={photoUrl}
          roleLabel={roleLabel}
        />
      ) : null}

      {step === "select" ? (
        <ProfilePhotoUploadStep
          onBack={() => setStep("view")}
          onFileSelected={handleFileSelected}
        />
      ) : null}

      {step === "crop" && selectedFileUrl ? (
        <ProfilePhotoCropStep
          imageSrc={selectedFileUrl}
          isSaving={isUploading}
          onCancel={handleCropCancel}
          onSave={handleCropSave}
        />
      ) : null}
    </AppModal>
  );
}
