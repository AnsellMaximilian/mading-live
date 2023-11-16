"use client";

import { Database } from "@/lib/schema";
import { useParams, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/context/UserContext";
import { useCommunity } from "@/context/CommunityContext";
import { useChannel, useAbly } from "ably/react";
import { Types } from "ably";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Survey } from "../../surveys/page";

export default function SurveyPage() {
  const [post, setPost] = useState<
    Database["public"]["Tables"]["posts"]["Row"] | null
  >(null);
  const supabase = createClientComponentClient<Database>();
  const { postId } = useParams();
  const { currentUser } = useUser();
  const { community } = useCommunity();
  const ablyClient = useAbly();
  const { toast } = useToast();

  const postChannel = useMemo(() => {
    return ablyClient.channels.get(`post:${post?.id}`);
  }, [post, ablyClient.channels]);

  useEffect(() => {
    const listener = (ablyMessage: Types.Message) => {};
    postChannel.subscribe(listener);

    return () => {
      postChannel.unsubscribe(listener);
    };
  }, [postChannel]);

  useEffect(() => {
    (async () => {
      if (currentUser) {
        const { data: post } = await supabase
          .from("posts")
          .select()
          .eq("id", postId)
          .single();

        setPost(post);
      }
    })();
  }, [supabase, postId, currentUser]);

  return (
    <div className="p-4 h-[calc(100vh-4.5rem)] flex flex-col overflow-y-auto">
      {post ? (
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium">Community Post</p>
            <div className="space-y-1">
              <h2 className="text-3xl font-bold tracking-tight">
                {post.title}
              </h2>
              <div className="text-muted-foreground text-sm">
                Post by{" "}
                {
                  community?.members.find((m) => m.id === post.author_id)
                    ?.username
                }
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="whitespace-pre-line">{post.content}</div>
          </div>
        </div>
      ) : (
        <div className="grow flex items-center justify-center">
          <Loader2 className="w-16 h-16 animate-spin" />
        </div>
      )}
    </div>
  );
}
