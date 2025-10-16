import { getAdminLoginData, getAdminModulePermission } from '@/utils/admin.auth';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

/**
 * Custom hook to check if a user has permission(s) for a matchedModule 
 * @returns {Function} hasPermission(identifier: string, actions: string|string[]): boolean
 */
const useModulePermission = () => {
  const profile = useSelector((state) => state?.adminAuth?.user?.profile);
  const adminId = getAdminLoginData()?.id || 0;

  const modulePermissions = useMemo(() => {
    return profile?.modulePermissions || getAdminModulePermission();
  }, [profile]);

  const isPermissionLoading = !Array.isArray(profile?.modulePermissions);

  const hasPermission = useCallback(
    (identifier, actions) => {
      if (adminId === 1) return true; // Allow all to main super admin
      if (!identifier || !actions) return false;

      const matchedModule = modulePermissions.find(
        (mod) => mod.identifier === identifier
      );

      if (!matchedModule?.allowed_actions) return false; // not allow if not found matchedModule 

      let allowedActions = [];
      try {
        allowedActions = JSON.parse(matchedModule.allowed_actions);
      } catch (err) {
        console.warn(`Invalid JSON in allowed_actions for ${identifier}`, err);
        return false;
      }

      const requiredActions = Array.isArray(actions) ? actions : [actions];
      return requiredActions.every((action) => allowedActions.includes(action));
    },
    [modulePermissions, adminId]
  );

  return { hasPermission, isPermissionLoading };
};

export default useModulePermission;
