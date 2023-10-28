"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Database } from "@/lib/schema";
import { useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@/context/UserContext";
import { Loader2 } from "lucide-react";
import { useCommunity } from "@/context/CommunityContext";

export default function InvitationPage() {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const { community } = useCommunity();
  const [invitations, setInvitations] = useState<
    Database["public"]["Tables"]["community_invitations"]["Row"][]
  >([]);
  const { currentUser } = useUser();
  const supabase = createClientComponentClient<Database>();
  useEffect(() => {
    (async () => {
      if (currentUser) {
        setIsLoading(true);
        const { data: invitations } = await supabase
          .from("community_invitations")
          .select()
          .eq("community_id", id)
          .eq("user_id", currentUser.id);
        if (invitations) {
          setInvitations(invitations);
        }
        setIsLoading(false);
      }
    })();
  }, [currentUser]);

  return (
    <div className="h-screen flex items-center justify-center bg-secondary">
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : invitations.length > 0 && community ? (
        <Card className="w-[400px] max-w-full">
          <CardHeader>
            <CardTitle>Community Invitation</CardTitle>
            <CardDescription>
              You have been invited to join the &quot;{community.name}&quot;
              community.
            </CardDescription>
          </CardHeader>
          <CardContent></CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline">Deny</Button>
            <Button>Accept</Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="w-[400px] max-w-full">
          <CardHeader>
            <CardTitle>
              You don&apos;t have any invitations for this community.
            </CardTitle>
            <CardDescription>
              Ask a community owner or admin member to invite you via your email
              address.
            </CardDescription>
          </CardHeader>
          <CardContent></CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline">Close</Button>
            <Button>Okay</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
