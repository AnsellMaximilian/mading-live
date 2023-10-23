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

export interface UserContextData {
  currentUser: User | null;
  loading: boolean;
  setCurrentUser: (user: User | null) => void;
}

export const UserContext = createContext<UserContextData>({
  currentUser: null,
  loading: true,
  setCurrentUser: () => {},
});

export const UserContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setCurrentUser(session.user);
      } else {
        setCurrentUser(null);
      }
    })();
  }, []);

  const handleSetCurrentUser = (user: User | null) => {
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
