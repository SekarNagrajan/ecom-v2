// Created by Sekar Nagarajan (2026-08-26 15:06)
import type {
  CreateSubUserPayload,
  SubUser,
  UserLimitResponse,
} from "../types/user-creation.types";

export const USC_ALLOWED_USER_LIMIT = 5;

/** In-memory seed — MSW handlers + mock API share this source. */
export const MOCK_SUB_USERS: SubUser[] = [
  {
    id: "sub-1",
    loginName: "APEX_LOGISTICS_OP1",
    firstName: "Sarah",
    lastName: "Conner",
    email: "sarah.c@apexlogistics.com",
    companyName: "Apex Logistics Global",
    custCountryCode: "+1",
    custPhoneCode: "212",
    custPhoneNo: "555-0199",
    mobileCode: "+1",
    mobileNo: "555-0122",
    defLanguage: "en",
    prefLanguage: "en",
    isActive: true,
    createdDate: "2026-08-15",
    allowedModules: ["SCH", "TRK", "BKG", "SI"],
  },
  {
    id: "sub-2",
    loginName: "APEX_LOGISTICS_OP2",
    firstName: "Michael",
    lastName: "Vance",
    email: "m.vance@apexlogistics.com",
    companyName: "Apex Logistics Global",
    custCountryCode: "+1",
    custPhoneCode: "212",
    custPhoneNo: "555-0198",
    mobileCode: "+1",
    mobileNo: "555-0123",
    defLanguage: "en",
    prefLanguage: "en",
    isActive: true,
    createdDate: "2026-08-18",
    allowedModules: ["SCH", "TRK", "BL"],
  },
];

export let mockSubUsers: SubUser[] = MOCK_SUB_USERS.map((row) => ({
  ...row,
  allowedModules: [...row.allowedModules],
}));

export function resetMockSubUsers() {
  mockSubUsers = MOCK_SUB_USERS.map((row) => ({
    ...row,
    allowedModules: [...row.allowedModules],
  }));
}

export function getMockUserLimit(): UserLimitResponse {
  const currentlyAllocated = mockSubUsers.length;
  const remainingSlots = Math.max(
    0,
    USC_ALLOWED_USER_LIMIT - currentlyAllocated,
  );
  return {
    allowedUserLimit: USC_ALLOWED_USER_LIMIT,
    currentlyAllocated,
    remainingSlots,
    limitReached: currentlyAllocated >= USC_ALLOWED_USER_LIMIT,
  };
}

export function createMockSubUser(
  payload: CreateSubUserPayload,
): { ok: true; subUser: SubUser } | { ok: false; message: string } {
  if (mockSubUsers.length >= USC_ALLOWED_USER_LIMIT) {
    return {
      ok: false,
      message: "Creation of user profile limit has been reached",
    };
  }

  const subUser: SubUser = {
    id: `sub-${Date.now()}`,
    loginName: payload.loginName,
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    companyName: payload.companyName,
    custCountryCode: payload.custCountryCode ?? "+1",
    custPhoneCode: payload.custPhoneCode ?? "212",
    custPhoneNo: payload.custPhoneNo,
    mobileCode: payload.mobileCode ?? "+1",
    mobileNo: payload.mobileNo || "",
    defLanguage: payload.defLanguage ?? "en",
    prefLanguage: payload.prefLanguage ?? "en",
    isActive: true,
    createdDate: new Date().toISOString().slice(0, 10),
    allowedModules: payload.allowedModules ?? ["SCH", "TRK"],
  };

  mockSubUsers = [...mockSubUsers, subUser];
  return { ok: true, subUser };
}

export function toggleMockSubUserStatus(
  id: string,
  active: boolean,
): SubUser | undefined {
  mockSubUsers = mockSubUsers.map((u) =>
    u.id === id ? { ...u, isActive: active } : u,
  );
  return mockSubUsers.find((u) => u.id === id);
}
