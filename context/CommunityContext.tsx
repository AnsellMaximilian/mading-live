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
import { Community, CommunityMember } from "@/lib/types";
import { useParams } from "next/navigation";
import { Database } from "@/lib/schema";

export interface CommunityContextData {
  community: Community | null;
  loading: boolean;
  setCommunity: (community: Community | null) => void;
  invitations: Database["public"]["Tables"]["community_invitations"]["Row"][];
}

export const CommunityContext = createContext<CommunityContextData>({
  community: null,
  loading: true,
  setCommunity: () => {},
  invitations: [],
});

export const CommunityContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { id } = useParams();
  const supabase = createClientComponentClient<Database>();
  const [loading, setLoading] = useState(false);

  const [community, setCommunity] = useState<Community | null>(null);
  const [invitations, setInvitations] = useState<
    Database["public"]["Tables"]["community_invitations"]["Row"][]
  >([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: community, error } = await supabase
        .from("communities")
        .select("*, community_members(*)")
        .eq("id", id)
        .single();

      if (community) {
        const { data: members } = await supabase
          .from("profiles")
          .select()
          .in(
            "id",
            community.community_members.map((membership) => membership.user_id)
          );
        if (members) {
          setCommunity({
            ...community,
            members: members.map((m) => ({
              ...m,
              is_admin: !!community.community_members.find(
                (cm) => cm.user_id === m.id
              )?.is_admin,
            })),
          });
        }
      }
      setLoading(false);
    })();
  }, [id, supabase]);

  useEffect(() => {
    (async () => {
      if (community) {
        const { data: invitations } = await supabase
          .from("community_invitations")
          .select()
          .eq("community_id", community.id);

        if (invitations) setInvitations(invitations);
      }
    })();
  }, [community, supabase]);

  return (
    <CommunityContext.Provider
      value={{
        community,
        loading,
        setCommunity,
        invitations,
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
