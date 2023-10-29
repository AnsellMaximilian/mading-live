"use client";

import Sidebar from "@/components/Sidebar";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AblyProvider, useChannel, usePresence } from "ably/react";
import { Realtime } from "ably";
import { UserContextProvider } from "@/context/UserContext";
import { NotificationProvider } from "@/context/NotificationContext";

const client = new Realtime.Promise({
  authUrl: "http://localhost:3000/api/ably-auth",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AblyProvider client={client}>
      <UserContextProvider>
        <NotificationProvider>{children}</NotificationProvider>
      </UserContextProvider>
    </AblyProvider>
  );
}
