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

export interface UserContextData {
  currentUser: UserWithProfile | null;
  loading: boolean;
  setCurrentUser: (user: UserWithProfile | null) => void;
}

export const UserContext = createContext<UserContextData>({
  currentUser: null,
  loading: true,
  setCurrentUser: () => {},
});

export const UserContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<UserWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const unsub = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("AUTH STATE CHANGE DETECTED");
      if (session) {
        console.log("SESSION DETECTED");

        const { data: profile } = await supabase
          .from("profiles")
          .select()
          .eq("id", session.user.id)
          .single();
        if (profile) {
          setCurrentUser({ ...session.user, profile });
        }
      } else {
        console.log("SESSION MISSING");

        setCurrentUser(null);
      }
    });
    return () => unsub.data.subscription.unsubscribe();
  }, []);

  const handleSetCurrentUser = (user: UserWithProfile | null) => {
    setCurrentUser(user);
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        loading,
        setCurrentUser: handleSetCurrentUser,
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
