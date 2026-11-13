// Created by Sekar Nagarajan (2026-09-08 15:20)
import type { Area } from "react-easy-crop";

const CROPPED_IMAGE_MIME_TYPE = "image/jpeg";
const CROPPED_IMAGE_QUALITY = 0.92;

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () =>
      reject(new Error("Failed to load the selected image")),
    );
    image.src = url;
  });
}

/**
 * Renders the cropped region of `imageSrc` onto an offscreen canvas and
 * exports it as a JPEG blob ready to upload.
 */
export async function getCroppedImageBlob(
  imageSrc: string,
  croppedAreaPixels: Area,
): Promise<Blob> {
  const image = await loadImage(imageSrc);

  const canvas = document.createElement("canvas");
  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas is not supported in this browser");
  }

  context.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to generate the cropped image"));
        }
      },
      CROPPED_IMAGE_MIME_TYPE,
      CROPPED_IMAGE_QUALITY,
    );
  });
}
