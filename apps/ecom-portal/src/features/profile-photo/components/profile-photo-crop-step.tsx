// Created by Sekar Nagarajan (2026-09-08 15:20)
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Flex, Slider, theme } from "antd";
import { useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";

import { getCroppedImageBlob } from "../utils/crop-image.utils";

interface ProfilePhotoCropStepProps {
  imageSrc: string;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (blob: Blob) => void | Promise<void>;
}

const CROP_AREA_HEIGHT = 320;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;

export function ProfilePhotoCropStep({
  imageSrc,
  isSaving,
  onCancel,
  onSave,
}: ProfilePhotoCropStepProps) {
  const { token } = theme.useToken();
  const toast = useToast();
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCropComplete = (_croppedArea: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) {
      return;
    }

    setIsProcessing(true);
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels);
      await onSave(blob);
    } catch {
      toast.error("Failed to process the cropped image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Flex vertical gap={token.marginMD}>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: CROP_AREA_HEIGHT,
          background: token.colorBgLayout,
          borderRadius: token.borderRadiusLG,
          overflow: "hidden",
        }}
      >
        <Cropper
          aspect={1}
          crop={crop}
          cropShape="round"
          image={imageSrc}
          onCropChange={setCrop}
          onCropComplete={handleCropComplete}
          onZoomChange={setZoom}
          showGrid={false}
          zoom={zoom}
        />
      </div>

      <Slider
        max={MAX_ZOOM}
        min={MIN_ZOOM}
        onChange={setZoom}
        step={ZOOM_STEP}
        value={zoom}
      />

      <Flex justify="flex-end" gap={token.marginSM}>
        <AppButton
          disabled={isSaving || isProcessing}
          onClick={onCancel}
          type="default"
        >
          Cancel
        </AppButton>
        <AppButton
          loading={isSaving || isProcessing}
          onClick={() => void handleSave()}
          type="primary"
        >
          Save
        </AppButton>
      </Flex>
    </Flex>
  );
}
