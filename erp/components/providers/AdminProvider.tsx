"use client";

import { createContext, useContext, type ReactNode } from "react";

type AdminInfo = {
  id: string;
  email: string;
  role: string;
  displayName: string;
} | null;

const AdminContext = createContext<AdminInfo>(null);

export const AdminProvider = ({ admin, children }: { admin: AdminInfo; children: ReactNode }) => (
  <AdminContext.Provider value={admin}>{children}</AdminContext.Provider>
);

export const useAdmin = () => useContext(AdminContext);
