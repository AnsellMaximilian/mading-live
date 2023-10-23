"use client";

import Sidebar from "@/components/Sidebar";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AblyProvider, useChannel, usePresence } from "ably/react";
import { Realtime } from "ably";
import { UserContextProvider } from "@/context/UserContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <UserContextProvider>{children}</UserContextProvider>;
}
