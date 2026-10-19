// Created by Sekar Nagarajan (2026-09-08 15:20)
import { http, HttpResponse } from "msw";

import {
  clearProfilePhoto,
  getProfilePhotoBytes,
  getProfilePhotoContentType,
  setProfilePhoto,
} from "./profile-photo.store";
import {
  ensureUserDbReady,
  persistUserDb,
} from "./fixture-api/user-persistence";

const OWN_PHOTO_URL = "/api/v1/user/profile/photo";

function delay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const profilePhotoHandlers = [
  http.get(OWN_PHOTO_URL, async () => {
    await delay();
    await ensureUserDbReady();

    const bytes = getProfilePhotoBytes();
    if (!bytes) {
      return new HttpResponse(null, { status: 404 });
    }

    return new HttpResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": getProfilePhotoContentType(),
      },
    });
  }),

  http.post(OWN_PHOTO_URL, async ({ request }) => {
    await delay(350); // ~350ms upload latency
    await ensureUserDbReady();

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
    setProfilePhoto(await file.arrayBuffer(), file.type || "image/jpeg");
    persistUserDb();

    return new HttpResponse(null, { status: 204 });
  }),

  http.delete(OWN_PHOTO_URL, async () => {
    await delay(180); // ~180ms delete latency
    await ensureUserDbReady();

    clearProfilePhoto();
    persistUserDb();

    return new HttpResponse(null, { status: 204 });
  }),
];
