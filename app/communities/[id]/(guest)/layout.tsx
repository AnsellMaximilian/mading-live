"use client";

import Sidebar from "@/components/Sidebar";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AblyProvider, useChannel, usePresence } from "ably/react";
import { Realtime } from "ably";
import { UserContextProvider, useUser } from "@/context/UserContext";
import {
  CommunityContext,
  CommunityContextProvider,
} from "@/context/CommunityContext";
import { useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/schema";

import { Community } from "@/lib/types";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { id } = useParams();
  const supabase = createClientComponentClient<Database>();
  const [loading, setLoading] = useState(false);
  return <CommunityContextProvider>{children}</CommunityContextProvider>;
}
