"use client";

import {
  createContext,
  type ReactNode,
  useContext,
} from "react";

const PortalPermissionsContext = createContext(false);

export function PortalPermissionsProvider({
  canEdit,
  children,
}: {
  canEdit: boolean;
  children: ReactNode;
}) {
  return (
    <PortalPermissionsContext.Provider value={canEdit}>
      {children}
    </PortalPermissionsContext.Provider>
  );
}

export function useCanEditPortal() {
  return useContext(PortalPermissionsContext);
}
