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
import { Community } from "@/lib/types";
import { useParams } from "next/navigation";

export interface CommunityContextData {
  community: Community | null;
  loading: boolean;
  setCommunity: (community: Community | null) => void;
}

export const CommunityContext = createContext<CommunityContextData>({
  community: null,
  loading: true,
  setCommunity: () => {},
});

export const CommunityContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { id } = useParams();

  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("communities").select().eq("id", id);
      if (data && data.length > 0) {
        setCommunity(data[0]);
      } else {
        setCommunity(null);
      }
    })();
  }, []);

  return (
    <CommunityContext.Provider
      value={{
        community,
        loading,
        setCommunity,
      }}
    >
      {children}
    </CommunityContext.Provider>
  );
};

export const useCommunity = (): CommunityContextData => {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error(
      "useCommunity must be used within a CommunityContextProvider"
    );
  }
  return context;
};
