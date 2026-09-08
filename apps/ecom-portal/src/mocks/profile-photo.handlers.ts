// Created by Sekar Nagarajan (2026-09-08 15:20)
import { http, HttpResponse } from "msw";

const OWN_PHOTO_URL = "/api/v1/user/profile/photo";

/** Session-lifetime store — survives remounts for the mock session. */
let mockPhotoBytes: ArrayBuffer | null = null;
let mockPhotoContentType = "image/jpeg";

function delay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const profilePhotoHandlers = [
  http.get(OWN_PHOTO_URL, async () => {
    await delay();

    if (!mockPhotoBytes) {
      return new HttpResponse(null, { status: 404 });
    }

    return new HttpResponse(mockPhotoBytes, {
      status: 200,
      headers: {
        "Content-Type": mockPhotoContentType,
      },
    });
  }),

  http.post(OWN_PHOTO_URL, async ({ request }) => {
    await delay(350); // ~350ms upload latency

    const formData = await request.formData();
    const entry = formData.get("file");

    if (
      entry == null ||
      typeof entry === "string" ||
      typeof (entry as Blob).arrayBuffer !== "function"
    ) {
      return HttpResponse.json(
        { message: "Missing profile photo file" },
        { status: 400 },
      );
    }

    const file = entry as Blob;
    mockPhotoBytes = await file.arrayBuffer();
    mockPhotoContentType = file.type || "image/jpeg";

    return new HttpResponse(null, { status: 204 });
  }),

  http.delete(OWN_PHOTO_URL, async () => {
    await delay(180); // ~180ms delete latency

    mockPhotoBytes = null;
    mockPhotoContentType = "image/jpeg";

    return new HttpResponse(null, { status: 204 });
  }),
];
