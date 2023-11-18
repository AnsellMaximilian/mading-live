import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createClientComponentClient,
  User,
} from "@supabase/auth-helpers-nextjs";
import { useChannel, useAbly } from "ably/react";

import { Community, CommunityMember } from "@/lib/types";
import { useParams } from "next/navigation";
import { Database } from "@/lib/schema";
import { useUser } from "./UserContext";
import { Types } from "ably";

export interface CommunityContextData {
  community: Community | null;
  loading: boolean;
  setCommunity: (community: Community | null) => void;
  invitations: Database["public"]["Tables"]["community_invitations"]["Row"][];
  sendMembersNotification: (
    title: string,
    contentId: string | null,
    communityId?: string,
    type?: Database["public"]["Tables"]["notifications"]["Insert"]["type"]
  ) => Promise<void>;
}

export const CommunityContext = createContext<CommunityContextData>({
  community: null,
  loading: true,
  setCommunity: () => {},
  invitations: [],
  sendMembersNotification: async () => {},
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

  const ablyClient = useAbly();
  const { currentUser } = useUser();

  const communityChannel = useMemo(() => {
    return ablyClient.channels.get(`community:${community?.id}`);
  }, [ablyClient.channels, community]);

  useEffect(() => {
    const listener = (ablyMessage: Types.Message) => {
      if (ablyMessage.name === "new_member") {
        const newMember: CommunityMember = ablyMessage.data;
        setCommunity((value) =>
          value
            ? {
                ...value,
                members: [...value.members, newMember],
              }
            : null
        );
      } else if (ablyMessage.name === "invitation") {
        const newInvitation: Database["public"]["Tables"]["community_invitations"]["Row"] =
          ablyMessage.data;
        setInvitations((prev) => [...prev, newInvitation]);
      } else if (ablyMessage.name === "invitation_remove") {
        setInvitations((prev) =>
          prev.filter((inv) => inv.id !== ablyMessage.data)
        );
      }
    };
    communityChannel.subscribe(listener);

    return () => {
      communityChannel.unsubscribe(listener);
    };
  }, [communityChannel]);

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

  const sendMembersNotification = async (
    title: string,
    contentId: string | null,
    communityId?: string,
    type?: Database["public"]["Tables"]["notifications"]["Insert"]["type"]
  ) => {
    if (community && community.members.length > 0) {
      const notifications: Database["public"]["Tables"]["notifications"]["Insert"][] =
        community.members
          .filter((m) => m.id !== currentUser?.id)
          .map((m) => ({
            user_id: m.id,
            title,
            community_id: community.id,
            type: type ? type : "info",
            content_id: contentId,
            description: "",
            read: false,
          }));

      const { data: createdNotifications } = await supabase
        .from("notifications")
        .insert(notifications)
        .select();
      if (createdNotifications) {
        createdNotifications.forEach((not) => {
          const notificationChannel = ablyClient.channels.get(
            `notifications:${not.user_id}`
          );
          notificationChannel.publish("add", not);
        });
      }
    }
  };

  return (
    <CommunityContext.Provider
      value={{
        community,
        loading,
        setCommunity,
        invitations,
        sendMembersNotification,
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
