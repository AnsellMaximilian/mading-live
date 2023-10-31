import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/schema";
import { UserWithProfile } from "@/lib/types";
import { usePathname, useRouter } from "next/navigation";

export interface UserContextData {
  currentUser: UserWithProfile | null;
  loading: boolean;
  setCurrentUser: (user: UserWithProfile | null) => void;
  logout: () => Promise<void>;
}

export const UserContext = createContext<UserContextData>({
  currentUser: null,
  loading: true,
  setCurrentUser: () => {},
  logout: async () => {},
});

export const UserContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<UserWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();
  const router = useRouter();
  const currentRoute = usePathname();

  useEffect(() => {
    const unsub = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        if (
          currentRoute === "/auth/sign-in" ||
          currentRoute === "/auth/sign-up"
        ) {
          router.push("/communities");
        }
        const { data: profile } = await supabase
          .from("profiles")
          .select()
          .eq("id", session.user.id)
          .single();
        if (profile) {
          setCurrentUser({ ...session.user, profile });
        }
      } else {
        if (
          currentRoute.startsWith("/communities") ||
          currentRoute.startsWith("/profile")
        ) {
          router.push("/auth/sign-in");
        }
        setCurrentUser(null);
      }
    });
    return () => unsub.data.subscription.unsubscribe();
  }, [supabase]);

  const handleSetCurrentUser = (user: UserWithProfile | null) => {
    setCurrentUser(user);
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        loading,
        setCurrentUser: handleSetCurrentUser,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextData => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserContextProvider");
  }
  return context;
};
