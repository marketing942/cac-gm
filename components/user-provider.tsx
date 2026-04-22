"use client";

import { createContext, useContext } from "react";

interface UserContextValue {
  email: string | null;
  isAdmin: boolean;
}

const UserContext = createContext<UserContextValue>({ email: null, isAdmin: false });

export function UserProvider({
  email,
  isAdmin,
  children,
}: {
  email: string | null;
  isAdmin: boolean;
  children: React.ReactNode;
}) {
  return (
    <UserContext.Provider value={{ email, isAdmin }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  return useContext(UserContext);
}
