"use client";

import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();
  
  return {
    user: session?.user || null,
    isLoading: status === "loading",
    isAuthenticated: !!session,
    logout: () => {
      // Auth.js handles logout through signOut
      // We'll update this when we update the components
    },
  };
} 