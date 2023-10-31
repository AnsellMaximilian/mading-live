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
import { Badge } from "./ui/badge";
import { useUser } from "@/context/UserContext";
import { Loader2 } from "lucide-react";
import { useCommunity } from "@/context/CommunityContext";

type Props = {
  post: Database["public"]["Tables"]["posts"]["Row"];
  handleDelete: (id: string) => Promise<void>;
};

export default function PostCard({ post, handleDelete }: Props) {
  const { currentUser } = useUser();
  const { community } = useCommunity();
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const handleDeleteSurvey = async () => {
    setIsDeleteLoading(true);
    await handleDelete(post.id);
    setIsDeleteLoading(false);
  };

  return (
    <Card className="">
      <CardHeader>
        <CardTitle>{post.title}</CardTitle>
        {/* <CardDescription>
          {survey.description ? survey.description : "No description."}
        </CardDescription> */}
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-line">{post.content}</div>
        <div className="mt-2 flex justify-end">
          <div className="text-muted-foreground text-sm">
            Post by{" "}
            {community?.members.find((m) => m.id === post.author_id)?.username}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {post.author_id === currentUser?.id && (
          <Button
            variant="destructive"
            onClick={handleDeleteSurvey}
            disabled={isDeleteLoading}
          >
            {isDeleteLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Delete
          </Button>
        )}
        {/* <Button variant="outline">Cancel</Button> */}
        {/* <Link
          href={`/communities/${post.community_id}/posts/${post.id}`}
          className=""
        >
          <Button>View</Button>
        </Link> */}
      </CardFooter>
    </Card>
  );
}
