import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

import {
  LayoutDashboard,
  MessagesSquare,
  CalendarDays,
  Vote,
  Settings,
  Users,
} from "lucide-react";
import ActiveLink from "./ui/active-link";
import { Community } from "@/lib/types";
import { HTMLAttributes } from "react";
import { useCommunity } from "@/context/CommunityContext";

interface SidebarProps extends HTMLAttributes<HTMLDivElement> {}

export default function Sidebar({ className }: SidebarProps) {
  const { community, loading } = useCommunity();
  return (
    <div
      className={cn(
        "pb-12 border-r border-border md:w-[275px] lg:w-[300px]",
        className
      )}
    >
      <div className="space-y-4">
        <div className="px-3 py-2">
          <div className="mb-2 p-4 flex items-center border-b border-border h-16">
            <Users size={24} className="mr-2" />
            <h2 className="hidden md:block text-lg font-semibold tracking-tight">
              {community ? (
                community.name
              ) : (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
            </h2>
          </div>

          {!loading && community ? (
            <div className="space-y-1">
              <ActiveLink
                href={`/communities/${community.id}/dashboard`}
                className="block rounded-md"
                activeClass="bg-accent text-accent-foreground"
              >
                <Button
                  variant="ghost"
                  className="flex w-full justify-start py-4 h-auto"
                >
                  <LayoutDashboard size={24} className="mr-2" />
                  <div className="hidden md:flex flex-col items-start">
                    <span>Overview</span>
                    <span className="text-xs text-muted-foreground hidden 2xl:block text-left">
                      Get an overview of your community.
                    </span>
                  </div>
                </Button>
              </ActiveLink>
              <ActiveLink
                href={`/communities/${community.id}/chat`}
                className="block rounded-md"
                activeClass="bg-accent text-accent-foreground"
              >
                <Button
                  variant="ghost"
                  className="flex w-full justify-start py-4 h-auto"
                >
                  <MessagesSquare size={24} className="mr-2" />
                  <div className="hidden md:flex flex-col items-start">
                    <span>Chat</span>
                    <span className="text-xs text-muted-foreground hidden 2xl:block text-left">
                      Converse with members.
                    </span>
                  </div>
                </Button>
              </ActiveLink>
              <ActiveLink
                href="/communities/dashboard"
                className="block rounded-md"
                activeClass="bg-accent text-accent-foreground"
              >
                <Button
                  variant="ghost"
                  className="flex w-full justify-start py-4 h-auto"
                >
                  <CalendarDays size={24} className="mr-2" />
                  <div className="hidden md:flex flex-col items-start">
                    <span>Events</span>
                    <span className="text-xs text-muted-foreground hidden 2xl:block text-left">
                      Manage your community events.
                    </span>
                  </div>
                </Button>
              </ActiveLink>
              <ActiveLink
                href="/communities/dashboard"
                className="block rounded-md"
                activeClass="bg-accent text-accent-foreground"
              >
                <Button
                  variant="ghost"
                  className="flex w-full justify-start py-4 h-auto"
                >
                  <Vote size={24} className="mr-2" />
                  <div className="hidden md:flex flex-col items-start">
                    <span>Survey</span>
                    <span className="text-xs text-muted-foreground hidden 2xl:block text-left">
                      Gauge opinions or vote on something.
                    </span>
                  </div>
                </Button>
              </ActiveLink>
              <ActiveLink
                href="/communities/dashboard"
                className="block rounded-md"
                activeClass="bg-accent text-accent-foreground"
              >
                <Button
                  variant="ghost"
                  className="flex w-full justify-start py-4 h-auto"
                >
                  <Settings size={24} className="mr-2" />
                  <div className="hidden md:flex flex-col items-start">
                    <span>Settings</span>
                    <span className="text-xs text-muted-foreground hidden 2xl:block text-left">
                      Update community settings.
                    </span>
                  </div>
                </Button>
              </ActiveLink>
            </div>
          ) : (
            <div className="p-4 flex items-center justify-center">
              <Loader2 className="mr-2 h-8 w-8 animate-spin" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
