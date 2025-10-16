import { memo } from "react";
import AdminPermissionDenied from "@/components/AdminPermissionDenied";
import useModulePermission from "@/customHooks/useModulePermission.js";

const withPermission = (WrappedComponent, module, action) => {
  const WithPermissionComponent = (props) => {
    const { hasPermission } = useModulePermission();

    console.log(
      `withPermission: module=${module}, action=${action}, hasPermission=${hasPermission(
        module,
        action
      )}`
    );

    return hasPermission(module, action) ? (
      <WrappedComponent {...props} />
    ) : (
      <AdminPermissionDenied />
    );
  };

  WithPermissionComponent.displayName = `WithPermission(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  // Memoize to prevent re-renders unless props change
  return memo(WithPermissionComponent);
};

export default withPermission;
