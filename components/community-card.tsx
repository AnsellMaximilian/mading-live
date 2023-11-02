"use client";

import { Community } from "@/lib/types";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Database } from "@/lib/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useUser } from "@/context/UserContext";
import { Loader2 } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

type Props = {
  community: Database["public"]["Tables"]["communities"]["Row"];
  handleDelete: (id: string) => Promise<void>;
};

export default function CommunityCard({ community, handleDelete }: Props) {
  const { currentUser } = useUser();

  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const handleDeleteCommunity = async () => {
    setIsDeleteLoading(true);
    await handleDelete(community.id);

    setIsDeleteLoading(false);
  };
  return (
    <Card className="">
      <CardHeader>
        <CardTitle>{community.name}</CardTitle>
        <CardDescription>
          {community.description ? community.description : "No description."}
        </CardDescription>
      </CardHeader>
      <CardContent>You are a member of this community.</CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Dialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <DialogTrigger asChild>
            {community.owner_id === currentUser?.id && (
              <Button variant="destructive">Delete</Button>
            )}
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirm Delete?</DialogTitle>
              <DialogDescription>
                Deleting this community will also remove all of its data, such
                as posts, surveys, etc.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button type="submit">Cancel</Button>
              </DialogClose>
              <Button
                variant="destructive"
                onClick={handleDeleteCommunity}
                disabled={isDeleteLoading}
              >
                {isDeleteLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Link href={`/communities/${community.id}/dashboard`} className="">
          <Button>View</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
