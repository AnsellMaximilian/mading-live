import type { User } from "@supabase/auth-helpers-nextjs";
import { Database } from "./schema";
import { SpaceMember as AblySpaceMember } from "@ably/spaces";

export type Message = {
  id: string;
  username: string;
  content: string;
  time: string;
  userId: string;
};

export type SpaceMember = Omit<AblySpaceMember, "profileData"> & {
  profile: UserWithProfile;
};

export type Community = Database["public"]["Tables"]["communities"]["Row"] & {
  members: CommunityMember[];
};

export type UserWithProfile = User & {
  profile: Database["public"]["Tables"]["profiles"]["Row"];
};

export type CommunityMember =
  Database["public"]["Tables"]["profiles"]["Row"] & {
    is_admin: boolean;
  };
