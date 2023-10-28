"use client";

import Sidebar from "@/components/Sidebar";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AblyProvider, useChannel, usePresence } from "ably/react";
import { Realtime } from "ably";
import { UserContextProvider } from "@/context/UserContext";
import { CommunityContext } from "@/context/CommunityContext";
import { useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/schema";

import { Community } from "@/lib/types";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { UserNav } from "@/components/ui/user-nav";
import Notifications from "@/components/ui/notifications";

const client = new Realtime.Promise({
  authUrl: "http://localhost:3000/api/ably-auth",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  const { id } = useParams();
  const supabase = createClientComponentClient<Database>();
  const [loading, setLoading] = useState(false);

  const [community, setCommunity] = useState<Community | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("communities").select().eq("id", id);
      if (data && data.length > 0) {
        setCommunity(data[0]);
      } else {
      }
      setLoading(false);
    })();
  }, []);
  return (
    <UserContextProvider>
      <CommunityContext.Provider
        value={{
          community,
          loading,
          setCommunity,
        }}
      >
        <AblyProvider client={client}>
          <div className="flex-col">
            <div className="flex h-full">
              <Sidebar />
              <main className="grow h-full flex flex-col max-h-full">
                <header className="px-3 py-1 border-b border-border h-[4.5rem] flex items-center">
                  <div className="flex items-center grow">
                    <div className="ml-auto flex items-center gap-2">
                      <Notifications />
                      <UserNav />
                    </div>
                  </div>
                </header>
                <div className="grow flex flex-col">{children}</div>
              </main>
            </div>
          </div>
        </AblyProvider>
      </CommunityContext.Provider>
    </UserContextProvider>
  );
}