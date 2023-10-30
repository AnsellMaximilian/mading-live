import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2, MailPlus, User } from "lucide-react";

import {
  LayoutDashboard,
  MessagesSquare,
  CalendarDays,
  Vote,
  Settings,
  Users,
} from "lucide-react";
import ActiveLink from "./ui/active-link";
import { HTMLAttributes } from "react";
import { useCommunity } from "@/context/CommunityContext";
import { useUser } from "@/context/UserContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SidebarProps extends HTMLAttributes<HTMLDivElement> {}

export default function ProfileSidebar({ className }: SidebarProps) {
  const { currentUser, loading } = useUser();
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
            <User size={24} className="mr-2" />
            <h2 className="hidden md:block text-lg font-semibold tracking-tight">
              {currentUser ? (
                currentUser.profile.username
              ) : (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
            </h2>
          </div>

          <div className="space-y-1">
            <ActiveLink
              href={`/profile`}
              className="block rounded-md"
              activeClass="bg-accent text-accent-foreground"
            >
              <Button
                variant="ghost"
                className="flex w-full justify-start py-4 h-auto"
              >
                <User size={24} className="mr-2" />
                <div className="hidden md:flex flex-col items-start">
                  <span>User Profile</span>
                  <span className="text-xs text-muted-foreground hidden 2xl:block text-left">
                    View and update your profile.
                  </span>
                </div>
              </Button>
            </ActiveLink>
            <ActiveLink
              href={`/communities`}
              className="block rounded-md"
              activeClass="bg-accent text-accent-foreground"
            >
              <Button
                variant="ghost"
                className="flex w-full justify-start py-4 h-auto"
              >
                <Users size={24} className="mr-2" />
                <div className="hidden md:flex flex-col items-start">
                  <span>Communities</span>
                  <span className="text-xs text-muted-foreground hidden 2xl:block text-left">
                    View pending invitations.
                  </span>
                </div>
              </Button>
            </ActiveLink>
            <ActiveLink
              href={`/profile/invitations`}
              className="block rounded-md"
              activeClass="bg-accent text-accent-foreground"
            >
              <Button
                variant="ghost"
                className="flex w-full justify-start py-4 h-auto"
              >
                <MailPlus size={24} className="mr-2" />
                <div className="hidden md:flex flex-col items-start">
                  <span>Invitations</span>
                  <span className="text-xs text-muted-foreground hidden 2xl:block text-left">
                    View pending invitations.
                  </span>
                </div>
              </Button>
            </ActiveLink>
          </div>
        </div>
      </div>
    </div>
  );
}
