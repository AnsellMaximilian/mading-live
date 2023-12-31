"use client";

import Sidebar from "@/components/Sidebar";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AblyProvider, useChannel, usePresence, useAbly } from "ably/react";
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
import Link from "next/link";
import { cn } from "@/lib/utils";
import { UserNav } from "@/components/ui/user-nav";
import Notifications from "@/components/ui/notifications";
import Spaces from "@ably/spaces";
import { SpaceProvider } from "@ably/spaces/dist/mjs/react";
import { useSpace, useMembers } from "@ably/spaces/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { id } = useParams();
  const { space } = useSpace((update) => {
    // console.log(update);
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { currentUser } = useUser();

  useEffect(() => {
    if (space && currentUser) {
      space.enter({ ...currentUser });
    }
  }, [space, currentUser]);

  return (
    <CommunityContextProvider>
      <div className="flex-col">
        <div className="flex h-full">
          <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
          <main className="grow h-full flex flex-col max-h-full overflow-x-hidden">
            <header className="px-3 py-1 border-b border-border h-[4.5rem] flex items-center">
              <div className="flex items-center grow">
                <Button
                  onClick={() => setSidebarOpen((prev) => !prev)}
                  variant="outline"
                  size="icon"
                  className={cn(
                    "transition-all duration-100 md:hidden",

                    sidebarOpen ? "ml-[4.5rem]" : "ml-0"
                  )}
                >
                  {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
                </Button>
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
    </CommunityContextProvider>
  );
}
