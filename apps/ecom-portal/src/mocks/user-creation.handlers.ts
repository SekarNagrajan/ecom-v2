// Modified by Antigravity (2026-08-21)
import { http, HttpResponse } from 'msw';
import type { SubUser } from '../features/user-creation/types/user-creation.types';

let subUsersStore: SubUser[] = [
  {
    id: 'sub-1',
    loginName: 'APEX_LOGISTICS_OP1',
    firstName: 'Sarah',
    lastName: 'Conner',
    email: 'sarah.c@apexlogistics.com',
    companyName: 'Apex Logistics Global',
    custCountryCode: '+1',
    custPhoneCode: '212',
    custPhoneNo: '555-0199',
    mobileCode: '+1',
    mobileNo: '555-0122',
    defLanguage: 'en',
    prefLanguage: 'en',
    isActive: true,
    createdDate: '2026-08-15',
    allowedModules: ['SCH', 'TRK', 'BKG', 'SI'],
  },
  {
    id: 'sub-2',
    loginName: 'APEX_LOGISTICS_OP2',
    firstName: 'Michael',
    lastName: 'Vance',
    email: 'm.vance@apexlogistics.com',
    companyName: 'Apex Logistics Global',
    custCountryCode: '+1',
    custPhoneCode: '212',
    custPhoneNo: '555-0198',
    mobileCode: '+1',
    mobileNo: '555-0123',
    defLanguage: 'en',
    prefLanguage: 'en',
    isActive: true,
    createdDate: '2026-08-18',
    allowedModules: ['SCH', 'TRK', 'BL'],
  },
];

const ALLOWED_USER_LIMIT = 5;

export const userCreationHandlers = [
  http.get('/api/v1/user-creation/sub-users', () => {
    return HttpResponse.json(subUsersStore);
  }),

  http.get('/api/v1/user-creation/limit', () => {
    const currentlyAllocated = subUsersStore.length;
    const remainingSlots = Math.max(0, ALLOWED_USER_LIMIT - currentlyAllocated);
    return HttpResponse.json({
      allowedUserLimit: ALLOWED_USER_LIMIT,
      currentlyAllocated,
      remainingSlots,
      limitReached: currentlyAllocated >= ALLOWED_USER_LIMIT,
    });
  }),

  http.post('/api/v1/user-creation/sub-users', async ({ request }) => {
    const body = (await request.json()) as Partial<SubUser> & { password?: string };

    if (subUsersStore.length >= ALLOWED_USER_LIMIT) {
      return HttpResponse.json(
        { success: false, message: 'Creation of user profile limit has been reached' },
        { status: 400 }
      );
    }

    const newSubUser: SubUser = {
      id: `sub-${Date.now()}`,
      loginName: body.loginName || 'SUB_USER',
      firstName: body.firstName || 'First',
      lastName: body.lastName || 'Last',
      email: body.email || 'user@company.com',
      companyName: body.companyName || 'Apex Logistics Global',
      custCountryCode: body.custCountryCode || '+1',
      custPhoneCode: body.custPhoneCode || '212',
      custPhoneNo: body.custPhoneNo || '555-0000',
      mobileCode: body.mobileCode || '+1',
      mobileNo: body.mobileNo || '',
      defLanguage: body.defLanguage || 'en',
      prefLanguage: body.prefLanguage || 'en',
      isActive: true,
      createdDate: new Date().toISOString().split('T')[0],
      allowedModules: body.allowedModules || ['SCH', 'TRK'],
    };

    subUsersStore.push(newSubUser);

    return HttpResponse.json({
      success: true,
      message: 'User profile has been created successfully',
      subUser: newSubUser,
    });
  }),

  http.patch('/api/v1/user-creation/sub-users/:id/status', async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as { active: boolean };

    subUsersStore = subUsersStore.map((u) => (u.id === id ? { ...u, isActive: body.active } : u));
    const updated = subUsersStore.find((u) => u.id === id);

    return HttpResponse.json(updated);
  }),
];
