"use client";
import { createContext, useContext } from "react";

type PermissionContextType = {
  permissions: string[];
};

export const PermissionContext = createContext<PermissionContextType>({
  permissions: [],
});

export function PermissionProvider({
  children,
  permissions,
}: {
  readonly children: React.ReactNode;
  readonly permissions: string[];
}) {
  return (
    <PermissionContext.Provider value={{ permissions }}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionContext);

  const hasPermission = (permission: string) => {
    return context.permissions.includes(permission);
  };

  return {
    hasPermission,
  };
}
