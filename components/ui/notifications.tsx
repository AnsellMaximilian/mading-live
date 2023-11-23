"use client";

import React from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell, CheckIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useNotifications } from "@/context/NotificationContext";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/schema";
import { useUser } from "@/context/UserContext";
import { useChannel, useAbly } from "ably/react";
import { Types } from "ably";
import { useCommunity } from "@/context/CommunityContext";
import { ScrollArea } from "./scroll-area";

export default function Notifications() {
  const { notifications } = useNotifications();
  const supabase = createClientComponentClient<Database>();

  const router = useRouter();
  const { currentUser } = useUser();

  const ablyClient = useAbly();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />

          {notifications.length > 0 && (
            <div className="h-4 w-4 rounded-full bg-red-600 absolute top-1 right-1 text-white text-[9px] flex items-center justify-center">
              <span>{notifications.length}</span>
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <div className="p-4 bg-secondary font-semibold tracking-tight border-b border-border text-sm">
          Notifications
        </div>
        <div className="flex flex-col">
          {notifications.length <= 0 && (
            <div className="p-4 text-sm">No notifications.</div>
          )}
          <ScrollArea className={notifications.length > 6 ? "h-96" : ""}>
            {notifications.map((notification) => {
              return (
                <Button
                  key={notification.id}
                  onClick={async () => {
                    if (currentUser) {
                      const { data, error, count } = await supabase
                        .from("notifications")
                        .update({ read: true })
                        .eq("id", notification.id);

                      const notificationChannel = ablyClient.channels.get(
                        `notifications:${currentUser.id}`
                      );
                      notificationChannel.publish("remove", notification.id);
                      if (notification.type === "community_invitation") {
                        router.push("/profile/invitations");
                      } else if (notification.type === "survey_creation") {
                        router.push(
                          `/communities/${notification.community_id}/surveys/${notification.content_id}`
                        );
                      } else if (notification.type === "post_creation") {
                        router.push(
                          `/communities/${notification.community_id}/posts?postId=${notification.content_id}`
                        );
                      }
                    }
                  }}
                  variant="ghost"
                  className="font-normal text-left justify-start h-auto after:content-[''] after:absolute after:left-2 relative after:h-1 after:w-1 after:rounded-full after:bg-red-600"
                >
                  {notification.title}
                </Button>
              );
            })}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
