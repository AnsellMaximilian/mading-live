"use client";

import Sidebar from "@/components/Sidebar";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AblyProvider, useChannel, usePresence } from "ably/react";
import { Realtime } from "ably";
import { UserContextProvider } from "@/context/UserContext";
import Spaces from "@ably/spaces";
import { SpaceProvider, SpacesProvider } from "@ably/spaces/react";
import { NotificationProvider } from "@/context/NotificationContext";

const client = new Realtime.Promise({
  authUrl: `${
    process.env.MODE === "production"
      ? "https://mading-live.vercel.app"
      : "http://localhost:3000"
  }/api/ably-auth`,
});
const spaces = new Spaces(client);

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AblyProvider client={client}>
      <SpacesProvider client={spaces}>
        <SpaceProvider name={`mading-live-app`}>
          <UserContextProvider>
            <NotificationProvider>{children}</NotificationProvider>
          </UserContextProvider>
        </SpaceProvider>
      </SpacesProvider>
    </AblyProvider>
  );
}
