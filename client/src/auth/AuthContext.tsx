import { createContext, useContext } from "react";
import { useMe, type Me } from "./useMe";

type AuthState = { me: Me | null; loading: boolean; isAdmin: boolean };

// DO NOT export this context object (keeps this file a clean refresh boundary)
const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const state = useMe(); // { me, loading, isAdmin }
  return (
    <div>
      <div
        className={
          state.me?.isAdmin
            ? "bg-red-600 text-white"
            : "bg-blue-600  text-white"
        }
      >
        {state.me?.name}
      </div>
      <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
    </div>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}
