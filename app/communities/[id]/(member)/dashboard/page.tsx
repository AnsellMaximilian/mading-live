"use client";

import React, { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAbly, useChannel } from "ably/react";
import type { Types } from "ably";
import { Plus, Users, Loader2, MailWarning, Wifi } from "lucide-react";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import moment from "moment";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useToast } from "@/components/ui/use-toast";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ChatMessage from "@/components/chat-message";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "@/lib/types";
import { useUser } from "@/context/UserContext";
import { useCommunity } from "@/context/CommunityContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/schema";
import { Badge } from "@/components/ui/badge";
import CommunityMembersList from "@/components/community-members-list";
import { useSpace, useMembers } from "@ably/spaces/react";

const formSchema = z.object({
  email: z.string().min(2, {
    message: "Email must be at least 2 characters.",
  }),
});

export default function DashboardPage() {
  const { currentUser } = useUser();
  const { toast } = useToast();

  const { community, invitations } = useCommunity();
  const supabase = createClientComponentClient<Database>();

  const [isInviteLoading, setIsInviteLoading] = useState(false);
  const inviteForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });
  const ablyClient = useAbly();
  const { members } = useMembers();

  async function sendInvite(values: z.infer<typeof formSchema>) {
    if (currentUser) {
      setIsInviteLoading(true);
      const { data: user } = await supabase
        .from("profiles")
        .select()
        .eq("email", values.email)
        .single();
      if (user && community) {
        const { data: invitation } = await supabase
          .from("community_invitations")
          .insert({
            user_id: user.id,
            community_id: community.id,
          })
          .select()
          .single();
        if (invitation) {
          const { data: notification } = await supabase
            .from("notifications")
            .insert({
              user_id: user.id,
              community_id: community.id,
              title: `You received an invitation to join the community "${community.name}"`,
              read: false,
              type: "community_invitation",
            })
            .select()
            .single();
          if (notification) {
            const notificationChannel = ablyClient.channels.get(
              `notifications:${user.id}`
            );
            notificationChannel.publish("add", notification);
          }

          toast({
            title: `Invitation sent!`,
            description: `Invitation sent to user with email ${values.email}`,
          });
        }
      }
      setIsInviteLoading(false);
    }

    inviteForm.reset({ email: "" });
  }

  return (
    <div className="h-[calc(100vh-4.5rem)] flex flex-col p-4 overflow-auto">
      <div className="flex-col md:flex">
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <div className="flex items-center space-x-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> Invite
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Invite User</DialogTitle>
                    <DialogDescription>
                      Invite user by their email.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...inviteForm}>
                    <form
                      onSubmit={inviteForm.handleSubmit(sendInvite)}
                      id="invite-form"
                    >
                      <div className="grid gap-4 py-4">
                        <FormField
                          control={inviteForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem className="grid grid-cols-4 items-center gap-4">
                              <FormLabel className="text-right">
                                Email
                              </FormLabel>

                              <FormControl>
                                <Input
                                  type="text"
                                  autoComplete="off"
                                  className="col-span-3"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </form>
                  </Form>

                  <DialogFooter>
                    <Button
                      disabled={isInviteLoading}
                      type="submit"
                      form="invite-form"
                    >
                      {isInviteLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Invite
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Members
                  </CardTitle>

                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {community?.members.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Members have joined.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pending Invites
                  </CardTitle>
                  <MailWarning className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {invitations.filter((inv) => inv.accepted === null).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Invites waiting for response.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Online Now
                  </CardTitle>
                  <Wifi className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {
                      members?.filter(
                        (m) =>
                          m.isConnected &&
                          community?.members.some(
                            (cm) => cm.id === m.profileData?.id
                          )
                      ).length
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Members who are live
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Now
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+573</div>
                  <p className="text-xs text-muted-foreground">
                    +201 since last hour
                  </p>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Members</CardTitle>
                  <CardDescription>
                    Your fellow community members.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {community && <CommunityMembersList community={community} />}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
