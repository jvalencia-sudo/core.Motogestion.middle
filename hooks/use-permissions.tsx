"use client";
import { createContext, useContext } from "react";

type PermissionContextType = {
  permissions: string[];
  esAdmin: boolean;
};

export const PermissionContext = createContext<PermissionContextType>({
  permissions: [],
  esAdmin: false,
});

export function PermissionProvider({
  children,
  permissions,
  esAdmin = false,
}: {
  readonly children: React.ReactNode;
  readonly permissions: string[];
  readonly esAdmin?: boolean;
}) {
  return (
    <PermissionContext.Provider value={{ permissions, esAdmin }}>
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
    permissions: context.permissions,
    esAdmin: context.esAdmin,
  };
}
