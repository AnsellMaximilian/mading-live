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

export default function Notifications() {
  const { notifications } = useNotifications();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <div className="h-2 w-2 rounded-full bg-red-600 absolute top-2 right-2"></div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <div className="p-4 bg-secondary font-semibold tracking-tight border-b border-border text-sm">
          Notifications
        </div>
        <div className="flex flex-col">
          {notifications.map((notification) => {
            const href =
              notification.type === "community_invitation"
                ? `/communities/${notification.community_id}/invitation`
                : "/";

            return (
              <Link
                href={href}
                key={notification.id}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "font-normal text-left justify-start h-auto after:content-[''] after:absolute after:left-2 relative after:h-1 after:w-1 after:rounded-full after:bg-red-600"
                )}
              >
                {notification.title}
              </Link>
            );
          })}

          <Button
            variant="ghost"
            className="font-normal text-left justify-start h-auto after:content-[''] after:absolute after:left-2 relative after:h-1 after:w-1 after:rounded-full after:bg-red-600"
          >
            You just logged in.
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
