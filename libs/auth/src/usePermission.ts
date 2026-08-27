// Modified by Sekar Nagarajan (2026-08-27 11:25)
import { useAuthStore } from './auth.store';

export function usePermission() {
  const user = useAuthStore((state) => state.user);

  const can = (capabilityCode: string): boolean => {
    if (!user) return false;
    if (user.role === 'ADMIN' || user.isSessionAdmin || user.isImpersonating) {
      return true;
    }
    return user.capabilities.includes(capabilityCode);
  };

  const isAdmin = (): boolean => user?.role === 'ADMIN';

  const isVendor = (): boolean =>
    user?.role === 'VENDOR' || user?.role === 'ADMIN';

  const isSuperuser = (): boolean =>
    Boolean(user?.isSessionAdmin) || user?.role === 'ADMIN';

  const isImpersonating = (): boolean => Boolean(user?.isImpersonating);

  const isTenantAdmin = (): boolean =>
    Boolean(user?.isTenantAdmin) || user?.role === 'ADMIN';

  return {
    can,
    capabilities: user?.capabilities || [],
    role: user?.role,
    loginType: user?.loginType,
    adminUserType: user?.adminUserType,
    isSessionAdmin: Boolean(user?.isSessionAdmin),
    isAdmin,
    isVendor,
    isSuperuser,
    isImpersonating,
    isTenantAdmin,
  };
}
