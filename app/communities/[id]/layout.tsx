"use client";

import Sidebar from "@/components/Sidebar";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AblyProvider, useChannel, usePresence } from "ably/react";
import { Realtime } from "ably";
import { UserContextProvider } from "@/context/UserContext";

const client = new Realtime.Promise({
  authUrl: "http://localhost:3000/api/ably-auth",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <UserContextProvider>
      <AblyProvider client={client}>
        <div className="h-screen flex flex-col">
          <div className="flex h-full">
            <Sidebar />
            <main className="grow h-full flex flex-col max-h-full">
              <header className="px-3 py-1 border-b border-border h-[4.5rem] flex items-center">
                <div className="flex items-center grow">
                  <Avatar className="ml-auto w-8 h-8">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>AM</AvatarFallback>
                  </Avatar>
                </div>
              </header>
              <div className="grow flex flex-col">{children}</div>
            </main>
          </div>
        </div>
      </AblyProvider>
    </UserContextProvider>
  );
}
