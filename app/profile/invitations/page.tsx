"use client";

import { useUser } from "@/context/UserContext";
import { Database } from "@/lib/schema";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Loader2 } from "lucide-react";
import { AblyProvider, useChannel, usePresence, useAbly } from "ably/react";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Invitations =
  (Database["public"]["Tables"]["community_invitations"]["Row"] & {
    communities: Database["public"]["Tables"]["communities"]["Row"] | null;
  })[];

export default function UserInvitationsPage() {
  const supabase = createClientComponentClient<Database>();
  const { currentUser } = useUser();
  const [invitations, setInvitations] = useState<Invitations>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResponseLoading, setIsResponseLoading] = useState(false);

  const ablyClient = useAbly();

  const handleRespond = async (
    invitation_id: string,
    response: boolean,
    community_id: string
  ) => {
    setIsResponseLoading(true);
    const { error } = await supabase
      .from("community_invitations")
      .update({ accepted: response })
      .eq("id", invitation_id);
    if (!error) {
      setInvitations((prev) => prev.filter((inv) => inv.id != invitation_id));

      const { data: members } = await supabase
        .from("community_members")
        .select()
        .eq("community_id", community_id)
        .neq("user_id", currentUser?.id);

      if (members) {
        const notifications: Database["public"]["Tables"]["notifications"]["Insert"][] =
          members.map((m) => ({
            user_id: m.user_id,
            title: "Someone jsut joined our community",
            community_id,
            type: "info",
            content_id: community_id,
            description: "",
            read: false,
          }));
        notifications.forEach((not) => {
          const notificationChannel = ablyClient.channels.get(
            `notifications:${not.user_id}`
          );
          notificationChannel.publish("add", not);
        });
      }
    }
    setIsResponseLoading(false);
  };

  useEffect(() => {
    (async () => {
      if (currentUser) {
        const { data: invitations } = await supabase
          .from("community_invitations")
          .select("*, communities(*)")
          .is("accepted", null)
          .eq("user_id", currentUser.id);
        if (invitations) {
          setInvitations(invitations);
        }
        setIsLoading(false);
      }
    })();
  }, [currentUser, supabase]);

  return (
    <div className="h-[calc(100vh-4.5rem)] flex flex-col overflow-y-auto">
      {isLoading ? (
        <div className="w-full h-full flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="p-4">
          {invitations.length > 0 ? (
            <div className="">
              <h2 className="text-3xl font-bold tracking-tight mb-2">
                Pending Invitations
              </h2>
              <div className="flex flex-col gap-2">
                {invitations.map((invitation) => {
                  return (
                    <div
                      key={invitation.id}
                      className="flex justify-between p-4 rounded-md border border-border items-center"
                    >
                      <div>
                        <h3 className="text-xl font-semibold leading-none tracking-tight">
                          {invitation.communities?.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {invitation.communities?.description
                            ? invitation.communities.description
                            : "No description"}
                        </p>
                      </div>
                      <div className="space-x-2">
                        <Button
                          disabled={isResponseLoading}
                          variant="outline"
                          onClick={() =>
                            handleRespond(
                              invitation.id,
                              false,
                              invitation.community_id
                            )
                          }
                        >
                          {isResponseLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Deny
                        </Button>
                        <Button
                          disabled={isResponseLoading}
                          onClick={() =>
                            handleRespond(
                              invitation.id,
                              true,
                              invitation.community_id
                            )
                          }
                        >
                          {isResponseLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Accept
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>You have no pending invitations</div>
          )}
        </div>
      )}
    </div>
  );
}
