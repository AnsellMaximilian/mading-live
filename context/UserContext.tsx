import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  createClientComponentClient,
  User,
} from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/schema";
import { UserWithProfile } from "@/lib/types";
import { usePathname, useRouter } from "next/navigation";

export interface UserContextData {
  currentUser: UserWithProfile | null;
  loading: boolean;
  setCurrentUser: (user: UserWithProfile | null) => void;
  handleSetUserWithProfile: (user: User) => Promise<void>;
  logout: () => Promise<void>;
}

export const UserContext = createContext<UserContextData>({
  currentUser: null,
  loading: true,
  setCurrentUser: () => {},
  handleSetUserWithProfile: async () => {},
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
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
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
    })();
  }, [supabase]);

  const handleSetCurrentUser = (user: UserWithProfile | null) => {
    setCurrentUser(user);
  };

  const handleSetUserWithProfile = async (user: User) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select()
      .eq("id", user.id)
      .single();
    if (profile) {
      setCurrentUser({ ...user, profile });
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    router.push("/auth/sign-in");
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        loading,
        setCurrentUser: handleSetCurrentUser,
        handleSetUserWithProfile,
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
