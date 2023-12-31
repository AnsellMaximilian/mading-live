import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, ScrollText } from "lucide-react";

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
import Link from "next/link";

interface SidebarProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  setOpen: (value: boolean) => void;
}

export default function Sidebar({ className, open }: SidebarProps) {
  const { community, loading } = useCommunity();
  return (
    <div
      className={cn(
        "border-r border-border md:w-[275px] lg:w-[300px] shrink-0 fixed md:static md:left-auto z-50 bg-white inset-y-0 md:inset-y-auto transition-all duration-100 shadow-lg md:shadow-none",
        open ? "left-0" : "-left-56",
        className
      )}
    >
      <div className="space-y-4 h-full">
        <div className="px-1 md:px-3 py-2 h-full flex flex-col">
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
            <div className="space-y-1 grow">
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
              {/* <ActiveLink
                href={`/communities/${community.id}/events`}
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
              </ActiveLink> */}
              <ActiveLink
                href={`/communities/${community.id}/posts`}
                className="block rounded-md"
                activeClass="bg-accent text-accent-foreground"
              >
                <Button
                  variant="ghost"
                  className="flex w-full justify-start py-4 h-auto"
                >
                  <ScrollText size={24} className="mr-2" />
                  <div className="hidden md:flex flex-col items-start">
                    <span>Posts</span>
                    <span className="text-xs text-muted-foreground hidden 2xl:block text-left">
                      Post anything to your community members.
                    </span>
                  </div>
                </Button>
              </ActiveLink>
              <ActiveLink
                href={`/communities/${community.id}/surveys`}
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
                href={`/communities/${community.id}/settings`}
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
            <div className="p-4 flex items-center justify-center grow">
              <Loader2 className="mr-2 h-8 w-8 animate-spin" />
            </div>
          )}
          <div>
            <Link href={`/communities`} className="block rounded-md">
              <Button
                variant="ghost"
                className="flex w-full justify-start py-4 h-auto"
              >
                <ArrowLeft size={24} className="mr-2" />
                <div className="hidden md:flex flex-col items-start">
                  <span>Communities</span>
                  <span className="text-xs text-muted-foreground hidden 2xl:block text-left">
                    View all your communities.
                  </span>
                </div>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
