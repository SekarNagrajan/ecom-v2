// Modified by sekar nagarajan (2026-08-21)
import { useAuthStore } from './auth.store';

export function usePermission() {
  const user = useAuthStore((state) => state.user);

  const can = (capabilityCode: string): boolean => {
    if (!user) return false;
    // Legacy sessionAdmin == "Y" / USER_ROLL_ADMIN == "Y" bypass rule:
    // Grants unrestricted access across all portal capabilities
    if (user.role === 'ADMIN' || user.isSessionAdmin) return true;
    return user.capabilities.includes(capabilityCode);
  };

  return {
    can,
    capabilities: user?.capabilities || [],
    role: user?.role,
    isSessionAdmin: Boolean(user?.isSessionAdmin),
  };
}
